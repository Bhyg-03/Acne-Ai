
class ModelLoader {
    constructor(modelUrl) {
        this.modelUrl = modelUrl;
        this.model = null;
    }

    async load() {
        try {
            console.log(`Loading model from ${this.modelUrl}...`);
            this.model = await tf.loadLayersModel(this.modelUrl);
            console.log("Model loaded successfully.");
            return true;
        } catch (error) {
            console.error("Error loading model:", error);
            return false;
        }
    }

    getModel() {
        return this.model;
    }
}
