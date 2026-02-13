
import tensorflow as tf

def unfreeze_and_compile(model, learning_rate=0.0001, unfreeze_percentage=0.3):
    """
    Utility function to unfreeze the top N% of a model for fine-tuning.
    """
    model.trainable = True
    
    num_layers = len(model.layers)
    freeze_until = int(num_layers * (1 - unfreeze_percentage))
    
    print(f"Fine-tuning: Freezing first {freeze_until} layers, Unfreezing rest.")
    
    for layer in model.layers[:freeze_until]:
        if not isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False
            
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model
