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
        this.stream = null;

        this.init();
    }

    init() {
        this.screens = {
            login: document.getElementById('login-screen'),
            home: document.getElementById('home-screen'),
            scanner: document.getElementById('scanner-screen'),
            upload: document.getElementById('upload-screen')
        };

        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showScreen('home');
        });

        // Top Nav
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
            this.showScreen('home');
        });

        document.getElementById('btn-back-upload').addEventListener('click', () => {
            this.showScreen('home');
        });

        // Upload
        this.setupUpload();

        // Chatbot
        this.setupChatbot();
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[name].classList.add('active');
    }

    // ==================== CHATBOT ====================

    setupChatbot() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('btn-send');

        const send = () => {
            const text = input.value.trim();
            if (!text) return;
            this.addMessage(text, 'user');
            input.value = '';
            setTimeout(() => this.generateBotReply(text), 600);
        };

        sendBtn.addEventListener('click', send);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') send();
        });
    }

    addMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        const msg = document.createElement('div');
        msg.className = `chat-message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = `<p>${text}</p>`;

        msg.appendChild(avatar);
        msg.appendChild(bubble);
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    generateBotReply(userText) {
        const lower = userText.toLowerCase();
        let reply = '';

        if (lower.includes('acne') && (lower.includes('type') || lower.includes('kind'))) {
            reply = `There are several types of acne:<br>
                • <strong>Whiteheads</strong> — closed clogged pores<br>
                • <strong>Blackheads</strong> — open clogged pores<br>
                • <strong>Papules</strong> — small red bumps<br>
                • <strong>Pustules</strong> — pimples with pus<br>
                • <strong>Nodules</strong> — large, painful lumps beneath the skin<br>
                • <strong>Cysts</strong> — deep, pus-filled lumps<br><br>
                Use the <strong>📷 Scan Face</strong> button above to analyze your skin!`;
        } else if (lower.includes('routine') || lower.includes('skincare') || lower.includes('skin care')) {
            reply = `A good skincare routine for acne-prone skin:<br><br>
                <strong>Morning:</strong><br>
                1. Gentle cleanser (salicylic acid)<br>
                2. Lightweight moisturizer (oil-free)<br>
                3. Sunscreen SPF 30+<br><br>
                <strong>Evening:</strong><br>
                1. Double cleanse<br>
                2. Retinol or benzoyl peroxide<br>
                3. Moisturizer`;
        } else if (lower.includes('treatment') || lower.includes('medicine') || lower.includes('cure')) {
            reply = `Common acne treatments include:<br>
                • <strong>Topical:</strong> Benzoyl peroxide, salicylic acid, retinoids<br>
                • <strong>Oral:</strong> Antibiotics, isotretinoin (severe cases)<br>
                • <strong>Procedures:</strong> Chemical peels, laser therapy<br><br>
                ⚠ Always consult a dermatologist for persistent acne.`;
        } else if (lower.includes('scar') || lower.includes('mark')) {
            reply = `For acne scars & marks:<br>
                • <strong>PIH (dark spots):</strong> Vitamin C serum, niacinamide, AHA<br>
                • <strong>PIE (red marks):</strong> Azelaic acid, time<br>
                • <strong>Atrophic scars:</strong> Microneedling, laser resurfacing<br>
                • <strong>Raised scars:</strong> Silicone sheets, steroid injections<br><br>
                Sunscreen helps prevent marks from darkening!`;
        } else if (lower.includes('diet') || lower.includes('food') || lower.includes('eat')) {
            reply = `Diet can affect acne:<br>
                • <strong>Avoid:</strong> High-glycemic foods, dairy (for some), processed sugars<br>
                • <strong>Eat more:</strong> Omega-3 fatty acids, zinc-rich foods, fruits & vegetables<br>
                • <strong>Stay hydrated:</strong> Drink 8+ glasses of water daily<br><br>
                Diet alone won't cure acne, but it helps!`;
        } else if (lower.includes('scan') || lower.includes('camera') || lower.includes('photo')) {
            reply = `You can analyze your skin in two ways:<br>
                • <strong>📷 Scan Face</strong> — Opens your camera for live scanning<br>
                • <strong>📤 Upload</strong> — Upload an existing photo<br><br>
                Both options are in the top navigation bar!`;
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            reply = `Hello! 👋 I'm your Acne AI assistant. I can help with skincare advice, acne types, treatments, and more. Try asking about:<br>
                • "What types of acne are there?"<br>
                • "Give me a skincare routine"<br>
                • "How to treat acne scars?"`;
        } else {
            reply = `I can help with skincare topics! Try asking about:<br>
                • Types of acne<br>
                • Skincare routines<br>
                • Treatments & medications<br>
                • Acne scars & marks<br>
                • Diet & acne<br><br>
                Or use <strong>📷 Scan Face</strong> / <strong>📤 Upload</strong> above to analyze your skin!`;
        }

        this.addMessage(reply, 'bot');
    }

    // ==================== SCANNER ====================

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
            console.error('Init error:', err);
            this.warningManager.showBanner('⚠ Camera or AI model failed to load.', 'critical');
        }

        this.isRunning = true;
        this.runValidationLoop();
    }

    stopScanner() {
        this.isRunning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        if (this.video) this.video.srcObject = null;
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
            if (!this.analysisCanvas) {
                this.analysisCanvas = document.createElement('canvas');
                this.analysisCanvas.width = 160;
                this.analysisCanvas.height = 120;
            }
            const ctx = this.analysisCanvas.getContext('2d');
            ctx.drawImage(this.video, 0, 0, 160, 120);
            const imageData = ctx.getImageData(0, 0, 160, 120);

            const lightingResult = this.lightingValidator.validate(imageData);
            const faceResult = await this.faceValidator.validate(this.video, this.canvas);
            const qualityResult = this.qualityValidator.validate(imageData, this.video.videoWidth, this.video.videoHeight);

            let overallStatus = 'success';

            this.warningManager.updateCheck('check-face',
                faceResult.faceDetected ? 'pass' : 'fail',
                faceResult.faceDetected ? 'OK' : 'NO FACE');

            const posOk = faceResult.position?.centered && faceResult.position?.goodSize;
            this.warningManager.updateCheck('check-position',
                posOk ? 'pass' : 'fail',
                posOk ? 'OK' : (faceResult.position?.status || 'ADJUST'));

            this.warningManager.updateCheck('check-lighting',
                lightingResult.isValid ? 'pass' : 'fail',
                lightingResult.isValid ? 'OK' : lightingResult.status);

            this.warningManager.updateCheck('check-clarity',
                qualityResult.isValid ? 'pass' : 'fail',
                qualityResult.isValid ? 'OK' : qualityResult.status);

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

            const fill = document.getElementById('brightness-fill');
            if (fill) fill.style.width = `${lightingResult.brightness || 0}%`;

            this.overlay.draw(faceResult, overallStatus);

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
            console.error('Loop error:', err);
        }

        if (this.isRunning) requestAnimationFrame(() => this.runValidationLoop());
    }

    // ==================== UPLOAD ====================

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

        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
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

        ['upload-face', 'upload-lighting', 'upload-clarity', 'upload-acne'].forEach(id => {
            document.getElementById(id).textContent = '⏳';
            document.getElementById(id).className = 'result-value';
        });

        const url = URL.createObjectURL(file);
        previewImg.src = url;
        previewImg.onload = async () => await this.analyzeUploadedImage(previewImg);
    }

    async analyzeUploadedImage(img) {
        try { await this.faceValidator.initialize(); } catch (e) { console.warn(e); }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = 160; smallCanvas.height = 120;
        const sCtx = smallCanvas.getContext('2d');
        sCtx.drawImage(img, 0, 0, 160, 120);
        const imageData = sCtx.getImageData(0, 0, 160, 120);

        const lightingResult = this.lightingValidator.validate(imageData);
        document.getElementById('upload-lighting').textContent = lightingResult.isValid ? '✅ Good' : '⚠ ' + lightingResult.status;
        document.getElementById('upload-lighting').className = 'result-value ' + (lightingResult.isValid ? 'result-pass' : 'result-fail');

        const qualityResult = this.qualityValidator.validate(imageData, img.naturalWidth, img.naturalHeight);
        document.getElementById('upload-clarity').textContent = qualityResult.isValid ? '✅ Clear' : '⚠ ' + qualityResult.status;
        document.getElementById('upload-clarity').className = 'result-value ' + (qualityResult.isValid ? 'result-pass' : 'result-fail');

        try {
            const detections = await faceapi
                .detectAllFaces(tempCanvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
                .withFaceLandmarks().withFaceExpressions();

            const faceCount = detections.length;
            document.getElementById('upload-face').textContent = faceCount > 0 ? `✅ ${faceCount} face${faceCount > 1 ? 's' : ''} found` : '❌ No face';
            document.getElementById('upload-face').className = 'result-value ' + (faceCount > 0 ? 'result-pass' : 'result-fail');

            if (faceCount > 0) {
                const det = detections[0];
                const box = det.detection.box;
                const faceData = ctx.getImageData(
                    Math.max(0, Math.floor(box.x)), Math.max(0, Math.floor(box.y)),
                    Math.min(Math.floor(box.width), tempCanvas.width - Math.floor(box.x)),
                    Math.min(Math.floor(box.height), tempCanvas.height - Math.floor(box.y))
                );
                const acneScore = this.analyzeAcne(faceData);
                const acneEl = document.getElementById('upload-acne');

                if (acneScore < 10) { acneEl.textContent = '✅ Clear skin'; acneEl.className = 'result-value result-pass'; }
                else if (acneScore < 30) { acneEl.textContent = '⚠ Mild — Some spots detected'; acneEl.className = 'result-value result-warn'; }
                else if (acneScore < 60) { acneEl.textContent = '⚠ Moderate — Multiple areas'; acneEl.className = 'result-value result-fail'; }
                else { acneEl.textContent = '🔴 Severe — See a dermatologist'; acneEl.className = 'result-value result-fail'; }

                const overlayCanvas = document.getElementById('upload-overlay');
                overlayCanvas.width = img.naturalWidth; overlayCanvas.height = img.naturalHeight;
                const oCtx = overlayCanvas.getContext('2d');
                oCtx.strokeStyle = '#22c55e'; oCtx.lineWidth = 3;
                oCtx.strokeRect(box.x, box.y, box.width, box.height);
                if (det.landmarks) {
                    oCtx.fillStyle = '#6366f1';
                    det.landmarks.positions.forEach(pt => { oCtx.beginPath(); oCtx.arc(pt.x, pt.y, 2, 0, Math.PI * 2); oCtx.fill(); });
                }
            } else {
                document.getElementById('upload-acne').textContent = '❌ Cannot analyze — no face';
                document.getElementById('upload-acne').className = 'result-value result-fail';
            }
        } catch (err) {
            console.error('Detection error:', err);
            document.getElementById('upload-face').textContent = '❌ Failed';
            document.getElementById('upload-acne').textContent = '❌ Unavailable';
        }
    }

    analyzeAcne(faceImageData) {
        const data = faceImageData.data;
        const pixels = data.length / 4;
        let totalR = 0, totalG = 0, totalB = 0, redSpots = 0;

        for (let i = 0; i < data.length; i += 4) { totalR += data[i]; totalG += data[i + 1]; totalB += data[i + 2]; }
        const avgR = totalR / pixels, avgG = totalG / pixels, avgB = totalB / pixels;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r / (g + b + 1) > 0.7 && Math.abs(r - avgR) + Math.abs(g - avgG) + Math.abs(b - avgB) > 40) redSpots++;
        }
        return Math.min(100, (redSpots / pixels) * 500);
    }
}

document.addEventListener('DOMContentLoaded', () => new ScanController());
