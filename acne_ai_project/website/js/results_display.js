
class ResultsDisplay {
    constructor() {
        this.resultsContainer = document.getElementById('results');
        this.diagnosisText = document.getElementById('diagnosis-type');
        this.confidenceText = document.getElementById('confidence-text');
        this.confidenceBar = document.getElementById('confidence-fill');
        this.recommendationsContainer = document.createElement('div');
        this.recommendationsContainer.className = 'recommendations';
        document.getElementById('report-content').appendChild(this.recommendationsContainer);
    }

    show(result, recommendations = []) {
        this.resultsContainer.classList.remove('hidden');

        // Diagnosis
        this.diagnosisText.textContent = result.class;
        const confidencePercent = Math.round(result.confidence * 100);
        this.confidenceText.textContent = `${confidencePercent}% Confidence`;
        this.confidenceBar.style.width = `${confidencePercent}%`;

        // Dynamic Recommendations
        this.renderRecommendations(recommendations, result.class);
    }

    renderRecommendations(recDb, acneClass) {
        this.recommendationsContainer.innerHTML = '<h3>Recommendations</h3>';

        // Filter recs if available
        if (recDb && recDb[acneClass]) {
            const data = recDb[acneClass];
            const ul = document.createElement('ul');
            data.treatments.forEach(t => {
                const li = document.createElement('li');
                li.textContent = t;
                ul.appendChild(li);
            });
            this.recommendationsContainer.appendChild(ul);
        } else {
            this.recommendationsContainer.innerHTML += '<p>Consult a dermatologist for specific advice.</p>';
        }
    }
}
