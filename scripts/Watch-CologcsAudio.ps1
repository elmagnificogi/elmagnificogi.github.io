#Requires -Version 5.1
<#
.SYNOPSIS
  监测 COLOGCS-1 (NVIDIA HDMI 音频) 端点状态变化，在掉线/抖动后防抖重启 Windows Audio。

.DESCRIPTION
  订阅 Microsoft-Windows-Audio/Operational 事件 ID 65。
  当 COLOGCS 出现 NewState=4(NOTPRESENT) 或 8(UNPLUGGED) 时启动防抖；
  安静 DebounceSeconds 后，若默认播放设备仍是 COLOGCS，则 Restart-Service Audiosrv。

  建议先加 -DryRun 跑几天，看日志会不会误触发，再去掉 -DryRun。

.PARAMETER DryRun
  只记录“将要重启”，不真正重启服务。

.PARAMETER DebounceSeconds
  状态抖动结束后再等多少秒才动作（默认 3）。

.PARAMETER CooldownSeconds
  两次重启之间的最短间隔（默认 60），防止连环重启。

.PARAMETER LogPath
  日志文件路径。

.EXAMPLE
  # 管理员 PowerShell，先演练：
  .\Watch-CologcsAudio.ps1 -DryRun

  # 确认日志合理后再正式：
  .\Watch-CologcsAudio.ps1
#>
[CmdletBinding()]
param(
    [switch]$DryRun,
    [int]$DebounceSeconds = 3,
    [int]$CooldownSeconds = 60,
    [string]$LogPath = "$env:USERPROFILE\Documents\Watch-CologcsAudio.log"
)

$ErrorActionPreference = 'Stop'

# COLOGCS-1 endpoint (from MMDevices)
$CologcsGuid = '{c0f526e3-e903-4246-a2fd-51faceb70d75}'
$CologcsIdFragment = 'c0f526e3-e903-4246-a2fd-51faceb70d75'

function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $line = '{0:yyyy-MM-dd HH:mm:ss.fff} [{1}] {2}' -f (Get-Date), $Level, $Message
    Write-Host $line
    Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
}

