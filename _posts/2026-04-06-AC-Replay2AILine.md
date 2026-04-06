---
layout:     post
title:      "AC录像转行车线与轨迹分析"
subtitle:   "神力科莎，AILine，acreplay，Cursor"
date:       2026-04-06
update:     2026-04-06
author:     "elmagnifico"
header-img: "img/z8.jpg"
catalog:    true
tobecontinued: false
tags:
    - AC
    - Game
    - Car
---

## Foreword

AC模拟器跑完的结果或者录像一直都有，但是缺少具体分析，也没找到类似的分析工具，不如自己写一个，刚好利用Cursor来完全做一个项目，我不写一行代码，仅仅做分析和指导方向，看看是否AI能实现我的全部要求，也能观察转成AI写代码时，我们的输入到底要做到什么程度，这个东西才足够好用或者能够工程化。



## ACReplay2AILine

第一个需求其实是比较简单的，分析acreplay的文件格式，然后将其转变成ideal_line.ai的格式。

做之前第一步是询问AI，是否能实现将录像轨迹转成AI行车线，AI表示可以，并且给了几个方案，这里我审过以后，确认了基础实现的技术线路。

![image-20260406163337535](https://img.elmagnifico.tech/static/upload/elmagnifico/202604061633689.png)

如果要我去找AC相关mod的制作信息并且了解清楚行车线和地图相关数据关系，还是比较耗时的，这里AI直接快速解决了问题。

核心结论就是只要非内置的行车线，就可以自行替代，而现在mod级别都不会内置行车线，恰恰方便了行车线的替换逻辑



当然也问了一下是否能根据车型、参数设置、赛道等等直接生成最优行车线，这里由于数据不全，所以AI回答也比较模糊，实际上AC有类似的Mod，但是那种行车线还是有延迟，而且不是很准。



接着就是先做一个最小的MVP，给出最核心的需求，先看一下是否能够实现。

```
根据回放1.388.acreplay文件转成zhuhai\data\ideal_line.ai格式，并替代
```

实际上给出这些命令，Cursor就已经完成了核心转换逻辑，实际测试确实替代了老的行车线，但是行车线还存在一些重复的部分并且刹车和油门的提示是错误的，但是轨迹基本都是正确的。

- 仔细回看，实际上给出来的命令并没有说明要做到刹车油门提示正确，只是说替换一个轨迹而已，所以AI也只是做了这么多内容



基于上面的逻辑，让AI补充提取逻辑

```
结合记录中的刹车和油门信号，补充到行车线中使用红色或者绿色提示
```

到这一步，AI直接理解了，并且刹车和油门提示正确了，但是还是有问题，acreplay中飞行圈有时候不一定是第一圈，存在半圈或者开场圈的一点点路径，AI把这部分内容也弄进去，导致一部分轨迹是错误的

```
根据记录的计时点开始和结束位置，提取轨迹路径
```

给完这个以后，AI自动理解了计时开始应该从0，结束的时间应该比较长，到这里提取出来的轨迹就是相对完美的了，实际生成的ideal_line.ai已经是我要的轨迹线了

给出更多acreplay文件进行测试，AI自动发现了飞行圈选择的问题，他自己增加了参数选择第n圈，但是实际上我们需要的是最快圈速的那一圈，这一步应该自动选择，而不是还要用户输入

```
自动识别acreplay中圈速最快的一圈作为提取的轨迹
```

到这里ACReplay2AILine就完全正常工作了

```powershell
#Requires -Version 5.1
<#
.SYNOPSIS
  用 acrp 解析录像，将轨迹写入任意赛道的 data\ideal_line.ai（版本 7）。
.DESCRIPTION
  简易用法（acrp.exe 与脚本同目录为默认）:
    powershell -ExecutionPolicy Bypass -File .\BuildIdealLineFromReplay.ps1 `
      -Replay "C:\path\lap.acreplay" -TrackFolder "C:\...\content\tracks\zhuhai"

  多车手录像请指定 -DriverName。已导出 JSON 时可省略 -Replay，改用 -JsonPath。

  -TrackFolder: 赛道根目录（其下应有 data\ideal_line.ai，除非用 -IdealLinePath 覆盖）。
  -AcRpPath:  默认 = 脚本目录\acrp.exe

  路径可为绝对路径（如 C:\...\x.acreplay）、相对当前目录、或 ~ 开头（用户主目录）；首尾引号会自动去掉。

  轨迹与赛道：ideal_line 只按录像里的世界坐标 x/y/z 重采样，与「目标赛道文件夹」无自动校验，
  请自行保证录像对应该赛道。计时线模式：在起点 currentLap 等于 -Lap 的若干区间中，直接取弧长最长的一段作为一圈（出场短段自然被排除）。

  -Lap 对应录像 JSON 里的 currentLap 整型（通常第 1 圈=0，第 2 圈=1 …），不限于 0/1；第 N 圈飞行一般传 N-1。
  不确定时用 -ShowLapHints 列出每个计时区间起点的 currentLap。
#>
[CmdletBinding()]
param(
    [string]$Replay,
    [string]$TrackFolder,
    [string]$AcRpPath,
    [string]$DriverName,
    [string]$JsonPath,
    [string]$CsvPath,
    [string]$IdealLinePath,
    [int]$Lap = 0,
    [bool]$UseTimingLine = $true,
    [double]$MinSegmentMeters = 50.0,
    [double]$DedupePlanarMin = 0.05,
    [switch]$WhatIf,
    [switch]$KeepTempJson,
    [switch]$ShowLapHints
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-FsPath([string]$Path) {
    if ($null -eq $Path -or [string]::IsNullOrWhiteSpace($Path)) { return $Path }
    $p = $Path.Trim()
    while ($p.Length -ge 2 -and $p.StartsWith('"') -and $p.EndsWith('"')) {
        $p = $p.Substring(1, $p.Length - 2).Trim()
    }
    if ($p.StartsWith('~')) {
        $rest = $p.Substring(1).TrimStart('\', '/')
        $p = if ($rest) { Join-Path $HOME $rest } else { $HOME }
    }
    return [IO.Path]::GetFullPath($p)
}

function Show-Usage {
    Write-Host @"
用法:
  BuildIdealLineFromReplay.ps1 -Replay <录像.acreplay> -TrackFolder <赛道文件夹> [选项]

必填（二选一）:
  -Replay         Assetto Corsa 录像路径
  -TrackFolder     赛道根目录（内含 data\ideal_line.ai）

或已手动用 acrp 导出:
  -JsonPath / -CsvPath  与 -IdealLinePath（或 -TrackFolder）

常用选项:
  -DriverName      多车时指定车手名（传给 acrp --driver-name）
  -AcRpPath        默认: 脚本所在目录\acrp.exe
  -IdealLinePath   默认: <TrackFolder>\data\ideal_line.ai
  -Lap             与录像 currentLap 一致（第 2 圈多为 1，第 3 圈多为 2，依此类推）
  -ShowLapHints    只打印计时线分段与每段起点 currentLap，不写 ideal_line（仅需 JSON）
  -MinSegmentMeters  计时线模式下，若「该 Lap 最长区间」弧长仍小于此值(m)则放弃切段（防数据损坏），默认 50
  -UseTimingLine:`$false  关闭计时线截取
  -WhatIf          只预览不写文件

示例:
  powershell -ExecutionPolicy Bypass -File .\BuildIdealLineFromReplay.ps1 `
    -Replay ".\my.acreplay" -TrackFolder "..\zhuhai"
"@
}

$scriptDir = $null
if ($PSCommandPath) {
    $scriptDir = Split-Path -LiteralPath $PSCommandPath
} elseif ($PSScriptRoot) {
    $scriptDir = $PSScriptRoot
} else {
    try {
        $exePath = [System.Diagnostics.Process]::GetCurrentProcess().MainModule.FileName
        if ($exePath -and (Test-Path -LiteralPath $exePath)) {
            $scriptDir = Split-Path -LiteralPath $exePath
        }
    } catch { }
    if (-not $scriptDir) {
        $a0 = [Environment]::GetCommandLineArgs()[0]
        if ($a0 -and (Test-Path -LiteralPath $a0)) {
            $scriptDir = Split-Path -LiteralPath $a0
        } else {
            $scriptDir = (Get-Location).Path
        }
    }
}
if (-not $scriptDir) { throw 'Cannot resolve script directory (expected exe or .ps1 path).' }
if (-not $AcRpPath -or [string]::IsNullOrWhiteSpace($AcRpPath)) {
    $AcRpPath = Join-Path $scriptDir 'acrp.exe'
} else {
    $AcRpPath = Resolve-FsPath $AcRpPath
}

$useJson = $false
$tempWork = $null

if ($Replay) {
    if (-not $TrackFolder) { throw "使用 -Replay 时必须同时指定 -TrackFolder（赛道根目录）。" }
    if (-not (Test-Path -LiteralPath $AcRpPath)) {
        throw "找不到 acrp.exe: $AcRpPath （可设置 -AcRpPath，或把 acrp.exe 放在脚本同目录）"
    }
    $replayFull = Resolve-FsPath $Replay
    if (-not (Test-Path -LiteralPath $replayFull)) { throw "找不到录像: $replayFull" }

    $trackFull = Resolve-FsPath $TrackFolder
    if (-not (Test-Path -LiteralPath $trackFull -PathType Container)) {
        throw "赛道目录不存在: $trackFull"
    }
    if (-not $IdealLinePath) {
        # "指定在哪里就在哪里"：默认不再强制落到 data 子目录。
        $IdealLinePath = Resolve-FsPath (Join-Path $trackFull 'ideal_line.ai')
    } else {
        # 相对路径按当前工作目录解析，不再强制挂到 TrackFolder。
        $IdealLinePath = Resolve-FsPath $IdealLinePath
    }

    $tempWork = Join-Path ([IO.Path]::GetTempPath()) ('ac_ideal_' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tempWork -Force | Out-Null
    $outPrefix = Join-Path $tempWork 'acrp_out'

    $argList = New-Object System.Collections.Generic.List[string]
    [void]$argList.Add('-o')
    [void]$argList.Add($outPrefix)
    if ($DriverName) {
        [void]$argList.Add('--driver-name')
        [void]$argList.Add($DriverName)
    }
    [void]$argList.Add($replayFull)

    Write-Host "运行 acrp: $AcRpPath"
    $proc = Start-Process -FilePath $AcRpPath -ArgumentList $argList.ToArray() -Wait -PassThru -NoNewWindow
    if ($proc.ExitCode -ne 0) {
        if (-not $KeepTempJson) { Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue }
        throw "acrp.exe 退出码 $($proc.ExitCode)"
    }

    $jsonFiles = @(Get-ChildItem -LiteralPath $tempWork -Filter *.json -File | Sort-Object LastWriteTime -Descending)
    if ($jsonFiles.Count -eq 0) {
        if (-not $KeepTempJson) { Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue }
        throw "acrp 未在临时目录生成 JSON: $tempWork"
    }
    if ($jsonFiles.Count -gt 1 -and -not $DriverName) {
        if (-not $KeepTempJson) { Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue }
        throw "生成多个 JSON（多车？），请添加 -DriverName 指定车手。文件: $($jsonFiles.Name -join ', ')"
    }
    $JsonPath = $jsonFiles[0].FullName
    Write-Host "已解析: $JsonPath"
    $useJson = $true
} elseif ($JsonPath -or $CsvPath) {
    if ($JsonPath -and $CsvPath) { throw "请只指定 -JsonPath 或 -CsvPath 其中之一。" }
    if ($JsonPath) {
        $JsonPath = Resolve-FsPath $JsonPath
        if (-not (Test-Path -LiteralPath $JsonPath)) { throw "找不到 JSON: $JsonPath" }
        $useJson = $true
    } else {
        $CsvPath = Resolve-FsPath $CsvPath
        if (-not (Test-Path -LiteralPath $CsvPath)) { throw "找不到 CSV: $CsvPath" }
    }
    if (-not $IdealLinePath) {
        if (-not $TrackFolder) {
            if ($ShowLapHints -and $JsonPath) {
                $IdealLinePath = Join-Path ([IO.Path]::GetTempPath()) '_BuildIdealLine_skip.ai'
            } else {
                throw "使用 -JsonPath/-CsvPath 且未指定 -IdealLinePath 时，需要 -TrackFolder。"
            }
        } else {
            # "指定在哪里就在哪里"：默认不再强制落到 data 子目录。
            $IdealLinePath = Resolve-FsPath (Join-Path (Resolve-FsPath $TrackFolder) 'ideal_line.ai')
        }
    } else {
        # 相对路径按当前工作目录解析，不再依赖 TrackFolder 作为基准。
        $IdealLinePath = Resolve-FsPath $IdealLinePath
    }
} else {
    Show-Usage
    throw "请提供 -Replay 与 -TrackFolder，或提供 -JsonPath / -CsvPath。"
}

if (-not $ShowLapHints) {
    if (-not (Test-Path -LiteralPath $IdealLinePath) -and $TrackFolder) {
        $trackBase = Resolve-FsPath $TrackFolder
        $fallbackTemplate = Join-Path $trackBase 'data\ideal_line.ai'
        if (Test-Path -LiteralPath $fallbackTemplate) {
            $outDir = Split-Path -Parent $IdealLinePath
            if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
                New-Item -ItemType Directory -Path $outDir -Force | Out-Null
            }
            Copy-Item -LiteralPath $fallbackTemplate -Destination $IdealLinePath -Force
            Write-Host "未找到目标 ideal_line.ai，已从模板复制: $fallbackTemplate -> $IdealLinePath"
        }
    }
    if (-not (Test-Path -LiteralPath $IdealLinePath)) {
        if ($tempWork -and -not $KeepTempJson) { Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue }
        throw "找不到 ideal_line.ai: $IdealLinePath"
    }
}

# --- 解析轨迹并写 ideal_line ---

function Parse-CsvLine([string]$line) {
    $cells = New-Object System.Collections.Generic.List[string]
    $cur = New-Object System.Text.StringBuilder
    $inQ = $false
    for ($i = 0; $i -lt $line.Length; $i++) {
        $c = $line[$i]
        if ($c -eq '"') {
            $inQ = -not $inQ
        } elseif (($c -eq ',') -and -not $inQ) {
            [void]$cells.Add($cur.ToString())
            [void]$cur.Clear()
        } else {
            [void]$cur.Append($c)
        }
    }
    [void]$cells.Add($cur.ToString())
    return ,$cells.ToArray()
}

function Get-SfCrossingIndices($j) {
    $cross = New-Object System.Collections.Generic.List[int]
    $nF = $j.currentLapTime.Count
    for ($i = 1; $i -lt $nF; $i++) {
        $a = [int]$j.currentLapTime[$i - 1]
        $b = [int]$j.currentLapTime[$i]
        $lapInc = [int]$j.currentLap[$i] - [int]$j.currentLap[$i - 1]
        if (($a - $b -gt 500) -or ($lapInc -gt 0)) {
            $prev = if ($cross.Count -gt 0) { $cross[$cross.Count - 1] } else { -9999 }
            if (($i - $prev) -gt 2) { [void]$cross.Add($i) }
        }
    }
    return $cross
}

function Measure-ArcJson($j, [int]$i0, [int]$i1Exclusive) {
    $s = 0.0
    $px = $null; $py = $null; $pz = $null
    for ($i = $i0; $i -lt $i1Exclusive; $i++) {
        $x = [double]$j.x[$i]; $y = [double]$j.y[$i]; $z = [double]$j.z[$i]
        if ($null -ne $px) {
            $dx = $x - $px; $dy = $y - $py; $dz = $z - $pz
            $s += [Math]::Sqrt($dx * $dx + $dy * $dy + $dz * $dz)
        }
        $px = $x; $py = $y; $pz = $z
    }
    return $s
}

function Select-TimingSegment($j, [int]$Lap, [double]$MinSegmentMeters) {
    $cross = Get-SfCrossingIndices $j
    if ($cross.Count -lt 2) {
        return @{ Start = -1; End = -1; Length = 0.0; Mode = 'no_crossings' }
    }
    $bestLen = -1.0
    $bestA = -1
    $bestB = -1
    for ($k = 0; $k -lt $cross.Count - 1; $k++) {
        $a = $cross[$k]
        $b = $cross[$k + 1]
        if ([int]$j.currentLap[$a] -ne $Lap) { continue }
        $len = Measure-ArcJson $j $a $b
        if ($len -gt $bestLen) {
            $bestLen = $len
            $bestA = $a
            $bestB = $b
        }
    }
    if ($bestA -lt 0) {
        return @{ Start = -1; End = -1; Length = 0.0; Mode = 'no_match' }
    }
    if ($bestLen -lt $MinSegmentMeters) {
        return @{ Start = -1; End = -1; Length = $bestLen; Mode = 'segment_too_short' }
    }
    return @{ Start = $bestA; End = $bestB; Length = $bestLen; Mode = 'longest_for_lap' }
}

if ($ShowLapHints) {
    if (-not $useJson) { throw "-ShowLapHints 仅支持 JSON（-Replay 或 -JsonPath），不支持 CSV。" }
    $jh = Get-Content -LiteralPath $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $jh.currentLap -or -not $jh.currentLapTime) {
        throw "JSON 缺少 currentLap 或 currentLapTime，无法分析计时线。"
    }
    $nH = $jh.currentLap.Count
    if ($jh.currentLapTime.Count -ne $nH) { throw "currentLap 与 currentLapTime 长度不一致。" }
    $xc = Get-SfCrossingIndices $jh
    Write-Host "=== ShowLapHints: $JsonPath ==="
    Write-Host "帧数=$nH  检测到计时线交叉索引数=$($xc.Count)"
    Write-Host "（过线后该帧的 currentLap 即「已开始计时的那一圈」编号，通常从 0 递增）"
    for ($ki = 0; $ki -lt $xc.Count; $ki++) {
        $ix = $xc[$ki]
        Write-Host ("  交叉#{0}: frame={1}  currentLap={2}  currentLapTime={3} ms" -f $ki, $ix, [int]$jh.currentLap[$ix], [int]$jh.currentLapTime[$ix])
    }
    for ($ki = 0; $ki -lt $xc.Count - 1; $ki++) {
        $a = $xc[$ki]
        $b = $xc[$ki + 1]
        $alen = Measure-ArcJson $jh $a $b
        $lapAtStart = [int]$jh.currentLap[$a]
        Write-Host ("  区间 frame {0}..{1}: 起点 currentLap={2}  弧长约 {3:F1} m  （同 Lap 多段时脚本取最长段）" -f $a, $b, $lapAtStart, $alen)
    }
    Write-Host "当前默认 -Lap=$Lap；若飞行圈是「第 3 圈」且 AC 从 0 编号，多为 -Lap 2。"
    if ($tempWork -and (Test-Path -LiteralPath $tempWork) -and -not $KeepTempJson) {
        Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue
    }
    exit 0
}

try {
$pts = New-Object System.Collections.Generic.List[object]
$hasPedals = $false
$timingMode = 'n/a'
if ($useJson) {
    $j = Get-Content -LiteralPath $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $j.x -or -not $j.y -or -not $j.z) { throw "JSON 缺少 x/y/z 数组（请确认为 acrp 导出）。" }
    if (-not $j.currentLap) { throw "JSON 缺少 currentLap 数组。" }
    $nF = $j.x.Count
    if ($j.y.Count -ne $nF -or $j.z.Count -ne $nF -or $j.currentLap.Count -ne $nF) {
        throw "JSON 中 x/y/z/currentLap 长度不一致。"
    }
    if ($j.gas -and $j.brake -and ($j.gas.Count -eq $nF) -and ($j.brake.Count -eq $nF)) {
        $hasPedals = $true
    }

    $iStart = 0
    $iEnd = $nF
    $timingUsed = $false
    if (-not $UseTimingLine) {
        $timingMode = 'timing_disabled'
    } elseif ($j.currentLapTime -and ($j.currentLapTime.Count -eq $nF)) {
        $seg = Select-TimingSegment $j $Lap $MinSegmentMeters
        if ($seg.Start -ge 0) {
            $iStart = $seg.Start
            $iEnd = $seg.End
            $timingUsed = $true
            $timingMode = $seg.Mode
        } elseif ($seg.Mode -eq 'segment_too_short') {
            $timingMode = 'segment_too_short'
            Write-Warning ("计时线切段: 该 Lap 下最长区间仅 {0:F1} m，低于 -MinSegmentMeters ({1} m)，已放弃切段。可调小 -MinSegmentMeters 或检查录像。" -f $seg.Length, $MinSegmentMeters)
        } elseif ($seg.Mode -eq 'no_crossings') {
            $timingMode = 'no_crossings'
            Write-Warning "录像中未检测到计时线交叉（currentLapTime/圈数变化），已按整段 -Lap 过滤取点。"
        } else {
            $timingMode = 'lap_filter_pending'
        }
    } else {
        $timingMode = 'no_currentLapTime'
        Write-Warning "JSON 无 currentLapTime 或与帧数不一致，已跳过计时线切段，仅按 -Lap 过滤。"
    }

    for ($i = $iStart; $i -lt $iEnd; $i++) {
        if (-not $timingUsed) {
            if ([int]$j.currentLap[$i] -ne $Lap) { continue }
        }
        $g = if ($hasPedals) { [int]$j.gas[$i] } else { 0 }
        $bk = if ($hasPedals) { [int]$j.brake[$i] } else { 0 }
        if ($g -lt 0) { $g = 0 } elseif ($g -gt 255) { $g = 255 }
        if ($bk -lt 0) { $bk = 0 } elseif ($bk -gt 255) { $bk = 255 }
        [void]$pts.Add([pscustomobject]@{
                X = [float][double]$j.x[$i]
                Y = [float][double]$j.y[$i]
                Z = [float][double]$j.z[$i]
                G = $g
                Bk = $bk
            })
    }
    if ($UseTimingLine -and -not $timingUsed) {
        if ($timingMode -eq 'lap_filter_pending') { $timingMode = 'no_segment_for_lap' }
        Write-Warning "未找到起点 currentLap=$Lap 的计时区间（或交叉点不足），已回退为整段 Lap 过滤。可运行 -ShowLapHints 查看每段起点应对的 -Lap，或 -UseTimingLine:`$false。"
    }
} else {
    $timingMode = 'csv'
    $hdr = Get-Content -LiteralPath $CsvPath -TotalCount 1 -Encoding UTF8
    $names = Parse-CsvLine $hdr
    $ixX = [array]::IndexOf($names, 'position.x')
    $ixY = [array]::IndexOf($names, 'position.y')
    $ixZ = [array]::IndexOf($names, 'position.z')
    $ixLap = [array]::IndexOf($names, 'currentLap')
    $ixGas = [array]::IndexOf($names, 'gas')
    $ixBrake = [array]::IndexOf($names, 'brake')
    if ($ixX -lt 0 -or $ixY -lt 0 -or $ixZ -lt 0) { throw "CSV 缺少 position.x/y/z 列，请确认由 acreplay-parser 导出。" }
    if ($ixLap -lt 0) { throw "CSV 缺少 currentLap 列。" }
    if ($ixGas -ge 0 -and $ixBrake -ge 0) { $hasPedals = $true }

    $reader = [IO.StreamReader]::new($CsvPath, [Text.Encoding]::UTF8, $true)
    try {
        [void]$reader.ReadLine()
        while ($null -ne ($line = $reader.ReadLine())) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $c = Parse-CsvLine $line
            if ($c.Count -le [Math]::Max($ixX, [Math]::Max($ixY, [Math]::Max($ixZ, $ixLap)))) { continue }
            $lapVal = 0
            [void][int]::TryParse($c[$ixLap].Trim(), [ref]$lapVal)
            if ($lapVal -ne $Lap) { continue }
            $x = [double]::Parse($c[$ixX].Trim(), [Globalization.CultureInfo]::InvariantCulture)
            $y = [double]::Parse($c[$ixY].Trim(), [Globalization.CultureInfo]::InvariantCulture)
            $z = [double]::Parse($c[$ixZ].Trim(), [Globalization.CultureInfo]::InvariantCulture)
            $g = 0; $bk = 0
            if ($hasPedals) {
                [void][int]::TryParse($c[$ixGas].Trim(), [ref]$g)
                [void][int]::TryParse($c[$ixBrake].Trim(), [ref]$bk)
            }
            if ($g -lt 0) { $g = 0 } elseif ($g -gt 255) { $g = 255 }
            if ($bk -lt 0) { $bk = 0 } elseif ($bk -gt 255) { $bk = 255 }
            [void]$pts.Add([pscustomobject]@{ X = [float]$x; Y = [float]$y; Z = [float]$z; G = $g; Bk = $bk })
        }
    } finally { $reader.Close() }
}

if ($DedupePlanarMin -gt 0 -and $pts.Count -gt 2) {
    $dd = New-Object System.Collections.Generic.List[object]
    [void]$dd.Add($pts[0])
    for ($di = 1; $di -lt $pts.Count; $di++) {
        $a = $dd[$dd.Count - 1]
        $b = $pts[$di]
        $dh = [Math]::Sqrt([double](($b.X - $a.X) * ($b.X - $a.X) + ($b.Z - $a.Z) * ($b.Z - $a.Z)))
        if ($dh -ge $DedupePlanarMin) { [void]$dd.Add($b) }
    }
    $pts = $dd
}

if ($pts.Count -lt 200) { throw "该圈采样点过少 ($($pts.Count))，请检查 -DriverName / -Lap / -UseTimingLine。" }

$clean = New-Object System.Collections.Generic.List[object]
[void]$clean.Add($pts[0])
for ($i = 1; $i -lt $pts.Count; $i++) {
    $a = $clean[$clean.Count - 1]
    $b = $pts[$i]
    $d = [Math]::Sqrt([double](($b.X - $a.X) * ($b.X - $a.X) + ($b.Z - $a.Z) * ($b.Z - $a.Z)))
    if ($d -lt 80.0) { [void]$clean.Add($b) }
}
$pts = $clean
if ($pts.Count -lt 200) { throw "过滤跳变后点数不足 ($($pts.Count))。" }

$segLen = New-Object double[] ($pts.Count)
$cum = New-Object double[] ($pts.Count)
$cum[0] = 0.0
for ($i = 1; $i -lt $pts.Count; $i++) {
    $dx = [double]$pts[$i].X - [double]$pts[$i - 1].X
    $dy = [double]$pts[$i].Y - [double]$pts[$i - 1].Y
    $dz = [double]$pts[$i].Z - [double]$pts[$i - 1].Z
    $segLen[$i] = [Math]::Sqrt($dx * $dx + $dy * $dy + $dz * $dz)
    $cum[$i] = $cum[$i - 1] + $segLen[$i]
}
$replayTotal = $cum[$pts.Count - 1]
if ($replayTotal -lt 100.0) { throw "该圈弧长异常短 ($replayTotal m)，请换 -Lap 或检查录像。" }

function Get-PointAtDistance([object[]]$p, [double[]]$c, [double]$dist) {
    if ($dist -le 0) { return $p[0] }
    $max = $c[$p.Length - 1]
    if ($dist -ge $max) { return $p[$p.Length - 1] }
    $lo = 0
    $hi = $p.Length - 1
    while ($hi - $lo -gt 1) {
        $mid = [int](($lo + $hi) / 2)
        if ($c[$mid] -le $dist) { $lo = $mid } else { $hi = $mid }
    }
    $i = $lo
    $t = if (($c[$i + 1] - $c[$i]) -gt 1e-6) { ($dist - $c[$i]) / ($c[$i + 1] - $c[$i]) } else { 0.0 }
    $ax = [double]$p[$i].X; $ay = [double]$p[$i].Y; $az = [double]$p[$i].Z
    $bx = [double]$p[$i + 1].X; $by = [double]$p[$i + 1].Y; $bz = [double]$p[$i + 1].Z
    return [pscustomobject]@{
        X = [float]($ax + $t * ($bx - $ax))
        Y = [float]($ay + $t * ($by - $ay))
        Z = [float]($az + $t * ($bz - $az))
    }
}

function Get-Pedal01AtDistance([object[]]$p, [double[]]$c, [double]$dist, [bool]$pickGas) {
    if ($dist -le 0) {
        $v = if ($pickGas) { [double]$p[0].G } else { [double]$p[0].Bk }
        return [float]($v / 255.0)
    }
    $max = $c[$p.Length - 1]
    if ($dist -ge $max) {
        $v = if ($pickGas) { [double]$p[$p.Length - 1].G } else { [double]$p[$p.Length - 1].Bk }
        return [float]($v / 255.0)
    }
    $lo = 0
    $hi = $p.Length - 1
    while ($hi - $lo -gt 1) {
        $mid = [int](($lo + $hi) / 2)
        if ($c[$mid] -le $dist) { $lo = $mid } else { $hi = $mid }
    }
    $i = $lo
    $tt = if (($c[$i + 1] - $c[$i]) -gt 1e-6) { ($dist - $c[$i]) / ($c[$i + 1] - $c[$i]) } else { 0.0 }
    $va = if ($pickGas) { [double]$p[$i].G } else { [double]$p[$i].Bk }
    $vb = if ($pickGas) { [double]$p[$i + 1].G } else { [double]$p[$i + 1].Bk }
    return [float](($va + $tt * ($vb - $va)) / 255.0)
}

$bytes = [IO.File]::ReadAllBytes($IdealLinePath)
$ver = [BitConverter]::ToInt32($bytes, 0)
if ($ver -ne 7) { throw "ideal_line 版本为 $ver，本脚本仅按版本 7 处理。" }
$n = [BitConverter]::ToInt32($bytes, 4)
if ($n -lt 10) { throw "点数异常: $n" }

$oldLens = New-Object float[] $n
for ($i = 0; $i -lt $n; $i++) {
    $o = 16 + $i * 20 + 12
    $oldLens[$i] = [BitConverter]::ToSingle($bytes, $o)
}
$oldMax = [double]$oldLens[$n - 1]
if ($oldMax -lt 1.0) { throw "原线累计长度异常。" }

if ($WhatIf) {
    $pedalNote = if ($hasPedals) { "写入 Gas/Brake" } else { "无油门刹车数据，不改颜色" }
    Write-Host "WhatIf: $IdealLinePath | $n 点 | Lap=$Lap | timing=$timingMode | 采样 $($pts.Count) | 弧长 $replayTotal m | 原线长 $oldMax m | $pedalNote"
    exit 0
}

$bak = $IdealLinePath + ".bak_" + (Get-Date -Format "yyyyMMdd_HHmmss")
Copy-Item -LiteralPath $IdealLinePath -Destination $bak -Force
Write-Host "已备份: $bak"

$newLens = New-Object float[] $n
for ($i = 0; $i -lt $n; $i++) {
    $frac = [double]$oldLens[$i] / $oldMax
    $d = $frac * $replayTotal
    $newLens[$i] = [float]$d
    $q = Get-PointAtDistance $pts $cum $d
    $o = 16 + $i * 20
    [Array]::Copy([BitConverter]::GetBytes($q.X), 0, $bytes, $o, 4)
    [Array]::Copy([BitConverter]::GetBytes($q.Y), 0, $bytes, $o + 4, 4)
    [Array]::Copy([BitConverter]::GetBytes($q.Z), 0, $bytes, $o + 8, 4)
    [Array]::Copy([BitConverter]::GetBytes($newLens[$i]), 0, $bytes, $o + 12, 4)
}

$PointExtraStride = 72
$nEx = [BitConverter]::ToInt32($bytes, 16 + 20 * $n)
$extraStart = 16 + 20 * $n + 4
if ($hasPedals -and ($nEx -eq $n) -and (($bytes.Length - $extraStart) -ge ($n * $PointExtraStride))) {
    $ptArr = $pts.ToArray()
    for ($i = 0; $i -lt $n; $i++) {
        $d = [double]$newLens[$i]
        $gas01 = Get-Pedal01AtDistance $ptArr $cum $d $true
        $brake01 = Get-Pedal01AtDistance $ptArr $cum $d $false
        $eo = $extraStart + $i * $PointExtraStride
        [Array]::Copy([BitConverter]::GetBytes($gas01), 0, $bytes, $eo + 4, 4)
        [Array]::Copy([BitConverter]::GetBytes($brake01), 0, $bytes, $eo + 8, 4)
    }
    Write-Host "已更新 PointsExtra 的 Gas/Brake。"
} elseif ($hasPedals) {
    Write-Warning "PointsExtra 与点数不匹配，已跳过颜色写入。"
}

[IO.File]::WriteAllBytes($IdealLinePath, $bytes)
Write-Host "完成: $IdealLinePath"
}
finally {
    if ($tempWork -and (Test-Path -LiteralPath $tempWork) -and -not $KeepTempJson) {
        Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue
    }
}

