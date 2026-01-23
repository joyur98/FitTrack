# Start cloudflared quick tunnel in background and capture URL
$cloudflaredProcess = Start-Process -FilePath "../cloudflared.exe" `
    -ArgumentList "tunnel", "--url", "http://localhost:3000", "--no-autoupdate" `
    -RedirectStandardOutput "cloudflared.log" -PassThru

# Wait a few seconds for it to start
Start-Sleep -Seconds 5

# Read the generated tunnel URL from the log
$tunnelLog = Get-Content "cloudflared.log" -Tail 20
foreach ($line in $tunnelLog) {
    if ($line -match "https://.*\.trycloudflare\.com") {
        $env:BACKEND_URL = $matches[0]
        Write-Host "Tunnel URL detected: $env:BACKEND_URL"
    }
}
