import { FaceValidator } from './face_validator.js';
import { LightingValidator } from './lighting_validator.js';
import { ImageQualityValidator } from './image_quality_validator.js';
import { ScannerOverlay } from './scanner_overlay.js';
import { WarningManager } from './warning_manager.js';

class ScanController {
    constructor() {
        this.faceValidator = new FaceValidator();
        this.lightingValidator = new LightingValidator();
        this.qualityValidator = new ImageQualityValidator();
        this.warningManager = null;
        this.overlay = null;
        this.video = null;
        this.canvas = null;
        this.isRunning = false;
        this.analysisCanvas = null;
        this.stream = null; // Track the camera stream for cleanup

        this.init();
    }

    init() {
        // Screen navigation
        this.screens = {
            login: document.getElementById('login-screen'),
            menu: document.getElementById('menu-screen'),
            scanner: document.getElementById('scanner-screen'),
            upload: document.getElementById('upload-screen')
        };

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showScreen('menu');
        });

        // Menu buttons
        document.getElementById('btn-open-scanner').addEventListener('click', () => {
            this.showScreen('scanner');
            this.startScanner();
        });

        document.getElementById('btn-open-upload').addEventListener('click', () => {
            this.showScreen('upload');
        });

        document.getElementById('btn-logout').addEventListener('click', () => {
            this.showScreen('login');
        });

        // Back buttons
        document.getElementById('btn-back-scanner').addEventListener('click', () => {
            this.stopScanner();
            this.showScreen('menu');
        });

        document.getElementById('btn-back-upload').addEventListener('click', () => {
            this.showScreen('menu');
        });

        // Upload functionality
        this.setupUpload();
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[name].classList.add('active');
    }

    // ==================== SCANNER FLOW ====================

    async startScanner() {
        this.video = document.getElementById('camera-feed');
        this.canvas = document.getElementById('overlay');
        this.overlay = new ScannerOverlay(this.canvas);
        this.warningManager = new WarningManager();

        try {
            await this.startCamera();
            await this.faceValidator.initialize();
            this.warningManager.showBanner('AI Models loaded. Scanning...', 'success');
        } catch (err) {
            console.error('Initialization error:', err);
            this.warningManager.showBanner('⚠ Camera or AI model failed to load.', 'critical');
        }

        this.isRunning = true;
        this.runValidationLoop();
    }

    stopScanner() {
        this.isRunning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    async startCamera() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { exact: 640 }, height: { exact: 480 } }
        });
        this.video.srcObject = this.stream;

        return new Promise((resolve) => {
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                resolve();
            };
        });
    }

    async runValidationLoop() {
        if (!this.isRunning) return;

        try {
            // Get image data
            if (!this.analysisCanvas) {
                this.analysisCanvas = document.createElement('canvas');
                this.analysisCanvas.width = 160;
                this.analysisCanvas.height = 120;
            }
            const ctx = this.analysisCanvas.getContext('2d');
            ctx.drawImage(this.video, 0, 0, 160, 120);
            const imageData = ctx.getImageData(0, 0, 160, 120);

            // Run validators
            const lightingResult = this.lightingValidator.validate(imageData);
            const faceResult = await this.faceValidator.validate(this.video, this.canvas);
            const qualityResult = this.qualityValidator.validate(imageData, this.video.videoWidth, this.video.videoHeight);

            // Update UI
            let overallStatus = 'success';

            // Face
            this.warningManager.updateCheck('check-face',
                faceResult.faceDetected ? 'pass' : 'fail',
                faceResult.faceDetected ? 'OK' : 'NO FACE');

            // Position
            const posOk = faceResult.position?.centered && faceResult.position?.goodSize;
            this.warningManager.updateCheck('check-position',
                posOk ? 'pass' : 'fail',
                posOk ? 'OK' : (faceResult.position?.status || 'ADJUST'));

            // Lighting
            this.warningManager.updateCheck('check-lighting',
                lightingResult.isValid ? 'pass' : 'fail',
                lightingResult.isValid ? 'OK' : lightingResult.status);

            // Clarity
            this.warningManager.updateCheck('check-clarity',
                qualityResult.isValid ? 'pass' : 'fail',
                qualityResult.isValid ? 'OK' : qualityResult.status);

            // Banner
            if (!faceResult.faceDetected) {
                this.warningManager.showBanner('No face detected. Please face the camera.', 'critical');
                overallStatus = 'critical';
            } else if (!lightingResult.isValid) {
                this.warningManager.showBanner(`⚠ ${lightingResult.message}`, 'warning');
                overallStatus = 'warning';
            } else if (!posOk || !qualityResult.isValid) {
                this.warningManager.showBanner('Adjust position for best results.', 'warning');
                overallStatus = 'warning';
            } else {
                this.warningManager.showBanner('✅ All checks passed! Ready to scan.', 'success');
            }

            // Brightness meter
            const fill = document.getElementById('brightness-fill');
            if (fill) fill.style.width = `${lightingResult.brightness || 0}%`;

            // Overlay
            this.overlay.draw(faceResult, overallStatus);

            // Scan button
            const scanBtn = document.getElementById('btn-scan');
            if (overallStatus === 'success') {
                scanBtn.disabled = false;
                scanBtn.classList.remove('disabled');
                scanBtn.textContent = '✅ Ready to Scan';
            } else {
                scanBtn.disabled = true;
                scanBtn.classList.add('disabled');
                scanBtn.textContent = 'Scanning...';
            }

        } catch (err) {
            console.error('Validation loop error:', err);
        }

        if (this.isRunning) {
            requestAnimationFrame(() => this.runValidationLoop());
        }
    }

    // ==================== UPLOAD FLOW ====================

    setupUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const chooseBtn = document.getElementById('btn-choose-file');
        const reuploadBtn = document.getElementById('btn-reupload');

        chooseBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) this.handleUploadedFile(e.target.files[0]);
        });

        reuploadBtn.addEventListener('click', () => {
            document.getElementById('upload-preview').classList.add('hidden');
            dropZone.classList.remove('hidden');
            fileInput.value = '';
        });

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) this.handleUploadedFile(e.dataTransfer.files[0]);
        });
    }

    async handleUploadedFile(file) {
        if (!file.type.startsWith('image/')) return;

        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('upload-preview');
        const previewImg = document.getElementById('preview-img');

        dropZone.classList.add('hidden');
        preview.classList.remove('hidden');

        // Reset results
        ['upload-face', 'upload-lighting', 'upload-clarity', 'upload-acne'].forEach(id => {
            document.getElementById(id).textContent = '⏳';
        });

        // Load image
        const url = URL.createObjectURL(file);
        previewImg.src = url;

        previewImg.onload = async () => {
            await this.analyzeUploadedImage(previewImg);
        };
    }

    async analyzeUploadedImage(img) {
        // Initialize face-api if not already done
        try {
            await this.faceValidator.initialize();
        } catch (e) {
            console.warn('Model load warning:', e);
        }

        // Create a canvas for analysis
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Lighting check
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = 160;
        smallCanvas.height = 120;
        const sCtx = smallCanvas.getContext('2d');
        sCtx.drawImage(img, 0, 0, 160, 120);
        const imageData = sCtx.getImageData(0, 0, 160, 120);

        const lightingResult = this.lightingValidator.validate(imageData);
        document.getElementById('upload-lighting').textContent =
            lightingResult.isValid ? '✅ Good' : '⚠ ' + lightingResult.status;
        document.getElementById('upload-lighting').className =
            'result-value ' + (lightingResult.isValid ? 'result-pass' : 'result-fail');

        // Quality check
        const qualityResult = this.qualityValidator.validate(imageData, img.naturalWidth, img.naturalHeight);
        document.getElementById('upload-clarity').textContent =
            qualityResult.isValid ? '✅ Clear' : '⚠ ' + qualityResult.status;
        document.getElementById('upload-clarity').className =
            'result-value ' + (qualityResult.isValid ? 'result-pass' : 'result-fail');

        // Face detection
        try {
            const detections = await faceapi
                .detectAllFaces(tempCanvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceExpressions();

            const faceCount = detections.length;
            document.getElementById('upload-face').textContent =
                faceCount > 0 ? `✅ ${faceCount} face${faceCount > 1 ? 's' : ''} found` : '❌ No face';
            document.getElementById('upload-face').className =
                'result-value ' + (faceCount > 0 ? 'result-pass' : 'result-fail');

            // Simple acne analysis based on skin tone variability
            if (faceCount > 0) {
                const det = detections[0];
                const box = det.detection.box;
                const faceData = ctx.getImageData(
                    Math.max(0, Math.floor(box.x)),
                    Math.max(0, Math.floor(box.y)),
                    Math.min(Math.floor(box.width), tempCanvas.width - Math.floor(box.x)),
                    Math.min(Math.floor(box.height), tempCanvas.height - Math.floor(box.y))
                );
                const acneScore = this.analyzeAcne(faceData);
                const acneEl = document.getElementById('upload-acne');

                if (acneScore < 10) {
                    acneEl.textContent = '✅ Clear skin — No significant acne detected';
                    acneEl.className = 'result-value result-pass';
                } else if (acneScore < 30) {
                    acneEl.textContent = '⚠ Mild — Some spots detected';
                    acneEl.className = 'result-value result-warn';
                } else if (acneScore < 60) {
                    acneEl.textContent = '⚠ Moderate — Multiple areas affected';
                    acneEl.className = 'result-value result-fail';
                } else {
                    acneEl.textContent = '🔴 Severe — Consider consulting a dermatologist';
                    acneEl.className = 'result-value result-fail';
                }

                // Draw face box on overlay
                const overlayCanvas = document.getElementById('upload-overlay');
                overlayCanvas.width = img.naturalWidth;
                overlayCanvas.height = img.naturalHeight;
                const oCtx = overlayCanvas.getContext('2d');
                oCtx.strokeStyle = faceCount > 0 ? '#22c55e' : '#ef4444';
                oCtx.lineWidth = 3;
                oCtx.strokeRect(box.x, box.y, box.width, box.height);

                // Draw landmarks
                if (det.landmarks) {
                    const points = det.landmarks.positions;
                    oCtx.fillStyle = '#6366f1';
                    points.forEach(pt => {
                        oCtx.beginPath();
                        oCtx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
                        oCtx.fill();
                    });
                }
            } else {
                document.getElementById('upload-acne').textContent = '❌ Cannot analyze — no face detected';
                document.getElementById('upload-acne').className = 'result-value result-fail';
            }
        } catch (err) {
            console.error('Face detection error:', err);
            document.getElementById('upload-face').textContent = '❌ Detection failed';
            document.getElementById('upload-acne').textContent = '❌ Analysis unavailable';
        }
    }

    analyzeAcne(faceImageData) {
        // Simple color variance analysis to detect skin irregularities
        const data = faceImageData.data;
        const pixels = data.length / 4;

        let totalR = 0, totalG = 0, totalB = 0;
        let redSpots = 0;

        // First pass: get average skin color
        for (let i = 0; i < data.length; i += 4) {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
        }

        const avgR = totalR / pixels;
        const avgG = totalG / pixels;
        const avgB = totalB / pixels;

        // Second pass: find pixels that deviate significantly (redness/inflammation)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];

            // Check for reddish spots (higher red relative to green/blue)
            const redRatio = r / (g + b + 1);
            const deviation = Math.abs(r - avgR) + Math.abs(g - avgG) + Math.abs(b - avgB);

            if (redRatio > 0.7 && deviation > 40) {
                redSpots++;
            }
        }

        // Score = percentage of irregular pixels (scale to 0-100)
        return Math.min(100, (redSpots / pixels) * 500);
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScanController();
});