```



到这里ACReplay2AILine基本完成，但是还是存在一些问题，他只能修改ailine，并不能凭空生成，所以需要先把原本赛道的ailine拿到，才能改，然后其中未修改的值，可能有一部分是不对的或者不匹配的。

![image-20260406174421500](https://img.elmagnifico.tech/static/upload/elmagnifico/202604061744567.png)



## ACReplay Analysis

实现了上面的回放转行车线，我就思考是否可以把轨迹内容输出，并且和地图匹配到一起，这样就能单独看到自己在每个弯的刹车点、速度和开油点和对应的速度了，这样做分析完就可以模板化操作了。



实际想得还是太简单了，游戏内mod的数据给的太少了，赛道边界信息啥的都没给，而且现实中的T1-T14是人为定义的，实际上游戏内根本没有这个弯道定义，游戏内只是对赛道进行了3个segment的分段，要把现实和游戏的轨迹匹配上就有点困难了。

然后再说一个，游戏内是没有经纬度信息的，使用的xyz坐标系统，而现实T1-T14都不是，他们的经纬度信息缺少，这让匹配就更难了。



开始的几次尝试基本都失败了，回放轨迹和赛道匹配不上，比例大小都不正确，其实是缺少了赛道的宽度具体赛道边界曲线信息。

基于此放弃了赛道匹配，直接画轨迹，这个部分没问题，但是弯道匹配还是有误，T1-T14怎么都对不上，反复调整代码也不行，这个流程估计耗时两三个小时，最后放弃了。

直接使用轨迹和刹车点、开油点的逻辑，把每次操作的位置和此时时速都标识出来

![image-20260406175033265](https://img.elmagnifico.tech/static/upload/elmagnifico/202604061750341.png)

然后就得到了这样一张图，我成为 Action 图，操作图，可以清晰看到的每个地方大概是多少速度进行刹车，大概多少位置的时候开油

- 不过还是有点小问题，中间不给油或者保持油门的细节没有

这里比较麻烦的点是油门和刹车的判断，刹多少算刹车，持续多久算一次？同理油门，一开始沟通时没有给到这部分信息，让AI自主判断，但是结果是比较差的，出现各种奇怪情况，比如油门默认高时，不算油门上升，刹车默认高也不算刹车，上升比例要求的太多了，导致细节反馈不出来

反馈给AI以后再次生成，依然错误，甚至约错越厉害了，但是由于基础代码被改了，没有commit，导致最后一错到底，无法纠正回来了，只好放弃掉这部分AI，重新梳理逻辑，再重新对话写代码。

反复调试，增加约束调节以后，总算得到了一个正确的图，并且增加用例测试，得到的结果都还行

```powershell
#Requires -Version 5.1
<#
.SYNOPSIS
  Generic replay lap analyzer: detect brake/throttle onsets and render trajectory markers.
  If replay/corners data files are missing, they are auto-generated from the provided replay.
