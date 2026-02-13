
class Recommendations {
    constructor() {
        this.db = null;
    }

    async load() {
        try {
            // Load from project config
            // In a real deployed web app, you'd fetch this from a JSON file served by backend
            // or embedded. For this pipeline, we will fetch the config file.
            const response = await fetch('../../config/recommendations.json');
            this.db = await response.json();
        } catch (e) {
            console.error("Could not load recommendations:", e);
            // Fallback
            this.db = {};
        }
    }

    getForClass(className) {
        return this.db ? this.db[className] : null;
    }

    getAll() {
        return this.db;
    }
}