function Test-IsAdmin {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $p = New-Object Security.Principal.WindowsPrincipal($id)
    return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-DefaultRenderDeviceId {
    $code = @'
using System;
using System.Runtime.InteropServices;
public static class DefAudio {
  [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IMMDevice {
    int Activate(ref Guid id, int ctx, IntPtr p, [MarshalAs(UnmanagedType.IUnknown)] out object o);
    int OpenPropertyStore(int a, out IntPtr s);
    int GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);
  }
  [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IMMDeviceEnumerator {
    int EnumAudioEndpoints(int f, int m, out IntPtr c);
    int GetDefaultAudioEndpoint(int f, int r, out IMMDevice e);
  }
  [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class En {}
  public static string GetDefaultId() {
    var en = (IMMDeviceEnumerator)new En();
    IMMDevice d; en.GetDefaultAudioEndpoint(0, 0, out d); // eRender, eConsole
    string id; d.GetId(out id);
    return id ?? "";
  }
}
'@
    if (-not ('DefAudio' -as [type])) {
        Add-Type -TypeDefinition $code -ErrorAction Stop
    }
    return [DefAudio]::GetDefaultId()
}

function Test-DefaultIsCologcs {
    try {
        $id = Get-DefaultRenderDeviceId
        return ($id -match [regex]::Escape($CologcsIdFragment))
    } catch {
        Write-Log "读取默认设备失败: $($_.Exception.Message)" 'WARN'
        return $false
    }
}

function Get-CologcsDeviceState {
    $p = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render\$CologcsGuid"
    if (-not (Test-Path $p)) { return $null }
    return (Get-ItemProperty $p).DeviceState
}

function Invoke-AudioRestart {
    param([string]$Reason)

    if (-not (Test-DefaultIsCologcs)) {
        Write-Log "跳过重启：当前默认播放设备不是 COLOGCS。原因=$Reason" 'SKIP'
        return
    }

    $state = Get-CologcsDeviceState
    # 1=ACTIVE；若仍掉线则等下次事件
    if ($state -ne 1) {
        Write-Log "跳过重启：COLOGCS DeviceState=$state（尚未回到 ACTIVE）。原因=$Reason" 'SKIP'
        return
    }

    if ($script:LastRestartUtc) {
        $elapsed = ([datetime]::UtcNow - $script:LastRestartUtc).TotalSeconds
        if ($elapsed -lt $CooldownSeconds) {
            Write-Log ("跳过重启：冷却中，距上次 {0:N0}s / 需 {1}s。原因={2}" -f $elapsed, $CooldownSeconds, $Reason) 'SKIP'
            return
        }
    }

    if ($DryRun) {
        Write-Log "[DryRun] 将重启 Audiosrv。原因=$Reason DeviceState=$state" 'DRY'
        $script:LastRestartUtc = [datetime]::UtcNow
        return
    }

    Write-Log "重启 Audiosrv。原因=$Reason DeviceState=$state" 'ACTION'
    try {
        Restart-Service -Name Audiosrv -Force -ErrorAction Stop
        Start-Sleep -Seconds 1
        $svc = Get-Service Audiosrv
        Write-Log "Audiosrv 状态=$($svc.Status)" 'ACTION'
        $script:LastRestartUtc = [datetime]::UtcNow
    } catch {
        Write-Log "重启失败: $($_.Exception.Message)" 'ERROR'
    }
}

# --- debounce state ---
$script:PendingDrop = $false
$script:DebounceTimer = $null
$script:LastRestartUtc = $null
$script:EventCount = 0
$script:DropCount = 0

function Reset-DebounceTimer {
    if ($script:DebounceTimer) {
        $script:DebounceTimer.Stop()
        $script:DebounceTimer.Dispose()
        $script:DebounceTimer = $null
    }
}

function Start-DebounceTimer {
    Reset-DebounceTimer
    Unregister-Event -SourceIdentifier 'CologcsDebounce' -ErrorAction SilentlyContinue
    Get-Event -SourceIdentifier 'CologcsDebounce' -ErrorAction SilentlyContinue | Remove-Event -ErrorAction SilentlyContinue
    $t = New-Object System.Timers.Timer
    $t.Interval = [Math]::Max(500, $DebounceSeconds * 1000)
    $t.AutoReset = $false
    Register-ObjectEvent -InputObject $t -EventName Elapsed -SourceIdentifier 'CologcsDebounce' -Action {
        $Global:CologcsWatchPending = $true
    } | Out-Null
    $script:DebounceTimer = $t
    $t.Start()
}

if (-not $DryRun -and -not (Test-IsAdmin)) {
    Write-Error '正式重启 Audiosrv 需要管理员权限。请用“以管理员身份运行”打开 PowerShell，或先加 -DryRun 演练。'
    exit 1
}

New-Item -ItemType File -Path $LogPath -Force | Out-Null
Write-Log "启动监测 DryRun=$DryRun Debounce=${DebounceSeconds}s Cooldown=${CooldownSeconds}s"
Write-Log "目标 GUID=$CologcsGuid 默认是COLOGCS=$(Test-DefaultIsCologcs) DeviceState=$(Get-CologcsDeviceState)"
Write-Log '按 Ctrl+C 结束。'

$query = @'
<QueryList>
  <Query Id="0" Path="Microsoft-Windows-Audio/Operational">
    <Select Path="Microsoft-Windows-Audio/Operational">*[System[(EventID=65)]]</Select>
  </Query>
</QueryList>
'@

$selector = New-Object System.Diagnostics.Eventing.Reader.EventLogQuery(
    'Microsoft-Windows-Audio/Operational',
    [System.Diagnostics.Eventing.Reader.PathType]::LogName,
    $query
)
$watcher = New-Object System.Diagnostics.Eventing.Reader.EventLogWatcher($selector)
$watcher.Enabled = $false

Register-ObjectEvent -InputObject $watcher -EventName EventRecordWritten -SourceIdentifier 'CologcsAudio65' -Action {
    try {
        $rec = $Event.SourceEventArgs.EventRecord
        if (-not $rec) { return }
        $xml = [xml]$rec.ToXml()
        $map = @{}
        foreach ($n in $xml.Event.EventData.Data) {
            if ($n.Name) { $map[$n.Name] = $n.'#text' }
        }
        $devId = $map['DeviceId']
        if ($devId -notmatch 'c0f526e3-e903-4246-a2fd-51faceb70d75') { return }

        $newState = $map['NewState']
        $Global:CologcsWatchQueue.Enqueue([pscustomobject]@{
            Time     = $rec.TimeCreated
            NewState = $newState
        })
    } catch {
        # swallow in event thread
    }
} | Out-Null

# 事件回调与主循环通过此队列传递（用 .NET 队列避免 PS lock 语法问题）
$Global:CologcsWatchQueue = New-Object 'System.Collections.Concurrent.ConcurrentQueue[object]'
$Global:CologcsWatchPending = $false

$watcher.Enabled = $true
Write-Log '已订阅 Microsoft-Windows-Audio/Operational EventID=65'

try {
    while ($true) {
        Start-Sleep -Milliseconds 200

        $item = $null
        while ($Global:CologcsWatchQueue.TryDequeue([ref]$item)) {
            $script:EventCount++
            $stName = switch ($item.NewState) {
                '1' { 'ACTIVE' }
                '4' { 'NOTPRESENT' }
                '8' { 'UNPLUGGED' }
                default { $item.NewState }
            }
            Write-Log ("COLOGCS Event65 NewState={0} ({1})" -f $item.NewState, $stName)

            if ($item.NewState -in @('4', '8')) {
                $script:DropCount++
                $script:PendingDrop = $true
                Start-DebounceTimer
                Write-Log "检测到掉线态，启动 ${DebounceSeconds}s 防抖..."
            }
            $item = $null
        }

        if ($Global:CologcsWatchPending) {
            $Global:CologcsWatchPending = $false
            Get-Event -SourceIdentifier 'CologcsDebounce' -ErrorAction SilentlyContinue | Remove-Event -ErrorAction SilentlyContinue
            if ($script:PendingDrop) {
                $script:PendingDrop = $false
                Invoke-AudioRestart -Reason "Event65 掉线后防抖结束 (累计掉线事件=$($script:DropCount))"
            }
        }
    }
} finally {
    try { $watcher.Enabled = $false; $watcher.Dispose() } catch {}
    Get-EventSubscriber | Where-Object { $_.SourceIdentifier -in @('CologcsAudio65', 'CologcsDebounce') } | Unregister-Event -Force -ErrorAction SilentlyContinue
    Get-Event -ErrorAction SilentlyContinue | Where-Object { $_.SourceIdentifier -in @('CologcsAudio65', 'CologcsDebounce') } | Remove-Event -ErrorAction SilentlyContinue
    Reset-DebounceTimer
    Write-Log "退出。Event65(COLOGCS)=$($script:EventCount) Drop标记=$($script:DropCount)"
}
