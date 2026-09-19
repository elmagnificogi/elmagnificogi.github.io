param(
    [Parameter(Mandatory = $true)][string]$Src,
    [Parameter(Mandatory = $true)][string]$Dst,
    [string]$Post
)

Add-Type -AssemblyName System.Drawing
$srcImg = [System.Drawing.Image]::FromFile($Src)
$W = 1870
$H = 550
$scaledH = [int][Math]::Round($srcImg.Height * $W / $srcImg.Width)
$scaled = New-Object System.Drawing.Bitmap $W, $scaledH
$g = [System.Drawing.Graphics]::FromImage($scaled)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($srcImg, 0, 0, $W, $scaledH)
$cropY = [Math]::Max(0, [int](($scaledH - $H) / 2))
$crop = New-Object System.Drawing.Bitmap $W, $H
$g2 = [System.Drawing.Graphics]::FromImage($crop)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($scaled, (New-Object System.Drawing.Rectangle 0, 0, $W, $H), (New-Object System.Drawing.Rectangle 0, $cropY, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$enc = New-Object System.Drawing.Imaging.EncoderParameters 1
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]90)
$dir = Split-Path $Dst -Parent
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$crop.Save($Dst, $jpegCodec, $enc)
$g2.Dispose(); $crop.Dispose(); $g.Dispose(); $scaled.Dispose(); $srcImg.Dispose()

if ($Post) {
    $text = [System.IO.File]::ReadAllText($Post)
    $rel = ($Dst -replace '\\', '/') -replace '.*/img/', 'img/'
    $updated = [regex]::Replace($text, '(?m)^header-img:\s*".*"', "header-img: `"$rel`"")
    [System.IO.File]::WriteAllText($Post, $updated)
    Write-Output "updated $Post -> $rel"
}
Write-Output "saved $Dst"
