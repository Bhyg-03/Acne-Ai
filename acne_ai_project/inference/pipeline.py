
import os
import sys
import numpy as np
import cv2
import json
import tensorflow as tf
from models.detection_model import AcneDetector
from inference.face_detection import FaceDetector
import yaml

# Add project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def load_labels(labels_path="config/class_labels.json"):
    with open(labels_path, "r") as f:
        return json.load(f)

class AcnePipeline:
    def __init__(self):
        self.config = load_config()
        self.labels = load_labels()
        
        # Load Face Detector
        self.face_detector = FaceDetector()
        
        # Load Classifier
        self.classifier_path = os.path.join(self.config['paths']['models'], 'best_classifier.keras')
        if os.path.exists(self.classifier_path):
            self.classifier = tf.keras.models.load_model(self.classifier_path)
            print("Classifier loaded.")
        else:
            print("Warning: Classifier model not found. Run training first.")
            self.classifier = None
            
        # Load YOLO Detector
        self.yolo = AcneDetector() # Wrapper loads default or trained model
        
    def predict(self, image_path):
        """
        Full pipeline:
        1. Detect Face -> Crop
        2. Classify (Box-level or Whole Face)
        3. Detect Spots (YOLO)
        4. Generate Report
        """
        # 1. Face Detection
        original_img = cv2.imread(image_path)
        if original_img is None:
            return {"error": "Could not read image"}
            
        rgb_img = cv2.cvtColor(original_img, cv2.COLOR_BGR2RGB)
        cropped_face, bbox = self.face_detector.detect_and_crop(rgb_img)
        
        if cropped_face is None:
            return {"status": "failed", "message": "No face detected"}
            
        # 2. Classification
        primary_diagnosis = None
        if self.classifier:
            # Resize to input shape
            img_size = tuple(self.config['data']['image_size'])
            input_img = cv2.resize(cropped_face, img_size)
            input_img = input_img / 255.0
            input_img = np.expand_dims(input_img, axis=0)
            
            preds = self.classifier.predict(input_img)
            top_idx = np.argmax(preds[0])
            confidence = float(preds[0][top_idx])
            
            primary_diagnosis = {
                "acne_type": self.labels[str(top_idx)],
                "confidence": round(confidence * 100, 2)
            }
            
        # 3. Spot Detection (YOLO)
        # YOLO expects image path or numpy array. We pass the cropped face.
        yolo_results = self.yolo.predict(cropped_face)
        
        detected_spots = {
            "total_count": len(yolo_results[0].boxes),
            "breakdown": {} # Provide class breakdown if YOLO trained on classes
        }
        
        # 4. Final Report
        report = {
            "status": "success",
            "face_detected": True,
            "primary_diagnosis": primary_diagnosis,
            "detected_spots": detected_spots,
            "recommendations": [] # Fetch from recommendations.json
        }
        
        return report

if __name__ == "__main__":
    # Test run
    pipeline = AcnePipeline()
    print("Pipeline ready.")
