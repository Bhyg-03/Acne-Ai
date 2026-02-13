
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization

def build_severity_model(input_shape=(224, 224, 3)):
    """
    Builds a regression model to predict severity score (0-100).
    Uses EfficientNetB0 backbone.
    """
    base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=input_shape)
    
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    
    # Regression Output: Single unit, linear activation (or sigmoid * 100)
    # Using sigmoid * 100 ensures output is strictly 0-100
    x = Dense(1, activation='sigmoid')(x)
    outputs = tf.keras.layers.Lambda(lambda x: x * 100)(x)
    
    model = Model(inputs=base_model.input, outputs=outputs)
    return model

if __name__ == "__main__":
    model = build_severity_model()
    model.summary()
