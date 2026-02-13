
// Initialize logic
document.addEventListener('DOMContentLoaded', async () => {
    const startBtn = document.getElementById('start-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const video = document.getElementById('webcam');

    // 1. Load Model
    // Note: This expects the model to be hosted at this path. 
    // You must run 'python export/export_tfjs.py' first and serve directory.
    const loader = new ModelLoader('../export/web/tfjs_model/model.json');
    await loader.load();
    const detector = new AcneDetector(loader.getModel());

    // 2. Camera Setup
    startBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            video.srcObject = stream;
            analyzeBtn.disabled = false;
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access camera");
        }
    });

    // 3. Analysis
    analyzeBtn.addEventListener('click', async () => {
        if (!loader.getModel()) {
            alert("AI Model is still loading...");
            return;
        }

        document.getElementById('loading').classList.remove('hidden');

        // Wait for video to be ready
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const result = await detector.predict(video);
            displayResult(result);
        }

        document.getElementById('loading').classList.add('hidden');
    });

    function displayResult(result) {
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('diagnosis-type').textContent = result.class;
        document.getElementById('confidence-text').textContent = Math.round(result.confidence * 100) + "% Confidence";
        document.getElementById('confidence-fill').style.width = (result.confidence * 100) + "%";
    }
});
