
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3, ResNet50
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization, Average, Input

def build_ensemble_model(input_shape=(224, 224, 3), num_classes=7):
    """
    Builds an ensemble model averaging predictions from EfficientNetB3 and ResNet50.
    """
    input_tensor = Input(shape=input_shape)
    
    # Model 1: EfficientNetB3
    eff_base = EfficientNetB3(weights='imagenet', include_top=False, input_tensor=input_tensor)
    eff_base.trainable = False
    x1 = eff_base.output
    x1 = GlobalAveragePooling2D()(x1)
    x1 = Dense(256, activation='relu')(x1)
    out1 = Dense(num_classes, activation='softmax', name='eff_output')(x1)
    
    # Model 2: ResNet50
    res_base = ResNet50(weights='imagenet', include_top=False, input_tensor=input_tensor)
    res_base.trainable = False
    x2 = res_base.output
    x2 = GlobalAveragePooling2D()(x2)
    x2 = Dense(256, activation='relu')(x2)
    out2 = Dense(num_classes, activation='softmax', name='res_output')(x2)
    
    # Average Predictions
    outputs = Average()([out1, out2])
    
    model = Model(inputs=input_tensor, outputs=outputs)
    return model

if __name__ == "__main__":
    model = build_ensemble_model()
    model.summary()
