
import os
import sys
import tensorflowjs as tfjs
import tensorflow as tf
import yaml

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def export_to_tfjs():
    config = load_config()
    model_path = os.path.join(config['paths']['models'], 'best_classifier.keras')
    output_dir = os.path.join(config['paths']['exports'], 'tfjs_model')
    
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return

    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    print(f"Exporting to TensorFlow.js format at {output_dir}...")
    tfjs.converters.save_keras_model(model, output_dir)
    print("Export complete.")

if __name__ == "__main__":
    export_to_tfjs()
