$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$targetDir = "c:\Users\bhagg\OneDrive\Desktop\acne2\frontend\public\models"
$files = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

# Create directory if it doesn't exist
if (!(Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
    Write-Host "Created directory: $targetDir"
}

# Download each file
foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $output = "$targetDir\$file"
    Write-Host "Downloading $file..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
        Write-Host "Wrapper: Downloaded $file"
    } catch {
        Write-Error "Failed to download $file"
    }
}
Write-Host "All downloads complete."
