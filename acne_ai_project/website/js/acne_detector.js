
class AcneDetector {
    constructor(model) {
        this.model = model;
        this.LABELS = ["Clear Skin", "Blackheads", "Whiteheads", "Papules", "Pustules", "Nodules", "Cystic Acne"];
    }

    async predict(videoElement) {
        if (!this.model) {
            throw new Error("Model not loaded");
        }

        // Preprocess: Resize to 224x224, Normalize
        const tensor = tf.tidy(() => {
            const img = tf.browser.fromPixels(videoElement);
            const resized = tf.image.resizeBilinear(img, [224, 224]);
            const normalized = resized.div(255.0);
            return normalized.expandDims(0);
        });

        // Inference
        const predictions = await this.model.predict(tensor).data();

        // Cleanup tensor (memory management)
        tensor.dispose();

        // Get Top Class
        const maxVal = Math.max(...predictions);
        const maxIdx = predictions.indexOf(maxVal);

        return {
            class: this.LABELS[maxIdx],
            confidence: maxVal,
            all_scores: predictions
        };
    }
}
