
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.detection_model import AcneDetector
import yaml

def train_detector():
    """
    Trains the YOLOv8 model.
    Requires a 'data.yaml' file pointing to the dataset in YOLO format.
    The user is responsible for converting their generic dataset to YOLO format 
    (or using a tool like Roboflow which exports to it).
    """
    print("Initializing YOLOv8 training...")
    # Initialize wrapper
    detector = AcneDetector()
    
    # Path to the data.yaml file required by YOLO
    # For now, we point to a placeholder. The user must provide this.
    data_yaml = "data/yolo_dataset/data.yaml"
    
    if not os.path.exists(data_yaml):
        print(f"Error: {data_yaml} not found.")
        print("Please ensure your dataset is formatted for YOLO and the data.yaml path is correct.")
        return

    detector.train(data_yaml_path=data_yaml, epochs=50)
    print("Detection Model Training Complete.")

if __name__ == "__main__":
    train_detector()
