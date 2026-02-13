
import os
import sys
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import yaml

# Add project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.augment_data import get_basic_generator

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def evaluate():
    config = load_config()
    processed_dir = config['paths']['processed_data']
    model_path = os.path.join(config['paths']['models'], 'best_classifier.keras')
    img_size = tuple(config['data']['image_size'])
    batch_size = config['data']['batch_size']
    
    if not os.path.exists(model_path):
        print("Model not found.")
        return

    print("Loading test data...")
    test_datagen = get_basic_generator()
    test_generator = test_datagen.flow_from_directory(
        os.path.join(processed_dir, 'test'),
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )
    
    print("Loading model...")
    model = tf.keras.models.load_model(model_path)
    
    print("Evaluating...")
    Y_pred = model.predict(test_generator)
    y_pred = np.argmax(Y_pred, axis=1)
    y_true = test_generator.classes
    
    print("Classification Report:")
    report = classification_report(y_true, y_pred, target_names=config['data']['class_names'])
    print(report)
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=config['data']['class_names'], yticklabels=config['data']['class_names'])
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.savefig('evaluation/confusion_matrix.png')
    print("Confusion matrix saved to evaluation/confusion_matrix.png")

if __name__ == "__main__":
    evaluate()
