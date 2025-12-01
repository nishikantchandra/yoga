"""
Yoga Pose Dataset - Exploratory Data Analysis (EDA)
This notebook analyzes the yoga pose dataset and prepares it for model training.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
from pathlib import Path
import json

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)

# Dataset paths
DATASET_ROOT = r"d:\Shah\NNDL\archive\DATASET"
TRAIN_DIR = os.path.join(DATASET_ROOT, "TRAIN")
TEST_DIR = os.path.join(DATASET_ROOT, "TEST")

# Pose classes
POSE_CLASSES = ['downdog', 'goddess', 'plank', 'tree', 'warrior2']

def analyze_dataset_structure():
    """Analyze the structure and distribution of the dataset"""
    print("=" * 80)
    print("YOGA POSE DATASET - EXPLORATORY DATA ANALYSIS")
    print("=" * 80)
    
    # Count images per class
    train_counts = {}
    test_counts = {}
    
    for pose in POSE_CLASSES:
        train_path = os.path.join(TRAIN_DIR, pose)
        test_path = os.path.join(TEST_DIR, pose)
        
        train_images = [f for f in os.listdir(train_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        test_images = [f for f in os.listdir(test_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        train_counts[pose] = len(train_images)
        test_counts[pose] = len(test_images)
    
    # Create DataFrame
    df = pd.DataFrame({
        'Pose': POSE_CLASSES,
        'Train Images': [train_counts[p] for p in POSE_CLASSES],
        'Test Images': [test_counts[p] for p in POSE_CLASSES]
    })
    
    df['Total'] = df['Train Images'] + df['Test Images']
    df['Train %'] = (df['Train Images'] / df['Total'] * 100).round(2)
    
    print("\n📊 Dataset Distribution:")
    print(df.to_string(index=False))
    print(f"\nTotal Training Images: {df['Train Images'].sum()}")
    print(f"Total Testing Images: {df['Test Images'].sum()}")
    print(f"Total Images: {df['Total'].sum()}")
    
    return df

def plot_class_distribution(df):
    """Plot the distribution of images across classes"""
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Training distribution
    axes[0].bar(df['Pose'], df['Train Images'], color='skyblue', edgecolor='navy', alpha=0.7)
    axes[0].set_title('Training Set Distribution', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Pose Class', fontsize=12)
    axes[0].set_ylabel('Number of Images', fontsize=12)
    axes[0].grid(axis='y', alpha=0.3)
    for i, v in enumerate(df['Train Images']):
        axes[0].text(i, v + 5, str(v), ha='center', fontweight='bold')
    
    # Test distribution
    axes[1].bar(df['Pose'], df['Test Images'], color='lightcoral', edgecolor='darkred', alpha=0.7)
    axes[1].set_title('Test Set Distribution', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Pose Class', fontsize=12)
    axes[1].set_ylabel('Number of Images', fontsize=12)
    axes[1].grid(axis='y', alpha=0.3)
    for i, v in enumerate(df['Test Images']):
        axes[1].text(i, v + 5, str(v), ha='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('eda_class_distribution.png', dpi=300, bbox_inches='tight')
    print("\n✅ Saved: eda_class_distribution.png")
    plt.show()

def analyze_image_properties():
    """Analyze image dimensions and properties"""
    print("\n" + "=" * 80)
    print("IMAGE PROPERTIES ANALYSIS")
    print("=" * 80)
    
    image_data = []
    
    for split in ['TRAIN', 'TEST']:
        split_dir = os.path.join(DATASET_ROOT, split)
        for pose in POSE_CLASSES:
            pose_dir = os.path.join(split_dir, pose)
            images = [f for f in os.listdir(pose_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            # Sample 10 images per class for analysis
            sample_images = images[:10]
            
            for img_name in sample_images:
                img_path = os.path.join(pose_dir, img_name)
                try:
                    img = Image.open(img_path)
                    width, height = img.size
                    aspect_ratio = width / height
                    file_size = os.path.getsize(img_path) / 1024  # KB
                    
                    image_data.append({
                        'split': split,
                        'pose': pose,
                        'width': width,
                        'height': height,
                        'aspect_ratio': aspect_ratio,
                        'file_size_kb': file_size,
                        'format': img.format
                    })
                except Exception as e:
                    print(f"Error reading {img_path}: {e}")
    
    img_df = pd.DataFrame(image_data)
    
    print("\n📐 Image Dimensions Statistics:")
    print(img_df[['width', 'height', 'aspect_ratio', 'file_size_kb']].describe())
    
    print("\n📁 Image Formats:")
    print(img_df['format'].value_counts())
    
    return img_df

def plot_image_dimensions(img_df):
    """Plot image dimension distributions"""
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # Width distribution
    axes[0, 0].hist(img_df['width'], bins=30, color='steelblue', edgecolor='black', alpha=0.7)
    axes[0, 0].set_title('Image Width Distribution', fontsize=12, fontweight='bold')
    axes[0, 0].set_xlabel('Width (pixels)')
    axes[0, 0].set_ylabel('Frequency')
    axes[0, 0].axvline(img_df['width'].mean(), color='red', linestyle='--', label=f'Mean: {img_df["width"].mean():.0f}')
    axes[0, 0].legend()
    
    # Height distribution
    axes[0, 1].hist(img_df['height'], bins=30, color='coral', edgecolor='black', alpha=0.7)
    axes[0, 1].set_title('Image Height Distribution', fontsize=12, fontweight='bold')
    axes[0, 1].set_xlabel('Height (pixels)')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].axvline(img_df['height'].mean(), color='red', linestyle='--', label=f'Mean: {img_df["height"].mean():.0f}')
    axes[0, 1].legend()
    
    # Aspect ratio distribution
    axes[1, 0].hist(img_df['aspect_ratio'], bins=30, color='mediumseagreen', edgecolor='black', alpha=0.7)
    axes[1, 0].set_title('Aspect Ratio Distribution', fontsize=12, fontweight='bold')
    axes[1, 0].set_xlabel('Aspect Ratio (W/H)')
    axes[1, 0].set_ylabel('Frequency')
    axes[1, 0].axvline(img_df['aspect_ratio'].mean(), color='red', linestyle='--', label=f'Mean: {img_df["aspect_ratio"].mean():.2f}')
    axes[1, 0].legend()
    
    # File size distribution
    axes[1, 1].hist(img_df['file_size_kb'], bins=30, color='orchid', edgecolor='black', alpha=0.7)
    axes[1, 1].set_title('File Size Distribution', fontsize=12, fontweight='bold')
    axes[1, 1].set_xlabel('File Size (KB)')
    axes[1, 1].set_ylabel('Frequency')
    axes[1, 1].axvline(img_df['file_size_kb'].mean(), color='red', linestyle='--', label=f'Mean: {img_df["file_size_kb"].mean():.0f} KB')
    axes[1, 1].legend()
    
    plt.tight_layout()
    plt.savefig('eda_image_properties.png', dpi=300, bbox_inches='tight')
    print("\n✅ Saved: eda_image_properties.png")
    plt.show()

def display_sample_images():
    """Display sample images from each class"""
    fig, axes = plt.subplots(2, 5, figsize=(20, 8))
    axes = axes.flatten()
    
    for idx, pose in enumerate(POSE_CLASSES):
        train_path = os.path.join(TRAIN_DIR, pose)
        test_path = os.path.join(TEST_DIR, pose)
        
        # Get first image from train and test
        train_img = [f for f in os.listdir(train_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))][0]
        test_img = [f for f in os.listdir(test_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))][0]
        
        # Display train image
        img = Image.open(os.path.join(train_path, train_img))
        axes[idx].imshow(img)
        axes[idx].set_title(f'{pose.upper()} (Train)', fontsize=10, fontweight='bold')
        axes[idx].axis('off')
        
        # Display test image
        img = Image.open(os.path.join(test_path, test_img))
        axes[idx + 5].imshow(img)
        axes[idx + 5].set_title(f'{pose.upper()} (Test)', fontsize=10, fontweight='bold')
        axes[idx + 5].axis('off')
    
    plt.tight_layout()
    plt.savefig('eda_sample_images.png', dpi=300, bbox_inches='tight')
    print("\n✅ Saved: eda_sample_images.png")
    plt.show()

def generate_summary_report(df, img_df):
    """Generate a comprehensive summary report"""
    report = {
        'dataset_summary': {
            'total_images': int(df['Total'].sum()),
            'total_train': int(df['Train Images'].sum()),
            'total_test': int(df['Test Images'].sum()),
            'num_classes': len(POSE_CLASSES),
            'classes': POSE_CLASSES
        },
        'class_distribution': df.to_dict('records'),
        'image_statistics': {
            'avg_width': float(img_df['width'].mean()),
            'avg_height': float(img_df['height'].mean()),
            'avg_aspect_ratio': float(img_df['aspect_ratio'].mean()),
            'avg_file_size_kb': float(img_df['file_size_kb'].mean()),
            'recommended_input_size': [224, 224]  # Standard for transfer learning
        },
        'recommendations': {
            'preprocessing': [
                'Resize all images to 224x224 for consistency',
                'Normalize pixel values to [0, 1] range',
                'Apply data augmentation (rotation, flip, zoom) to increase diversity'
            ],
            'model_architecture': 'MobileNetV2 or EfficientNet for lightweight deployment',
            'training_strategy': 'Transfer learning with fine-tuning'
        }
    }
    
    with open('eda_summary_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "=" * 80)
    print("📋 SUMMARY REPORT")
    print("=" * 80)
    print(json.dumps(report, indent=2))
    print("\n✅ Saved: eda_summary_report.json")
    
    return report

if __name__ == "__main__":
    # Run EDA
    print("Starting Exploratory Data Analysis...\n")
    
    # 1. Dataset structure analysis
    df = analyze_dataset_structure()
    plot_class_distribution(df)
    
    # 2. Image properties analysis
    img_df = analyze_image_properties()
    plot_image_dimensions(img_df)
    
    # 3. Display sample images
    display_sample_images()
    
    # 4. Generate summary report
    report = generate_summary_report(df, img_df)
    
    print("\n" + "=" * 80)
    print("✅ EDA COMPLETE!")
    print("=" * 80)
    print("\nGenerated files:")
    print("  - eda_class_distribution.png")
    print("  - eda_image_properties.png")
    print("  - eda_sample_images.png")
    print("  - eda_summary_report.json")
