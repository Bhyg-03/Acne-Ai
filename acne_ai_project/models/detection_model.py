
from ultralytics import YOLO
import yaml

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

class AcneDetector:
    def __init__(self, model_path=None):
        """
        Wrapper for YOLOv8 model.
        If model_path is None, loads a pre-trained 'yolov8m.pt' (medium) model.
        """
        if model_path:
            self.model = YOLO(model_path)
        else:
            self.model = YOLO('yolov8m.pt') # Start with base model for transfer learning

    def train(self, data_yaml_path, epochs=50):
        """
        Train the model using Ultralytics API.
        data_yaml_path: Path to dataset.yaml in YOLO format.
        """
        results = self.model.train(data=data_yaml_path, epochs=epochs, imgsz=640)
        return results

    def predict(self, image_path, conf_threshold=0.25):
        """
        Run inference on a single image.
        """
        results = self.model.predict(image_path, conf=conf_threshold)
        return results

if __name__ == "__main__":
    detector = AcneDetector()
    print("YOLOv8 Wrapper Initialized.")
