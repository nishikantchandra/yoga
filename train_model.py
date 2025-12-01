"""
Yoga Pose Classification Model Training
Trains a custom model on the yoga pose dataset using TensorFlow/Keras
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
import json
from datetime import datetime

# Configuration
DATASET_ROOT = r"d:\Shah\NNDL\archive\DATASET"
TRAIN_DIR = os.path.join(DATASET_ROOT, "TRAIN")
TEST_DIR = os.path.join(DATASET_ROOT, "TEST")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001

POSE_CLASSES = ['downdog', 'goddess', 'plank', 'tree', 'warrior2']
NUM_CLASSES = len(POSE_CLASSES)

# Create output directory
OUTPUT_DIR = "model_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_data_generators():
    """Create data generators with augmentation"""
    print("Creating data generators...")
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Test data (only rescaling)
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Load training data
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    # Load test data
    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    print(f"✅ Training samples: {train_generator.samples}")
    print(f"✅ Testing samples: {test_generator.samples}")
    print(f"✅ Classes: {train_generator.class_indices}")
    
    return train_generator, test_generator

def build_model():
    """Build the model using transfer learning"""
    print("\nBuilding model with MobileNetV2...")
    
    # Load pre-trained MobileNetV2
    base_model = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    # Build model
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
    )
    
    print("✅ Model built successfully!")
    model.summary()
    
    return model

def train_model(model, train_gen, test_gen):
    """Train the model"""
    print("\n" + "=" * 80)
    print("TRAINING MODEL")
    print("=" * 80)
    
    # Callbacks
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            os.path.join(OUTPUT_DIR, 'best_model.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Train
    history = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=test_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    return history

def plot_training_history(history):
    """Plot training history"""
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Accuracy
    axes[0].plot(history.history['accuracy'], label='Train Accuracy', linewidth=2)
    axes[0].plot(history.history['val_accuracy'], label='Val Accuracy', linewidth=2)
    axes[0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].legend()
    axes[0].grid(alpha=0.3)
    
    # Loss
    axes[1].plot(history.history['loss'], label='Train Loss', linewidth=2)
    axes[1].plot(history.history['val_loss'], label='Val Loss', linewidth=2)
    axes[1].set_title('Model Loss', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].legend()
    axes[1].grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'training_history.png'), dpi=300, bbox_inches='tight')
    print(f"\n✅ Saved: {os.path.join(OUTPUT_DIR, 'training_history.png')}")
    plt.show()

def evaluate_model(model, test_gen):
    """Evaluate the model"""
    print("\n" + "=" * 80)
    print("EVALUATING MODEL")
    print("=" * 80)
    
    # Evaluate
    results = model.evaluate(test_gen, verbose=1)
    
    print(f"\n📊 Test Results:")
    print(f"  Loss: {results[0]:.4f}")
    print(f"  Accuracy: {results[1]:.4f}")
    print(f"  Top-2 Accuracy: {results[2]:.4f}")
    
    return results

def save_model_for_tfjs(model):
    """Save model in TensorFlow.js format"""
    print("\nConverting model to TensorFlow.js format...")
    
    tfjs_dir = os.path.join(OUTPUT_DIR, 'tfjs_model')
    
    # Save as TensorFlow.js
    import tensorflowjs as tfjs
    tfjs.converters.save_keras_model(model, tfjs_dir)
    
    print(f"✅ Model saved for TensorFlow.js at: {tfjs_dir}")
    
    # Save class labels
    class_labels = {
        'classes': POSE_CLASSES,
        'num_classes': NUM_CLASSES
    }
    
    with open(os.path.join(tfjs_dir, 'class_labels.json'), 'w') as f:
        json.dump(class_labels, f, indent=2)
    
    print(f"✅ Class labels saved")

def generate_training_report(history, results, train_gen):
    """Generate comprehensive training report"""
    report = {
        'training_info': {
            'timestamp': datetime.now().isoformat(),
            'img_size': IMG_SIZE,
            'batch_size': BATCH_SIZE,
            'epochs': EPOCHS,
            'learning_rate': LEARNING_RATE,
            'num_classes': NUM_CLASSES,
            'classes': POSE_CLASSES
        },
        'dataset_info': {
            'train_samples': train_gen.samples,
            'class_distribution': {k: int(v) for k, v in zip(train_gen.class_indices.keys(), 
                                                              np.bincount(train_gen.classes))}
        },
        'final_metrics': {
            'train_accuracy': float(history.history['accuracy'][-1]),
            'val_accuracy': float(history.history['val_accuracy'][-1]),
            'train_loss': float(history.history['loss'][-1]),
            'val_loss': float(history.history['val_loss'][-1]),
            'test_loss': float(results[0]),
            'test_accuracy': float(results[1]),
            'test_top2_accuracy': float(results[2])
        },
        'best_metrics': {
            'best_val_accuracy': float(max(history.history['val_accuracy'])),
            'best_val_accuracy_epoch': int(np.argmax(history.history['val_accuracy']) + 1)
        }
    }
    
    with open(os.path.join(OUTPUT_DIR, 'training_report.json'), 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "=" * 80)
    print("📋 TRAINING REPORT")
    print("=" * 80)
    print(json.dumps(report, indent=2))
    print(f"\n✅ Saved: {os.path.join(OUTPUT_DIR, 'training_report.json')}")
    
    return report

if __name__ == "__main__":
    print("=" * 80)
    print("YOGA POSE CLASSIFICATION - MODEL TRAINING")
    print("=" * 80)
    
    # 1. Create data generators
    train_gen, test_gen = create_data_generators()
    
    # 2. Build model
    model = build_model()
    
    # 3. Train model
    history = train_model(model, train_gen, test_gen)
    
    # 4. Plot training history
    plot_training_history(history)
    
    # 5. Evaluate model
    results = evaluate_model(model, test_gen)
    
    # 6. Save model for TensorFlow.js
    save_model_for_tfjs(model)
    
    # 7. Generate report
    report = generate_training_report(history, results, train_gen)
    
    print("\n" + "=" * 80)
    print("✅ TRAINING COMPLETE!")
    print("=" * 80)
    print(f"\nModel files saved in: {OUTPUT_DIR}/")
    print("  - best_model.keras (Keras format)")
    print("  - tfjs_model/ (TensorFlow.js format)")
    print("  - training_history.png")
    print("  - training_report.json")
