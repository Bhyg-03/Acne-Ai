# Acne AI - Intelligent Acne Detection System

A complete, production-ready AI/ML pipeline to train an acne detection and classification model that can accurately detect and classify different types of acne on human faces.

## Objective
Build a deep learning model that can:
1. Detect acne on facial images
2. Classify acne into 7 specific types (Clear, Blackheads, Whiteheads, Papules, Pustules, Nodules, Cystic)
3. Determine severity level
4. Provide confidence scores
5. Work accurately across all skin tones and lighting conditions
6. Be deployed on a website using TensorFlow.js

## Directory Structure
- `data/`: Scripts for dataset download, preparation, and augmentation.
- `models/`: Model definitions (EfficientNetB3, YOLOv8).
- `training/`: Training loops and scripts.
- `evaluation/`: Metrics calculations and visualizations.
- `export/`: Scripts to export models to TF.js, TFLite, ONNX.
- `inference/`: Inference pipeline for single images.
- `api/`: Flask/FastAPI backend.
- `website/`: Web integration code.
- `config/`: Configuration files and label maps.

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure settings in `config/config.yaml`.

## Usage
### Training
To train the classifier:
```bash
python training/train_classifier.py
```

### Inference
To run inference on a single image:
```bash
python inference/predict.py --image path/to/image.jpg
```

### Web Deployment
To export the model for web:
```bash
python export/export_tfjs.py
```