#>
param(
    [string]$JsonPath = '',
    [string]$TrackFolder = '',
    [string]$CornersJson = '',
    [string]$ReplayPath = '',
    [string]$AcRpPath = '',
    [string]$DriverName = '',
    [string]$OutputPath = '',
    [int]$Lap = 0,
    [bool]$AutoFastestLap = $true,
    [double]$MinSegmentMeters = 50.0,
    [int]$ImageWidth = 1800,
    [int]$ImageHeight = 1350,
    [double]$InnerMarginPercent = 5.0,
    [float]$FontSizeTitle = 20.0,
    [float]$FontSizeMarker = 14.0,
    [double]$BrakeMinSeconds = 0.3,
    [double]$ThrottleMinSeconds = 0.5,
    [int]$BrakePedalThreshold = 25,
    [int]$GasPedalThreshold = 180,
    [double]$GasReapplyMinSeconds = 0.06,
    [int]$GasReapplyThreshold = 60,
    [int]$GasReapplyDelta = 20,
    [int]$GasReapplyBrakeMax = 20,
    [bool]$AllowOverlapThrottleBetweenBrakes = $true,
    [double]$SectorExpandMeters = 20.0,
    [switch]$DebugEventTrace,
    [string]$DebugOutputPath = '',
    [switch]$HideCornerCenterLabel,
    [switch]$NoVerticalFlip,
    [switch]$FlipWorldZ
)

