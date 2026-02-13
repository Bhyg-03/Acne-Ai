
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import yaml

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def get_train_augmentation_generator():
    """
    Returns an ImageDataGenerator with the specific augmentations requested.
    - Random horizontal flip (NO vertical flip)
    - Random rotation, zoom, brightness, contrast
    """
    config = load_config()
    aug = config['augmentation']
    
    datagen = ImageDataGenerator(
        rescale=1./255, # Normalize pixel values
        rotation_range=aug['rotation_range'],
        width_shift_range=aug['width_shift_range'],
        height_shift_range=aug['height_shift_range'],
        brightness_range=aug['brightness_range'],
        zoom_range=aug['zoom_range'],
        horizontal_flip=aug['horizontal_flip'],
        vertical_flip=aug['vertical_flip'], # Should be False for faces
        fill_mode='nearest'
        # Note: Contrast/Hue are better handled via tf.image inside a custom map function 
        # but ImageDataGenerator allows for some basic ones. 
        # For more complex pipelines, we'd use tf.data.Dataset with tf.image functions.
    )
    return datagen

def get_basic_generator():
    """
    Returns a basic generator (rescaling only) for validation/testing.
    """
    return ImageDataGenerator(rescale=1./255)
