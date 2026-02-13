
import os
import shutil
import random
import yaml
import cv2
import numpy as np
from tqdm import tqdm
from sklearn.model_selection import train_test_split

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def clean_and_validate_image(image_path):
    """
    Validates if an image file is readable and not corrupt.
    Returns the image if valid, else None.
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
        return img
    except Exception as e:
        print(f"Error reading {image_path}: {e}")
        return None

def prepare_dataset():
    """
    Main function to organize raw data into Train/Val/Test splits.
    Assumes raw data is in 'data/raw/<class_name>/<images>'
    """
    config = load_config()
    raw_dir = config['paths']['raw_data']
    processed_dir = config['paths']['processed_data']
    classes = config['data']['class_names']
    
    # Create split directories
    for split in ['train', 'val', 'test']:
        for cls in classes:
            os.makedirs(os.path.join(processed_dir, split, cls), exist_ok=True)
            
    print(f"Processing data from {raw_dir}...")
    
    for cls in classes:
        cls_dir = os.path.join(raw_dir, cls)
        if not os.path.exists(cls_dir):
            print(f"Warning: Class directory {cls_dir} does not exist. Skipping.")
            continue
            
        images = [os.path.join(cls_dir, f) for f in os.listdir(cls_dir) 
                  if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
        
        # Shuffle to ensure random splitting
        random.shuffle(images)
        
        # Validate images
        valid_images = []
        for img_path in tqdm(images, desc=f"Validating {cls}"):
            if clean_and_validate_image(img_path) is not None:
                valid_images.append(img_path)
            else:
                os.remove(img_path) # Optionally remove corrupt files
                
        # Split (70% Train, 15% Val, 15% Test)
        train_imgs, temp_imgs = train_test_split(
            valid_images, test_size=(1 - config['data']['train_split']), random_state=42
        )
        val_imgs, test_imgs = train_test_split(
            temp_imgs, test_size=0.5, random_state=42 # Split remaining 30% into 15%/15%
        )
        
        # Copy to respective directories
        for img_path in train_imgs:
            shutil.copy(img_path, os.path.join(processed_dir, 'train', cls, os.path.basename(img_path)))
            
        for img_path in val_imgs:
            shutil.copy(img_path, os.path.join(processed_dir, 'val', cls, os.path.basename(img_path)))
            
        for img_path in test_imgs:
            shutil.copy(img_path, os.path.join(processed_dir, 'test', cls, os.path.basename(img_path)))
            
        print(f"Class {cls}: Train={len(train_imgs)}, Val={len(val_imgs)}, Test={len(test_imgs)}")
        
    print("Dataset preparation complete.")

if __name__ == "__main__":
    prepare_dataset()