$ErrorActionPreference = 'Stop'
# PS2EXE 嵌入执行时 $PSScriptRoot / $PSCommandPath 可能为空；
# 优先使用进程主模块路径，确保在“当前目录不等于exe目录”时也能稳定定位工具目录。
$toolDir = $null
if ($PSCommandPath) {
    $toolDir = Split-Path -LiteralPath $PSCommandPath
} elseif ($PSScriptRoot) {
    $toolDir = $PSScriptRoot
} else {
    try {
        $exePath = [System.Diagnostics.Process]::GetCurrentProcess().MainModule.FileName
        if ($exePath -and (Test-Path -LiteralPath $exePath)) {
            $toolDir = Split-Path -LiteralPath $exePath
        }
    } catch { }
    if (-not $toolDir) {
        $a0 = [Environment]::GetCommandLineArgs()[0]
        if ($a0 -and (Test-Path -LiteralPath $a0)) {
            $toolDir = Split-Path -LiteralPath $a0
        } else {
            $toolDir = (Get-Location).Path
        }
    }
}
if (-not $toolDir) { throw 'Cannot resolve tool directory (expected exe or .ps1 path).' }
if (-not $TrackFolder) { $TrackFolder = Join-Path (Split-Path $toolDir -Parent) 'zhuhai' }
Add-Type -AssemblyName System.Drawing

$capPath = Join-Path $toolDir 'draw_trajectory_captions.json'
$cap = [pscustomobject]@{ sf = 'S/F'; titlePrefix = 'Replay Lap Analysis'; legend = 'Blue=track Orange=S/F Red=brake Green=throttle' }
if (Test-Path -LiteralPath $capPath) {
    $cj = Get-Content -LiteralPath $capPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($cj.sf) { $cap.sf = [string]$cj.sf }
    if ($cj.titlePrefix) { $cap.titlePrefix = [string]$cj.titlePrefix }
    if ($cj.legend) { $cap.legend = [string]$cj.legend }
}

