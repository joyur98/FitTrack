# Path to cloudflared executable (update this)
$cloudflaredPath = "../cloudflared.exe"

# Start cloudflared quick tunnel to localhost:3000 and redirect output to log
$cloudflaredProcess = Start-Process -FilePath $cloudflaredPath `
    -ArgumentList "tunnel", "--url", "http://localhost:3000", "--no-autoupdate" `
    -RedirectStandardOutput "cloudflared.log" -PassThru

Write-Host "Starting Cloudflare quick tunnel..."

# Wait for the tunnel URL to appear in the log
$tunnelUrl = $null
for ($i=0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    $logLines = Get-Content "cloudflared.log" -Tail 20
    foreach ($line in $logLines) {
        if ($line -match "https://.*\.trycloudflare\.com") {
            $tunnelUrl = $matches[0]
            break
        }
    }
    if ($tunnelUrl) { break }
}

if ($tunnelUrl) {
    Write-Host "Tunnel ready at $tunnelUrl"

    # Set the environment variable for server.js
    $env:BACKEND_URL = "$tunnelUrl/chat"

    Write-Host "Starting Node.js server with BACKEND_URL=$env:BACKEND_URL"
    
    # Start your Node.js server
    node server.js
} else {
    Write-Host "Failed to detect tunnel URL. Check cloudflared.log for details."
}
