
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import tensorflow as tf
import yaml
from models.severity_model import build_severity_model
from data.augment_data import get_train_augmentation_generator, get_basic_generator

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def train_severity_model():
    """
    Trains the severity regression model.
    Note: This requires specific 'severity' labels which standard classification datasets might not have.
    We assume the generator yields (image, severity_score) if modeled differently, 
    but for now we'll stick to standard flow and assume the user has formatted the data 
    such that 'class indices' might map to severity, or needs custom data loader.
    """
    print("Starting Severity Model Training...")
    # Placeholder for custom regression data loading logic
    # As standard ImageDataGenerator is for classification, we would need 
    # flow_from_dataframe with a 'severity' column.
    
    print("Note: Severity training requires a CSV mapping images to severity scores (0-100).")
    print("This script is a template. Please implement the 'flow_from_dataframe' logic with your specific CSV.")
    
    # Example logic (commented out):
    # df = pd.read_csv('data/severity_labels.csv')
    # train_gen = datagen.flow_from_dataframe(df, x_col='filename', y_col='severity', class_mode='raw')
    
    # Build Model
    model = build_severity_model()
    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    
    # model.fit(...)
    print("Severity model built. Please configure data loading to proceed.")

if __name__ == "__main__":
    train_severity_model()