function Resolve-FsPath([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return $Path }
    $p = $Path.Trim()
    while ($p.Length -ge 2 -and $p.StartsWith('"') -and $p.EndsWith('"')) {
        $p = $p.Substring(1, $p.Length - 2).Trim()
    }
    if ($p.StartsWith('~')) {
        $rest = $p.Substring(1).TrimStart('\', '/')
        $p = if ($rest) { Join-Path $HOME $rest } else { $HOME }
    }
    return [IO.Path]::GetFullPath($p)
}

function Get-FileStem([string]$pathOrName, [string]$fallback) {
    if ([string]::IsNullOrWhiteSpace($pathOrName)) { return $fallback }
    $nm = [IO.Path]::GetFileNameWithoutExtension($pathOrName)
    if ([string]::IsNullOrWhiteSpace($nm)) { return $fallback }
    return $nm
}

function Clamp-Int([int]$v, [int]$lo, [int]$hi) {
    if ($v -lt $lo) { return $lo }
    if ($v -gt $hi) { return $hi }
    return $v
}

function Get-SfCrossingIndices($j) {
    $cross = New-Object System.Collections.Generic.List[int]
    if (-not $j.currentLapTime -or ($j.currentLapTime.Count -ne $j.x.Count)) { return $cross }
    for ($i = 1; $i -lt $j.currentLapTime.Count; $i++) {
        $a = [int]$j.currentLapTime[$i - 1]; $b = [int]$j.currentLapTime[$i]
        $lapInc = [int]$j.currentLap[$i] - [int]$j.currentLap[$i - 1]
        if (($a - $b -gt 500) -or ($lapInc -gt 0)) {
            $prev = if ($cross.Count -gt 0) { $cross[$cross.Count - 1] } else { -9999 }
            if (($i - $prev) -gt 2) { [void]$cross.Add($i) }
        }
    }
    return $cross
}

function Measure-ArcJson($j, [int]$i0, [int]$i1Exclusive) {
    $s = 0.0; $px = $null; $py = $null; $pz = $null
    for ($i = $i0; $i -lt $i1Exclusive; $i++) {
        $x = [double]$j.x[$i]; $y = [double]$j.y[$i]; $z = [double]$j.z[$i]
        if ($null -ne $px) {
            $dx = $x - $px; $dy = $y - $py; $dz = $z - $pz
            $s += [Math]::Sqrt($dx * $dx + $dy * $dy + $dz * $dz)
        }
        $px = $x; $py = $y; $pz = $z
    }
    return $s
}

function Select-TimingSegment($j, [int]$LapVal, [double]$MinSeg) {
    $cross = Get-SfCrossingIndices $j
    if ($cross.Count -lt 2) { return @{ Start = -1; End = -1; Length = 0.0; Mode = 'no_crossings' } }
    $bestLen = -1.0; $bestA = -1; $bestB = -1
    for ($k = 0; $k -lt $cross.Count - 1; $k++) {
        $a = $cross[$k]; $b = $cross[$k + 1]
        if ([int]$j.currentLap[$a] -ne $LapVal) { continue }
        $len = Measure-ArcJson $j $a $b
        if ($len -gt $bestLen) { $bestLen = $len; $bestA = $a; $bestB = $b }
    }
    if ($bestA -lt 0) { return @{ Start = -1; End = -1; Length = 0.0; Mode = 'no_match' } }
    if ($bestLen -lt $MinSeg) { return @{ Start = -1; End = -1; Length = $bestLen; Mode = 'segment_too_short' } }
    return @{ Start = $bestA; End = $bestB; Length = $bestLen; Mode = 'ok' }
}

function Select-FastestTimingSegment($j, [double]$MinSeg) {
    $cross = Get-SfCrossingIndices $j
    if ($cross.Count -lt 2) { return @{ Start = -1; End = -1; Length = 0.0; Mode = 'no_crossings'; Lap = -1; TimeMs = -1 } }

    $best = $null
    for ($k = 0; $k -lt $cross.Count - 1; $k++) {
        $a = $cross[$k]; $b = $cross[$k + 1]
        $lapVal = [int]$j.currentLap[$a]
        $len = Measure-ArcJson $j $a $b
        if ($len -lt $MinSeg) { continue }

        $timeMs = -1
        if ($j.PSObject.Properties.Name -contains 'currentLapTime') {
            $ti = [int]$j.currentLapTime[[Math]::Max($a, $b - 1)]
            if ($ti -gt 0) { $timeMs = $ti }
        }
        if ($timeMs -le 0) {
            $dt = Get-FrameDtSeconds $j
            $timeMs = [int][Math]::Round(($b - $a) * $dt * 1000.0)
        }

        $cand = @{
            Start = $a
            End = $b
            Length = $len
            Mode = 'ok'
            Lap = $lapVal
            TimeMs = $timeMs
        }
        if ($null -eq $best -or $cand.TimeMs -lt $best.TimeMs) {
            $best = $cand
        }
    }

    if ($null -eq $best) { return @{ Start = -1; End = -1; Length = 0.0; Mode = 'no_valid_segment'; Lap = -1; TimeMs = -1 } }
    return $best
}

function Get-SpeedKmh($j, [int]$fi) {
    $vx = [double]$j.velocityX[$fi]; $vy = [double]$j.velocityY[$fi]; $vz = [double]$j.velocityZ[$fi]
    return [Math]::Sqrt($vx * $vx + $vy * $vy + $vz * $vz) * 3.6
}

function Get-FrameDtSeconds($j) {
    if ($j.PSObject.Properties.Name -contains 'recordingInterval') {
        $ri = [double]$j.recordingInterval
        if ($ri -gt 0 -and $ri -le 100.0) { return $ri / 1000.0 }
        if ($ri -gt 100.0) { return 1.0 / $ri }
    }
    return (1.0 / 60.0)
}

function Get-BoundariesFromSegmentEnds([double[]]$ends) {
    if ($ends.Count -ne 14) { throw 'segmentEndFraction must have 14 elements, last=1.0' }
    if ([Math]::Abs($ends[13] - 1.0) -gt 0.001) { throw 'segmentEndFraction[13] must be 1.0' }
    $b = New-Object double[] 15
    $b[0] = 0.0
    for ($i = 0; $i -lt 14; $i++) { $b[$i + 1] = $ends[$i] }
    return $b
}

function Find-KRangeForArc([double[]]$sArr, [double]$lapLen, [double]$f0, [double]$f1, [int]$m) {
    $s0 = [Math]::Max(0.0, $f0 * $lapLen)
    $s1 = [Math]::Min($lapLen, $f1 * $lapLen)
    $k0 = 0
    for ($k = 0; $k -lt $m; $k++) {
        if ($sArr[$k] -ge $s0) { $k0 = $k; break }
    }
    $k1 = $m - 1
    for ($k = $m - 1; $k -ge 0; $k--) {
        if ($sArr[$k] -le $s1) { $k1 = $k; break }
    }
    if ($k1 -lt $k0) { $k1 = $k0 }
    return $k0, $k1
}

function Find-KClosestToS([double[]]$sArr, [double]$targetS, [int]$k0, [int]$k1) {
    $best = $k0
    $bd = [Math]::Abs($sArr[$k0] - $targetS)
    for ($k = $k0; $k -le $k1; $k++) {
        $d = [Math]::Abs($sArr[$k] - $targetS)
        if ($d -lt $bd) { $bd = $d; $best = $k }
    }
    return $best
}

function Find-FirstSustainedAbove([int[]]$vals, [int]$k0, [int]$k1, [int]$thr, [int]$minFrames) {
    if ($minFrames -lt 1) { $minFrames = 1 }
    for ($start = $k0; $start -le $k1; $start++) {
        if ($vals[$start] -lt $thr) { continue }
        $ok = $true
        for ($i = 0; $i -lt $minFrames; $i++) {
            $kk = $start + $i
            if ($kk -gt $k1) { $ok = $false; break }
            if ($vals[$kk] -lt $thr) { $ok = $false; break }
        }
        if ($ok) { return $start }
    }
    return -1
}

function Find-FirstRisingSustainedAbove([int[]]$vals, [int]$k0, [int]$k1, [int]$thr, [int]$minFrames) {
    if ($minFrames -lt 1) { $minFrames = 1 }
    $st0 = [Math]::Max(1, $k0)
    for ($start = $st0; $start -le $k1; $start++) {
        # Rising edge: previous frame below threshold, current frame reaches threshold.
        if ($vals[$start - 1] -ge $thr) { continue }
        if ($vals[$start] -lt $thr) { continue }
        $ok = $true
        for ($i = 0; $i -lt $minFrames; $i++) {
            $kk = $start + $i
            if ($kk -gt $k1) { $ok = $false; break }
            if ($vals[$kk] -lt $thr) { $ok = $false; break }
        }
        if ($ok) { return $start }
    }
    return -1
}

function Find-FirstGasReapply([int[]]$gasVals, [int[]]$brkVals, [int]$k0, [int]$k1, [int]$minGas, [int]$minDelta, [int]$brakeMax, [int]$minFrames) {
    if ($minFrames -lt 1) { $minFrames = 1 }
    $st0 = [Math]::Max(1, $k0)
    for ($start = $st0; $start -le $k1; $start++) {
        if ($brkVals[$start] -gt $brakeMax) { continue }
        if ($gasVals[$start] -lt $minGas) { continue }
        if (($gasVals[$start] - $gasVals[$start - 1]) -lt $minDelta) { continue }
        $ok = $true
        for ($i = 0; $i -lt $minFrames; $i++) {
            $kk = $start + $i
            if ($kk -gt $k1) { $ok = $false; break }
            if ($gasVals[$kk] -lt $minGas) { $ok = $false; break }
            if ($brkVals[$kk] -gt $brakeMax) { $ok = $false; break }
        }
        if ($ok) { return $start }
    }
    return -1
}

function Find-FirstGasReapplyOverlap([int[]]$gasVals, [int]$k0, [int]$k1, [int]$minGas, [int]$minDelta, [int]$minFrames) {
    if ($minFrames -lt 1) { $minFrames = 1 }
    $st0 = [Math]::Max(1, $k0)
    for ($start = $st0; $start -le $k1; $start++) {
        if ($gasVals[$start] -lt $minGas) { continue }
        if (($gasVals[$start] - $gasVals[$start - 1]) -lt $minDelta) { continue }
        $ok = $true
        for ($i = 0; $i -lt $minFrames; $i++) {
            $kk = $start + $i
            if ($kk -gt $k1) { $ok = $false; break }
            if ($gasVals[$kk] -lt $minGas) { $ok = $false; break }
        }
        if ($ok) { return $start }
    }
    return -1
}

function Get-ContiguousRunEnd([int[]]$vals, [int]$start, [int]$k1, [int]$thr) {
    $e = $start
    for ($k = $start; $k -le $k1; $k++) {
        if ($vals[$k] -ge $thr) { $e = $k } else { break }
    }
    return $e
}

function Get-LongestRunAbove([int[]]$vals, [int]$k0, [int]$k1, [int]$thr) {
    if ($k1 -lt $k0) { return 0 }
    $best = 0
    $cur = 0
    for ($k = $k0; $k -le $k1; $k++) {
        if ($vals[$k] -ge $thr) {
            $cur++
            if ($cur -gt $best) { $best = $cur }
        } else {
            $cur = 0
        }
    }
    return $best
}

function New-CjkDrawingFont([float]$emSize, [System.Drawing.FontStyle]$style) {
    $unit = [System.Drawing.GraphicsUnit]::Point
    foreach ($n in @('Microsoft YaHei UI', 'Microsoft YaHei', 'SimHei', 'Segoe UI')) {
        try {
            $fam = New-Object System.Drawing.FontFamily $n
            if ($fam.IsStyleAvailable($style)) { return [System.Drawing.Font]::new($fam, $emSize, $style, $unit) }
        } catch { }
    }
    return [System.Drawing.Font]::new('Segoe UI', $emSize, $style, $unit)
}

function Ensure-ReplayJson([string]$TargetJsonPath, [string]$ReplayPathIn, [string]$AcRpPathIn, [string]$DriverNameIn) {
    if (Test-Path -LiteralPath $TargetJsonPath) { return }
    $acrp = if ([string]::IsNullOrWhiteSpace($AcRpPathIn)) { Join-Path $toolDir 'acrp.exe' } else { Resolve-FsPath $AcRpPathIn }
    if (-not (Test-Path -LiteralPath $acrp)) {
        throw "Replay JSON missing and acrp.exe not found: $acrp"
    }

    $replay = $ReplayPathIn
    if ([string]::IsNullOrWhiteSpace($replay)) {
        $rp = @(Get-ChildItem -LiteralPath $toolDir -Filter *.acreplay -File | Sort-Object LastWriteTime -Descending)
        if ($rp.Count -lt 1) { throw "Replay JSON missing and no .acreplay found in $toolDir" }
        $replay = $rp[0].FullName
    } else {
        $replay = Resolve-FsPath $replay
    }
    if (-not (Test-Path -LiteralPath $replay)) { throw "Replay file not found: $replay" }

    $outDir = Split-Path -Parent $TargetJsonPath
    if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
        New-Item -ItemType Directory -Path $outDir -Force | Out-Null
    }

    $tempWork = Join-Path ([IO.Path]::GetTempPath()) ('ac_lap_' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tempWork -Force | Out-Null
    $outPrefix = Join-Path $tempWork 'acrp_out'
    try {
        $argList = New-Object System.Collections.Generic.List[string]
        [void]$argList.Add('-o')
        [void]$argList.Add($outPrefix)
        if (-not [string]::IsNullOrWhiteSpace($DriverNameIn)) {
            [void]$argList.Add('--driver-name')
            [void]$argList.Add($DriverNameIn)
        }
        [void]$argList.Add($replay)

        Write-Host "Generating replay JSON via acrp: $replay"
        $proc = Start-Process -FilePath $acrp -ArgumentList $argList.ToArray() -Wait -PassThru -NoNewWindow
        if ($proc.ExitCode -ne 0) { throw "acrp.exe exit code $($proc.ExitCode)" }

        $jsonFiles = @(Get-ChildItem -LiteralPath $tempWork -Filter *.json -File | Sort-Object LastWriteTime -Descending)
        if ($jsonFiles.Count -lt 1) { throw "acrp generated no JSON in: $tempWork" }
        if ($jsonFiles.Count -gt 1 -and [string]::IsNullOrWhiteSpace($DriverNameIn)) {
            throw "acrp generated multiple JSON files; pass -DriverName to pick one."
        }
        Copy-Item -LiteralPath $jsonFiles[0].FullName -Destination $TargetJsonPath -Force
        Write-Host "Generated: $TargetJsonPath"
    } finally {
        Remove-Item -LiteralPath $tempWork -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Build-CornerJsonFromReplay($j, [string]$TargetPath, [int]$LapVal, [double]$MinSegMeters, [double]$DedupMinGapMeters, [bool]$AutoFastestLapVal) {
    $seg = if ($AutoFastestLapVal) { Select-FastestTimingSegment $j $MinSegMeters } else { Select-TimingSegment $j $LapVal $MinSegMeters }
    if ($seg.Mode -ne 'ok' -or $seg.Start -lt 0) { throw "Cannot build corners: timing segment $($seg.Mode)" }
    $iStart = $seg.Start; $iEnd = $seg.End
    $idx = New-Object System.Collections.Generic.List[int]
    for ($i = $iStart; $i -lt $iEnd; $i++) { [void]$idx.Add($i) }
    if ($idx.Count -lt 200) { throw "Cannot build corners: too few frames ($($idx.Count))" }

    $m = $idx.Count
    $s = New-Object double[] $m
    $brk = New-Object int[] $m
    for ($k = 0; $k -lt $m; $k++) {
        $fi = $idx[$k]
        if ($k -gt 0) {
            $pi = $idx[$k - 1]
            $dx = [double]$j.x[$fi] - [double]$j.x[$pi]
            $dy = [double]$j.y[$fi] - [double]$j.y[$pi]
            $dz = [double]$j.z[$fi] - [double]$j.z[$pi]
            $s[$k] = $s[$k - 1] + [Math]::Sqrt($dx * $dx + $dy * $dy + $dz * $dz)
        }
        $brk[$k] = [int]$j.brake[$fi]
    }
    $lapLen = $s[$m - 1]
    if ($lapLen -lt 100.0) { throw "Cannot build corners: lap length abnormal ($lapLen)" }

    $cand = New-Object System.Collections.Generic.List[object]
    for ($k = 1; $k -lt $m; $k++) {
        $prev = $brk[$k - 1]; $cur = $brk[$k]
        $isOnset = ($cur -ge 35 -and $prev -lt 25) -or ($cur -ge 22 -and $prev -lt 12) -or (($cur - $prev) -ge 20 -and $cur -ge 18)
        if ($isOnset) {
            [void]$cand.Add([pscustomobject]@{
                K = $k
                S = $s[$k]
                Fraction = ($s[$k] / $lapLen)
                Score = ($cur + [Math]::Max(0, $cur - $prev))
            })
        }
    }
    if ($cand.Count -lt 14) { throw "Cannot build corners: brake onset candidates <14 ($($cand.Count))" }

    $selected = New-Object System.Collections.Generic.List[object]
    foreach ($c in ($cand | Sort-Object Score -Descending)) {
        if ($selected.Count -ge 14) { break }
        $ok = $true
        foreach ($slt in $selected) {
            $d = [Math]::Abs($c.S - $slt.S)
            $dc = [Math]::Min($d, $lapLen - $d)
            if ($dc -lt $DedupMinGapMeters) { $ok = $false; break }
        }
        if ($ok) { [void]$selected.Add($c) }
    }
    if ($selected.Count -lt 14) {
        foreach ($c in ($cand | Sort-Object Score -Descending)) {
            if ($selected.Count -ge 14) { break }
            $exists = $false
            foreach ($slt in $selected) { if ([int]$slt.K -eq [int]$c.K) { $exists = $true; break } }
            if (-not $exists) { [void]$selected.Add($c) }
        }
    }
    if ($selected.Count -lt 14) { throw "Cannot build corners: selected <14 ($($selected.Count))" }

    $bf = @($selected | Sort-Object Fraction | Select-Object -First 14 | ForEach-Object { [double]$_.Fraction })
    $ends = @()
    for ($i = 0; $i -lt 13; $i++) { $ends += [Math]::Round((($bf[$i] + $bf[$i + 1]) / 2.0), 6) }
    $ends += 1.0

    $b = @(0.0) + $ends
    $center = @()
    for ($i = 0; $i -lt 14; $i++) { $center += [Math]::Round((($b[$i] + $b[$i + 1]) / 2.0), 6) }

    $obj = [ordered]@{
        _comment = "Auto-generated by DrawZhuhaiLapCorners.ps1 from replay brake onsets."
        _comment2 = "segmentEndFraction[13] fixed at 1.0; cornerCenterFraction is sector midpoint."
        segmentEndFraction = $ends
        cornerCenterFraction = $center
    }
    $outDir = Split-Path -Parent $TargetPath
    if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
        New-Item -ItemType Directory -Path $outDir -Force | Out-Null
    }
    ($obj | ConvertTo-Json -Depth 6) | Set-Content -LiteralPath $TargetPath -Encoding UTF8
    Write-Host "Generated: $TargetPath"
}

$ReplayPath = Resolve-FsPath $ReplayPath
$legacyJson = Join-Path $toolDir 'zhuhai_replay_out_elmagnifico.json'
$legacyCorners = Join-Path $toolDir 'zhuhai_t1_t14_apex_fractions.json'

if ([string]::IsNullOrWhiteSpace($JsonPath)) {
    if (-not [string]::IsNullOrWhiteSpace($ReplayPath)) {
        $rpDir = Split-Path -Parent $ReplayPath
        $rpStem = Get-FileStem $ReplayPath 'replay'
        $JsonPath = Join-Path $rpDir ($rpStem + '_replay.json')
    } elseif (Test-Path -LiteralPath $legacyJson) {
        $JsonPath = $legacyJson
    } else {
        throw "Please provide -ReplayPath or -JsonPath."
    }
}
if ([string]::IsNullOrWhiteSpace($CornersJson)) {
    if (-not [string]::IsNullOrWhiteSpace($ReplayPath)) {
        $rpDir = Split-Path -Parent $ReplayPath
        $rpStem = Get-FileStem $ReplayPath 'replay'
        $CornersJson = Join-Path $rpDir ($rpStem + '_corners.json')
    } elseif (Test-Path -LiteralPath $legacyCorners) {
        $CornersJson = $legacyCorners
    } else {
        $jDir = Split-Path -Parent $JsonPath
        $jStem = Get-FileStem $JsonPath 'replay'
        $CornersJson = Join-Path $jDir ($jStem + '_corners.json')
    }
}
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    if (-not [string]::IsNullOrWhiteSpace($ReplayPath)) {
        $rpDir = Split-Path -Parent $ReplayPath
        $rpStem = Get-FileStem $ReplayPath 'replay'
        $OutputPath = Join-Path $rpDir ($rpStem + '_brake_throttle_points.png')
    } else {
        $jDir = Split-Path -Parent $JsonPath
        $jStem = Get-FileStem $JsonPath 'replay'
        $OutputPath = Join-Path $jDir ($jStem + '_brake_throttle_points.png')
    }
}
if ([string]::IsNullOrWhiteSpace($DebugOutputPath)) {
    $DebugOutputPath = [IO.Path]::ChangeExtension($OutputPath, '.debug.csv')
}

$JsonPath = Resolve-FsPath $JsonPath
$CornersJson = Resolve-FsPath $CornersJson
$OutputPath = Resolve-FsPath $OutputPath
$DebugOutputPath = Resolve-FsPath $DebugOutputPath
Ensure-ReplayJson $JsonPath $ReplayPath $AcRpPath $DriverName

$j = Get-Content -LiteralPath $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not (Test-Path -LiteralPath $CornersJson)) {
    Build-CornerJsonFromReplay $j $CornersJson $Lap $MinSegmentMeters 28.0 $AutoFastestLap
}

$apexObj = Get-Content -LiteralPath $CornersJson -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $apexObj.segmentEndFraction) { throw 'CornersJson needs segmentEndFraction[14] ending with 1.0' }
$se = @([double[]]@($apexObj.segmentEndFraction))
$boundaries = Get-BoundariesFromSegmentEnds $se
$cornerCenter = $null
if ($apexObj.cornerCenterFraction) {
    $cornerCenter = @([double[]]@($apexObj.cornerCenterFraction))
    if ($cornerCenter.Count -ne 14) { throw 'cornerCenterFraction must have 14 elements if set' }
}

$nF = $j.x.Count
if ($j.velocityX.Count -ne $nF) { throw 'JSON needs velocityX/Y/Z same length as x.' }

$dt = Get-FrameDtSeconds $j
$brkFrames = [int][math]::Ceiling($BrakeMinSeconds / $dt)
$gasFrames = [int][math]::Ceiling($ThrottleMinSeconds / $dt)
$gasReapplyFrames = [int][math]::Ceiling($GasReapplyMinSeconds / $dt)
Write-Host "Frame dt=${dt}s  brake>=${BrakeMinSeconds}s -> ${brkFrames} frames  throttle>=${ThrottleMinSeconds}s -> ${gasFrames} frames"

$seg = if ($AutoFastestLap) { Select-FastestTimingSegment $j $MinSegmentMeters } else { Select-TimingSegment $j $Lap $MinSegmentMeters }
$iStart = 0; $iEnd = $nF; $timingUsed = $false
if ($seg.Mode -eq 'ok' -and $seg.Start -ge 0) {
    $iStart = $seg.Start; $iEnd = $seg.End; $timingUsed = $true
    if ($AutoFastestLap) {
        $Lap = [int]$seg.Lap
        Write-Host "Timing (fastest lap): lap=$Lap time_ms=$($seg.TimeMs) frames $($seg.Start)..$($seg.End) length_m=$([math]::Round($seg.Length,1))"
    } else {
        Write-Host "Timing: frames $($seg.Start)..$($seg.End) length_m=$([math]::Round($seg.Length,1))"
    }
} else {
    Write-Warning "Timing: $($seg.Mode)"
}

$idx = New-Object System.Collections.Generic.List[int]
for ($i = $iStart; $i -lt $iEnd; $i++) {
    if (-not $timingUsed) {
        if ([int]$j.currentLap[$i] -ne $Lap) { continue }
    }
    [void]$idx.Add($i)
}
if ($idx.Count -lt 200) { throw "Too few frames: $($idx.Count)" }

$m = $idx.Count
$s = New-Object double[] $m
$sp = New-Object double[] $m
$brk = New-Object int[] $m
$gas = New-Object int[] $m
$xs = New-Object double[] $m
$zs = New-Object double[] $m
for ($k = 0; $k -lt $m; $k++) {
    $fi = $idx[$k]
    $xs[$k] = [double]$j.x[$fi]; $zs[$k] = [double]$j.z[$fi]
    if ($k -gt 0) {
        $pi = $idx[$k - 1]
        $dx = [double]$j.x[$fi] - [double]$j.x[$pi]
        $dy = [double]$j.y[$fi] - [double]$j.y[$pi]
        $dz = [double]$j.z[$fi] - [double]$j.z[$pi]
        $s[$k] = $s[$k - 1] + [Math]::Sqrt($dx * $dx + $dy * $dy + $dz * $dz)
    }
    $sp[$k] = Get-SpeedKmh $j $fi
    $brk[$k] = [int]$j.brake[$fi]
    $gas[$k] = [int]$j.gas[$fi]
}

$lapLen = $s[$m - 1]
if ($lapLen -lt 100.0) { throw "Lap length abnormal: $lapLen" }

$xmin = ($xs | Measure-Object -Minimum).Minimum
$xmax = ($xs | Measure-Object -Maximum).Maximum
$zmin = ($zs | Measure-Object -Minimum).Minimum
$zmax = ($zs | Measure-Object -Maximum).Maximum
$innerFrac = [Math]::Max(0.0, [Math]::Min(0.45, $InnerMarginPercent / 100.0))
$bmpW = $ImageWidth; $bmpH = $ImageHeight
$iw = $bmpW * (1.0 - 2.0 * $innerFrac); $ih = $bmpH * (1.0 - 2.0 * $innerFrac)
$rw = [Math]::Max(1e-9, $xmax - $xmin); $rz = [Math]::Max(1e-9, $zmax - $zmin)
$sc = [Math]::Min($iw / $rw, $ih / $rz)
$offX = $bmpW * $innerFrac + ($iw - $sc * $rw) / 2.0
$offZ = $bmpH * $innerFrac + ($ih - $sc * $rz) / 2.0

$pxi = New-Object int[] $m
$pzi = New-Object int[] $m
for ($k = 0; $k -lt $m; $k++) {
    $pxd = $offX + ($xs[$k] - $xmin) * $sc
    if ($FlipWorldZ.IsPresent) { $pzd = $offZ + ($zs[$k] - $zmin) * $sc }
    else { $pzd = $offZ + ($zmax - $zs[$k]) * $sc }
    $pxi[$k] = Clamp-Int ([int][Math]::Round($pxd)) 0 ($bmpW - 1)
    $pzi[$k] = Clamp-Int ([int][Math]::Round($pzd)) 0 ($bmpH - 1)
}
if (-not $NoVerticalFlip.IsPresent) {
    for ($k = 0; $k -lt $m; $k++) { $pzi[$k] = $bmpH - 1 - $pzi[$k] }
}

$bmp = New-Object System.Drawing.Bitmap $bmpW, $bmpH
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)
$fontTitle = New-CjkDrawingFont $FontSizeTitle ([System.Drawing.FontStyle]::Bold)
$fontMk = New-CjkDrawingFont $FontSizeMarker ([System.Drawing.FontStyle]::Bold)
$brushTxt = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 30, 30, 30))
$penTrace = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 40, 90, 200)), 3
$brushRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 200, 40, 40))
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 30, 150, 50))
$brushSf = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 200, 130, 0))
$penLeader = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 90, 90, 90)), 1.0

for ($k = 1; $k -lt $m; $k++) {
    $g.DrawLine($penTrace, $pxi[$k - 1], $pzi[$k - 1], $pxi[$k], $pzi[$k])
}

$occupied = New-Object 'System.Collections.Generic.List[System.Drawing.RectangleF]'

function Test-RectOverlap([System.Drawing.RectangleF]$a, [System.Drawing.RectangleF]$b, [float]$pad) {
    $ax1 = $a.Left - $pad; $ay1 = $a.Top - $pad; $ax2 = $a.Right + $pad; $ay2 = $a.Bottom + $pad
    $bx1 = $b.Left - $pad; $by1 = $b.Top - $pad; $bx2 = $b.Right + $pad; $by2 = $b.Bottom + $pad
    return -not (($ax2 -lt $bx1) -or ($ax1 -gt $bx2) -or ($ay2 -lt $by1) -or ($ay1 -gt $by2))
}

function New-LabelPlacement {
    param($Graphics, $Font, [string]$Text, [int]$cx, [int]$cy, [int]$imgW, [int]$imgH, $Occupied, [float[]]$OffsetCandidates)
    $sz = $Graphics.MeasureString($Text, $Font)
    $w = $sz.Width + 6; $h = $sz.Height + 4
    $pad = [float]4
    for ($ci = 0; $ci -lt $OffsetCandidates.Length; $ci += 2) {
        $tx = [float]($cx + $OffsetCandidates[$ci]); $ty = [float]($cy + $OffsetCandidates[$ci + 1])
        if ($tx + $w -gt $imgW - 4) { $tx = [float]($imgW - 4 - $w) }
        if ($tx -lt 4) { $tx = 4 }
        if ($ty + $h -gt $imgH - 4) { $ty = [float]($imgH - 4 - $h) }
        if ($ty -lt 4) { $ty = 4 }
        $rc = [System.Drawing.RectangleF]::new($tx, $ty, $w, $h)
        $hit = $false
        foreach ($o in $Occupied) { if (Test-RectOverlap $rc $o $pad) { $hit = $true; break } }
        if (-not $hit) {
            [void]$Occupied.Add($rc)
            return @{ Tx = $tx; Ty = $ty; W = $w; H = $h }
        }
    }
    # Fallback: radial search around anchor to minimize collisions in dense areas.
    for ($rad = 26.0; $rad -le 190.0; $rad += 12.0) {
        for ($ang = 0.0; $ang -lt 360.0; $ang += 20.0) {
            $rx = [Math]::Cos($ang * [Math]::PI / 180.0) * $rad
            $ry = [Math]::Sin($ang * [Math]::PI / 180.0) * $rad
            $tx = [float]($cx + $rx)
            $ty = [float]($cy + $ry)
            if ($tx + $w -gt $imgW - 4) { $tx = [float]($imgW - 4 - $w) }
            if ($tx -lt 4) { $tx = 4 }
            if ($ty + $h -gt $imgH - 4) { $ty = [float]($imgH - 4 - $h) }
            if ($ty -lt 4) { $ty = 4 }
            $rc = [System.Drawing.RectangleF]::new($tx, $ty, $w, $h)
            $hit = $false
            foreach ($o in $Occupied) { if (Test-RectOverlap $rc $o $pad) { $hit = $true; break } }
            if (-not $hit) {
                [void]$Occupied.Add($rc)
                return @{ Tx = $tx; Ty = $ty; W = $w; H = $h }
            }
        }
    }
    # Last resort: place at corner to guarantee visibility.
    $tx0 = [float]4; $ty0 = [float]4
    $rc0 = [System.Drawing.RectangleF]::new($tx0, $ty0, $w, $h)
    [void]$Occupied.Add($rc0)
    return @{ Tx = $tx0; Ty = $ty0; W = $w; H = $h }
}

function Draw-StringWithLeader {
    param($Graphics, $Font, $Brush, $PenL, [int]$cx, [int]$cy, [string]$Text, $Place)
    $Graphics.DrawString($Text, $Font, $Brush, $Place.Tx, $Place.Ty)
    $mx = $Place.Tx + $Place.W / 2.0; $my = $Place.Ty + $Place.H / 2.0
    $Graphics.DrawLine($PenL, [float]$cx, [float]$cy, $mx, $my)
}

$sfOff = [float[]]@(20.0, -28.0, -120.0, -28.0, 20.0, 22.0)
$sfPl = New-LabelPlacement $g $fontMk $cap.sf $pxi[0] $pzi[0] $bmpW $bmpH $occupied $sfOff
$g.FillEllipse($brushSf, $pxi[0] - 10, $pzi[0] - 10, 20, 20)
Draw-StringWithLeader $g $fontMk $brushTxt $penLeader $pxi[0] $pzi[0] $cap.sf $sfPl

$bOff = [float[]]@(16.0, -28.0, -120.0, -28.0, 20.0, 22.0, -130.0, 24.0, 95.0, -34.0, 110.0, 12.0)
$gOff = [float[]]@(-16.0, 26.0, 90.0, 26.0, -26.0, -18.0, 110.0, -24.0, -120.0, 30.0, 24.0, 44.0)

$prevBrakeRunEnd = -1
$prevGasRunEnd = -1
$events = New-Object System.Collections.Generic.List[object]
$debugRows = New-Object System.Collections.Generic.List[object]
for ($ti = 0; $ti -lt 14; $ti++) {
    $f0 = $boundaries[$ti]; $f1 = $boundaries[$ti + 1]
    $sLo = [Math]::Max(0.0, ($f0 * $lapLen) - $SectorExpandMeters)
    $sHi = [Math]::Min($lapLen, ($f1 * $lapLen) + $SectorExpandMeters)
    $ff0 = $sLo / $lapLen
    $ff1 = $sHi / $lapLen
    $k0, $k1 = Find-KRangeForArc $s $lapLen $ff0 $ff1 $m

    # Avoid repeated brake markers when one long brake run spans adjacent sectors.
    $searchK0 = [Math]::Max($k0, $prevBrakeRunEnd + 1)
    $bk = Find-FirstRisingSustainedAbove $brk $searchK0 $k1 $BrakePedalThreshold $brkFrames
    $brkEnd = -1
    if ($bk -ge 0) {
        $brkEnd = Get-ContiguousRunEnd $brk $bk $k1 $BrakePedalThreshold
        if ($brkEnd -gt $prevBrakeRunEnd) { $prevBrakeRunEnd = $brkEnd }
    }

    $gasFrom = $k0
    if ($brkEnd -ge 0) { $gasFrom = [Math]::Min($k1, $brkEnd + 1) }
    $gasSearchK0 = [Math]::Max($gasFrom, $prevGasRunEnd + 1)

    $tkRise = Find-FirstRisingSustainedAbove $gas $gasSearchK0 $k1 $GasPedalThreshold $gasFrames
    $tkSustain = -1
    $tkReapply = -1
    $tk = $tkRise
    $tkSource = 'rise'
    if ($tk -lt 0) {
        # Fallback: if no clean rising edge exists in this window, still capture first sustained high-gas point.
        $tkSustain = Find-FirstSustainedAbove $gas $gasSearchK0 $k1 $GasPedalThreshold $gasFrames
        $tk = $tkSustain
        $tkSource = 'sustain'
    }
    if ($tk -lt 0) {
        # Fallback 2: capture lower-threshold throttle reapply when speed rises but full gas threshold isn't reached.
        $tkReapply = Find-FirstGasReapply $gas $brk $gasSearchK0 $k1 $GasReapplyThreshold $GasReapplyDelta $GasReapplyBrakeMax $gasReapplyFrames
        $tk = $tkReapply
        $tkSource = 'reapply'
    }
    if ($tk -lt 0) { $tkSource = 'none' }
    if ($tk -ge 0) {
        $gasEnd = Get-ContiguousRunEnd $gas $tk $k1 $GasPedalThreshold
        if ($gasEnd -gt $prevGasRunEnd) { $prevGasRunEnd = $gasEnd }
    }

    if ($bk -ge 0) {
        [void]$events.Add([pscustomobject]@{
            K = $bk
            Kind = 'brake'
            Sector = ($ti + 1)
            Source = 'rise'
            GasValue = 0
            Speed = [int][math]::Round($sp[$bk], 0)
            Px = $pxi[$bk]
            Py = $pzi[$bk]
        })
    }

    if ($tk -ge 0) {
        [void]$events.Add([pscustomobject]@{
            K = $tk
            Kind = 'gas'
            Sector = ($ti + 1)
            Source = $tkSource
            GasValue = [int]$gas[$tk]
            Speed = [int][math]::Round($sp[$tk], 0)
            Px = $pxi[$tk]
            Py = $pzi[$tk]
        })
    }

    if ($DebugEventTrace.IsPresent) {
        $secMaxGas = ($gas[$k0..$k1] | Measure-Object -Maximum).Maximum
        $secMaxBrk = ($brk[$k0..$k1] | Measure-Object -Maximum).Maximum
        [void]$debugRows.Add([pscustomobject]@{
            Phase = 'sector'
            Sector = ('T{0}' -f ($ti + 1))
            k0 = $k0
            k1 = $k1
            searchBrakeK0 = $searchK0
            bk = $bk
            brkEnd = $brkEnd
            gasSearchK0 = $gasSearchK0
            tkRise = $tkRise
            tkSustain = $tkSustain
            tkReapply = $tkReapply
            tkPicked = $tk
            tkSource = $tkSource
            secMaxGas = $secMaxGas
            secMaxBrk = $secMaxBrk
        })
    }
}

$markerId = 0
$orderedEvents = @($events | Sort-Object K, Kind)

# Global补漏：若两次刹车之间无油门点，则在中间区间再做一次补油搜索。
$brakeEvents = @($orderedEvents | Where-Object { $_.Kind -eq 'brake' } | Sort-Object K)
if ($brakeEvents.Count -ge 2) {
    for ($bi = 0; $bi -lt $brakeEvents.Count - 1; $bi++) {
        $kA = [int]$brakeEvents[$bi].K
        $kB = [int]$brakeEvents[$bi + 1].K
        if (($kB - $kA) -lt 3) { continue }

        $hasGasBetween = $false
        foreach ($ev2 in $orderedEvents) {
            if ($ev2.Kind -eq 'gas' -and $ev2.K -gt $kA -and $ev2.K -lt $kB) {
                $hasGasBetween = $true
                break
            }
        }
        if ($hasGasBetween) { continue }

        $g0 = $kA + 1
        $g1 = $kB - 1
        $tkMid = Find-FirstRisingSustainedAbove $gas $g0 $g1 $GasPedalThreshold $gasFrames
        if ($tkMid -lt 0) {
            $tkMid = Find-FirstSustainedAbove $gas $g0 $g1 $GasPedalThreshold $gasFrames
        }
        if ($tkMid -lt 0) {
            $tkMid = Find-FirstGasReapply $gas $brk $g0 $g1 $GasReapplyThreshold $GasReapplyDelta $GasReapplyBrakeMax $gasReapplyFrames
        }
        if ($tkMid -lt 0 -and $AllowOverlapThrottleBetweenBrakes) {
            # Only in brake-to-brake gaps: allow overlap throttle reapply without brake-max constraint.
            $tkMid = Find-FirstGasReapplyOverlap $gas $g0 $g1 $GasReapplyThreshold $GasReapplyDelta $gasReapplyFrames
            if ($tkMid -lt 0) {
                # If gas is already high in this gap (no rise edge), capture the first sustained high-gas sample.
                $tkMid = Find-FirstSustainedAbove $gas $g0 $g1 $GasReapplyThreshold $gasReapplyFrames
            }
            if ($tkMid -lt 0) {
                # Final fallback for brake-to-brake gap: pick max-gas point in gap to avoid missing obvious refill.
                $bestK = -1
                $bestG = -1
                for ($kk = $g0; $kk -le $g1; $kk++) {
                    if ($gas[$kk] -gt $bestG) { $bestG = $gas[$kk]; $bestK = $kk }
                }
                if ($bestG -ge $GasReapplyThreshold) { $tkMid = $bestK }
            }
        }
        if ($DebugEventTrace.IsPresent) {
            [void]$debugRows.Add([pscustomobject]@{
                Phase = 'global_gap_probe'
                Sector = ('T{0}->T{1}' -f $brakeEvents[$bi].Sector, $brakeEvents[$bi + 1].Sector)
                k0 = $g0
                k1 = $g1
                searchBrakeK0 = ''
                bk = $kA
                brkEnd = $kB
                gasSearchK0 = $g0
                tkRise = ''
                tkSustain = ''
                tkReapply = ''
                tkPicked = $tkMid
                tkSource = if ($tkMid -ge 0) { 'global_probe_hit' } else { 'global_probe_miss' }
                secMaxGas = ($gas[$g0..$g1] | Measure-Object -Maximum).Maximum
                secMaxBrk = ($brk[$g0..$g1] | Measure-Object -Maximum).Maximum
            })
        }
        if ($tkMid -ge 0) {
            [void]$events.Add([pscustomobject]@{
                K = $tkMid
                Kind = 'gas'
                Sector = 0
                Source = 'global_gap_fill_overlap_ok'
                GasValue = [int]$gas[$tkMid]
                Speed = [int][math]::Round($sp[$tkMid], 0)
                Px = $pxi[$tkMid]
                Py = $pzi[$tkMid]
            })
            if ($DebugEventTrace.IsPresent) {
                [void]$debugRows.Add([pscustomobject]@{
                    Phase = 'global_gap_fill'
                    Sector = ('T{0}->T{1}' -f $brakeEvents[$bi].Sector, $brakeEvents[$bi + 1].Sector)
                    k0 = $g0
                    k1 = $g1
                    searchBrakeK0 = ''
                    bk = $brakeEvents[$bi].K
                    brkEnd = $brakeEvents[$bi + 1].K
                    gasSearchK0 = $g0
                    tkRise = ''
                    tkSustain = ''
                    tkReapply = ''
                    tkPicked = $tkMid
                    tkSource = 'global_gap_fill'
                    secMaxGas = ($gas[$g0..$g1] | Measure-Object -Maximum).Maximum
                    secMaxBrk = ($brk[$g0..$g1] | Measure-Object -Maximum).Maximum
                })
            }
        }
    }
    $orderedEvents = @($events | Sort-Object K, Kind)
}

# Second-pass robust补漏（仅连续刹车之间）:
# If a brake-to-brake gap still has no gas marker, insert one at max-gas position in that gap.
if ($AllowOverlapThrottleBetweenBrakes) {
    $orderedEvents = @($events | Sort-Object K, Kind)
    $brakeEvents2 = @($orderedEvents | Where-Object { $_.Kind -eq 'brake' } | Sort-Object K)
    if ($brakeEvents2.Count -ge 2) {
        for ($bi2 = 0; $bi2 -lt $brakeEvents2.Count - 1; $bi2++) {
            $kA2 = [int]$brakeEvents2[$bi2].K
            $kB2 = [int]$brakeEvents2[$bi2 + 1].K
            if (($kB2 - $kA2) -lt 3) { continue }

            $hasGasBetween2 = $false
            foreach ($evx in $orderedEvents) {
                if ($evx.Kind -eq 'gas' -and $evx.K -gt $kA2 -and $evx.K -lt $kB2) {
                    $hasGasBetween2 = $true
                    break
                }
            }
            if ($hasGasBetween2) { continue }

            $g02 = $kA2 + 1
            $g12 = $kB2 - 1
            $bestK2 = -1
            $bestG2 = -1
            for ($kk2 = $g02; $kk2 -le $g12; $kk2++) {
                if ($gas[$kk2] -gt $bestG2) { $bestG2 = $gas[$kk2]; $bestK2 = $kk2 }
            }
            if ($bestK2 -ge 0 -and $bestG2 -ge $GasReapplyThreshold) {
                [void]$events.Add([pscustomobject]@{
                    K = $bestK2
                    Kind = 'gas'
                    Sector = 0
                    Source = 'global_gap_force_max'
                    GasValue = [int]$gas[$bestK2]
                    Speed = [int][math]::Round($sp[$bestK2], 0)
                    Px = $pxi[$bestK2]
                    Py = $pzi[$bestK2]
                })
            }
        }
        $orderedEvents = @($events | Sort-Object K, Kind)
    }
}

# Rule: between two consecutive brake points, keep at most one gas point.
if ($orderedEvents.Count -gt 0) {
    $removeIdx = New-Object 'System.Collections.Generic.HashSet[int]'
    $brakeIdx = New-Object System.Collections.Generic.List[int]
    for ($i = 0; $i -lt $orderedEvents.Count; $i++) {
        if ($orderedEvents[$i].Kind -eq 'brake') { [void]$brakeIdx.Add($i) }
    }
    for ($bi3 = 0; $bi3 -lt $brakeIdx.Count - 1; $bi3++) {
        $ia = $brakeIdx[$bi3]
        $ib = $brakeIdx[$bi3 + 1]
        $gasCandidates = New-Object System.Collections.Generic.List[int]
        for ($i = $ia + 1; $i -lt $ib; $i++) {
            if ($orderedEvents[$i].Kind -eq 'gas') { [void]$gasCandidates.Add($i) }
        }
        if ($gasCandidates.Count -le 1) { continue }
        # Keep earliest gas marker between two brake markers.
        $keep = $gasCandidates | Sort-Object { [int]$orderedEvents[$_].K } | Select-Object -First 1
        foreach ($gi in $gasCandidates) {
            if ($gi -ne $keep) { [void]$removeIdx.Add([int]$gi) }
        }
    }
    if ($removeIdx.Count -gt 0) {
        $filtered = New-Object System.Collections.Generic.List[object]
        for ($i = 0; $i -lt $orderedEvents.Count; $i++) {
            if (-not $removeIdx.Contains($i)) { [void]$filtered.Add($orderedEvents[$i]) }
        }
        $orderedEvents = $filtered.ToArray()
    }
}

foreach ($ev in $orderedEvents) {
    $markerId++
    $lbl = ('A{0} {1} km/h' -f $markerId, $ev.Speed)
    if ($ev.Kind -eq 'brake') {
        $pl = New-LabelPlacement $g $fontMk $lbl $ev.Px $ev.Py $bmpW $bmpH $occupied $bOff
        $g.FillEllipse($brushRed, $ev.Px - 7, $ev.Py - 7, 14, 14)
    } else {
        $pl = New-LabelPlacement $g $fontMk $lbl $ev.Px $ev.Py $bmpW $bmpH $occupied $gOff
        $g.FillEllipse($brushGreen, $ev.Px - 7, $ev.Py - 7, 14, 14)
    }
    Draw-StringWithLeader $g $fontMk $brushTxt $penLeader $ev.Px $ev.Py $lbl $pl
}

if ($DebugEventTrace.IsPresent) {
    $aRows = New-Object System.Collections.Generic.List[object]
    $aId = 0
    foreach ($ev in $orderedEvents) {
        $aId++
        [void]$aRows.Add([pscustomobject]@{
            Phase = 'A_sequence'
            Sector = if ($ev.Sector -gt 0) { 'T' + $ev.Sector } else { '-' }
            A = 'A' + $aId
            Kind = $ev.Kind
            Source = $ev.Source
            K = $ev.K
            AbsFrame = $idx[$ev.K]
            ArcS_m = [Math]::Round($s[$ev.K], 3)
            Speed_kmh = $ev.Speed
        })
    }

    $gapRows = New-Object System.Collections.Generic.List[object]
    $brOnly = @($aRows | Where-Object { $_.Kind -eq 'brake' })
    for ($gi = 0; $gi -lt $brOnly.Count - 1; $gi++) {
        $a = $brOnly[$gi]
        $b = $brOnly[$gi + 1]
        $ka = [int]$a.K; $kb = [int]$b.K
        if (($kb - $ka) -lt 2) { continue }
        $lo = $ka + 1; $hi = $kb - 1
        $hasGas = ($aRows | Where-Object { $_.Kind -eq 'gas' -and [int]$_.K -gt $ka -and [int]$_.K -lt $kb } | Select-Object -First 1)
        $maxGas = ($gas[$lo..$hi] | Measure-Object -Maximum).Maximum
        $maxBrk = ($brk[$lo..$hi] | Measure-Object -Maximum).Maximum
        $run180 = Get-LongestRunAbove $gas $lo $hi 180
        $run60 = Get-LongestRunAbove $gas $lo $hi 60
        $run40 = Get-LongestRunAbove $gas $lo $hi 40
        [void]$gapRows.Add([pscustomobject]@{
            Phase = 'brake_gap'
            Sector = ($a.A + '->' + $b.A)
            A = ''
            Kind = ''
            Source = if ($hasGas) { 'has_gas' } else { ("no_gas(run180={0},run60={1},run40={2})" -f $run180, $run60, $run40) }
            K = "$lo..$hi"
            AbsFrame = "$($idx[$lo])..$($idx[$hi])"
            ArcS_m = [Math]::Round(($s[$lo] + $s[$hi]) / 2.0, 3)
            Speed_kmh = ''
            MaxGas = $maxGas
            MaxBrake = $maxBrk
        })
    }

    $all = @($debugRows + $aRows + $gapRows) | ForEach-Object {
        [pscustomobject]@{
            Phase = if ($_.PSObject.Properties.Name -contains 'Phase') { $_.Phase } else { '' }
            Sector = if ($_.PSObject.Properties.Name -contains 'Sector') { $_.Sector } else { '' }
            A = if ($_.PSObject.Properties.Name -contains 'A') { $_.A } else { '' }
            Kind = if ($_.PSObject.Properties.Name -contains 'Kind') { $_.Kind } else { '' }
            Source = if ($_.PSObject.Properties.Name -contains 'Source') { $_.Source } else { '' }
            K = if ($_.PSObject.Properties.Name -contains 'K') { $_.K } else { '' }
            AbsFrame = if ($_.PSObject.Properties.Name -contains 'AbsFrame') { $_.AbsFrame } else { '' }
            ArcS_m = if ($_.PSObject.Properties.Name -contains 'ArcS_m') { $_.ArcS_m } else { '' }
            Speed_kmh = if ($_.PSObject.Properties.Name -contains 'Speed_kmh') { $_.Speed_kmh } else { '' }
            MaxGas = if ($_.PSObject.Properties.Name -contains 'MaxGas') { $_.MaxGas } else { '' }
            MaxBrake = if ($_.PSObject.Properties.Name -contains 'MaxBrake') { $_.MaxBrake } else { '' }
            k0 = if ($_.PSObject.Properties.Name -contains 'k0') { $_.k0 } else { '' }
            k1 = if ($_.PSObject.Properties.Name -contains 'k1') { $_.k1 } else { '' }
            searchBrakeK0 = if ($_.PSObject.Properties.Name -contains 'searchBrakeK0') { $_.searchBrakeK0 } else { '' }
            bk = if ($_.PSObject.Properties.Name -contains 'bk') { $_.bk } else { '' }
            brkEnd = if ($_.PSObject.Properties.Name -contains 'brkEnd') { $_.brkEnd } else { '' }
            gasSearchK0 = if ($_.PSObject.Properties.Name -contains 'gasSearchK0') { $_.gasSearchK0 } else { '' }
            tkRise = if ($_.PSObject.Properties.Name -contains 'tkRise') { $_.tkRise } else { '' }
            tkSustain = if ($_.PSObject.Properties.Name -contains 'tkSustain') { $_.tkSustain } else { '' }
            tkReapply = if ($_.PSObject.Properties.Name -contains 'tkReapply') { $_.tkReapply } else { '' }
            tkPicked = if ($_.PSObject.Properties.Name -contains 'tkPicked') { $_.tkPicked } else { '' }
            tkSource = if ($_.PSObject.Properties.Name -contains 'tkSource') { $_.tkSource } else { '' }
            secMaxGas = if ($_.PSObject.Properties.Name -contains 'secMaxGas') { $_.secMaxGas } else { '' }
            secMaxBrk = if ($_.PSObject.Properties.Name -contains 'secMaxBrk') { $_.secMaxBrk } else { '' }
        }
    }
    $all | Export-Csv -LiteralPath $DebugOutputPath -NoTypeInformation -Encoding UTF8
    $a1415 = $gapRows | Where-Object { $_.Sector -eq 'A14->A15' } | Select-Object -First 1
    if ($null -ne $a1415) {
        Write-Host ("Debug A14->A15: source={0} maxGas={1} maxBrake={2} gapK={3}" -f $a1415.Source, $a1415.MaxGas, $a1415.MaxBrake, $a1415.K)
    }
    Write-Host "Debug trace saved: $DebugOutputPath"
}

$sub = ('dt={0}ms brake>={1}s thr={2} gas>={3} expand={4}m' -f [int]($dt * 1000), $BrakeMinSeconds, $ThrottleMinSeconds, $GasPedalThreshold, $SectorExpandMeters)
$title = $cap.titlePrefix + '  Lap=' + $Lap + '  L=' + [math]::Round($lapLen, 0) + 'm  ' + $sub + '  ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')
$g.DrawString($title, $fontTitle, $brushTxt, 10.0, 8.0)
$leg = $cap.legend + '  |  ' + $sub
$g.DrawString($leg, $fontMk, $brushTxt, 10.0, [float]($bmpH - 42))

$bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
$penTrace.Dispose(); $penLeader.Dispose()
$brushRed.Dispose(); $brushGreen.Dispose(); $brushTxt.Dispose(); $brushSf.Dispose()
$fontTitle.Dispose(); $fontMk.Dispose()
Write-Host "Saved: $OutputPath"

```



## 打包exe

没想到打包exe，这个简单的需求反而是最麻烦的，最难处理的。

AI生成的都是powershell的脚本，我想把它打包成一个exe，可以方便使用一些。

打包exe重写的了三遍，第一遍打包exe还要调用脚本，那这个exe的意义何在，第二遍打包各种路径弄不对，第三遍打包增加测试方法以后，总算给出来一个能用的exe了

```powershell
#Requires -Version 5.1
# 将 BuildIdealLineFromReplay.ps1 / DrawZhuhaiLapCorners.ps1 打成 exe。
# 先输出到 %TEMP% 再复制到 tools，避免目标 exe 被占用时 PS2EXE 无法删除旧文件导致打包失败。
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
Import-Module (Join-Path $here 'ps2exe-module\ps2exe.psd1') -Force

function Stop-ToolProcess([string]$exeFileName) {
    $base = [IO.Path]::GetFileNameWithoutExtension($exeFileName)
    Get-Process -Name $base -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

function Copy-ExeToTools {
    param([string]$TempExe, [string]$DestExe)
    Copy-Item -LiteralPath $TempExe -Destination $DestExe -Force
}

$targets = @(
    @{ In = 'BuildIdealLineFromReplay.ps1'; Out = 'BuildIdealLineFromReplay.exe'; Title = 'BuildIdealLineFromReplay'; ConHost = $true },
    @{ In = 'DrawZhuhaiLapCorners.ps1'; Out = 'DrawZhuhaiLapCorners.exe'; Title = 'DrawZhuhaiLapCorners'; ConHost = $false }
)
foreach ($t in $targets) {
    $inPath = Join-Path $here $t.In
    $outPath = Join-Path $here $t.Out
    Write-Host "Building $outPath ..."
    Stop-ToolProcess $t.Out
    Start-Sleep -Milliseconds 400
    $tmp = Join-Path $env:TEMP ('ps2exe_' + [guid]::NewGuid().ToString('N') + '_' + $t.Out)
    try {
        # Draw：System.Drawing 用 -STA；-conHost 会导致脚本未跑完、PNG 不落盘。
        # BuildIdealLine：-conHost 便于无控制台/部分自动化场景结束等待。
        if ($t.ConHost) {
            Invoke-ps2exe -inputFile $inPath -outputFile $tmp -conHost -title $t.Title
        } else {
            Invoke-ps2exe -inputFile $inPath -outputFile $tmp -STA -noConsole:$false -title $t.Title
        }
        Copy-ExeToTools -TempExe $tmp -DestExe $outPath
        Write-Host "  -> $outPath"
    } finally {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    }
}
Write-Host 'Done.'

```



## Summary

最终生成的代码如下，也一起打包了exe

> https://github.com/elmagnificogi/ACRecord2AILine.git



对于AI来完成一个项目一些前提：

1. 项目是否可行，前期需要一些验证性的方案摸底，确定技术方案是否可行，以及AI使用何种方案进行
2. 需求需要明确，越细致越好
3. AI生成的结果需要有基础的测试用例，能量化到具体数值、行为、结果最好，图片化的结果比较麻烦需要人工反馈，给AI自己识别还是存在一定误差的
4. 建议最好把需求点拆成一个阶段一个阶段的，每一步都完成验证以后再进行下一步，而不是一个总体目标和测试结果，会导致AI自己卡在其中反复迭代，无限消耗token，还得不到要的结果



![image-20260406195552167](https://img.elmagnifico.tech/static/upload/elmagnifico/202604061955312.png)

一共就写这么不到2000行的代码，2个需求+一个CI打包，去掉我4月前几天的消耗，大概400wtokens，完成这个消耗了5400万 tokens，这里面有很多cache，但是总体量就得有这么多，平均一行代码消耗2w多tokens，还是很恐怖的。

这么一个需求消耗了接近1/3的Cursor用量，核算下来大概是5刀，30来块钱，看起来挺少的，但是总共耗时大概是7-8小时，是我全程辅助以后的结果。

如果给我7-8小时，纯工作时间，估计也能做到差不多的程度，但是消耗的脑力就很多了，我需要从头开始学习和实验。

后续如果再用AI做需求，再完善一下方法论，再给到AI应该会更快更好一些。
