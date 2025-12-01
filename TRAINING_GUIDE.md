# Yoga Pose Model Training Guide

This guide explains how to train a custom yoga pose classification model on your dataset and integrate it into the web app.

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Dataset** in `d:\Shah\NNDL\archive\DATASET\` with TRAIN and TEST folders
3. **GPU** (optional but recommended for faster training)

## 🚀 Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## 📊 Step 2: Run Exploratory Data Analysis (EDA)

Analyze your dataset before training:

```bash
python eda_analysis.py
```

This will generate:
- `eda_class_distribution.png` - Distribution of images across poses
- `eda_image_properties.png` - Image dimension and size analysis
- `eda_sample_images.png` - Sample images from each class
- `eda_summary_report.json` - Comprehensive dataset statistics

### Expected Output:
```
📊 Dataset Distribution:
      Pose  Train Images  Test Images  Total  Train %
   downdog           223           94    317    70.35
   goddess           180           69    249    72.29
     plank           266           94    360    73.89
      tree           160           69    229    69.87
  warrior2           252           94    346    72.83

Total Training Images: 1081
Total Testing Images: 420
Total Images: 1501
```

## 🎯 Step 3: Train the Model

Train the custom pose classification model:

```bash
python train_model.py
```

### Training Process:
1. **Data Augmentation**: Applies rotation, zoom, flip to increase diversity
2. **Transfer Learning**: Uses MobileNetV2 pre-trained on ImageNet
3. **Fine-tuning**: Trains custom layers for yoga pose classification
4. **Validation**: Evaluates on test set during training
5. **Model Export**: Saves in both Keras and TensorFlow.js formats

### Expected Training Time:
- **With GPU**: ~10-15 minutes
- **Without GPU**: ~30-45 minutes

### Output Files (in `model_output/`):
- `best_model.keras` - Best model in Keras format
- `tfjs_model/` - Model converted for TensorFlow.js
- `training_history.png` - Accuracy and loss curves
- `training_report.json` - Detailed training metrics

### Expected Accuracy:
- **Training Accuracy**: 95-98%
- **Validation Accuracy**: 85-92%
- **Test Accuracy**: 85-90%

## 📈 Step 4: Review Training Results

Check the training report:

```bash
cat model_output/training_report.json
```

Example output:
```json
{
  "final_metrics": {
    "train_accuracy": 0.9654,
    "val_accuracy": 0.8857,
    "test_accuracy": 0.8762,
    "test_top2_accuracy": 0.9619
  },
  "best_metrics": {
    "best_val_accuracy": 0.8952,
    "best_val_accuracy_epoch": 15
  }
}
```

## 🌐 Step 5: Integrate Model into Web App

### Option A: Use Pre-trained MoveNet (Current)
The app currently uses MoveNet Thunder for pose detection. This works well for general pose tracking.

### Option B: Use Custom Trained Model (Advanced)
To use your custom trained model:

1. Copy the TensorFlow.js model:
```bash
cp -r model_output/tfjs_model public/
```

2. Update `src/hooks/usePoseDetection.ts` to load your custom model instead of MoveNet

3. Modify the inference logic to use classification instead of keypoint detection

**Note**: The current app uses pose estimation (keypoints), while the trained model does classification. For full integration, you would need to:
- Keep MoveNet for keypoint detection
- Add your custom model for pose classification/verification
- Combine both for enhanced accuracy

## 📊 Current Features

The web app currently includes:

### ✅ Implemented:
1. **Real-time Pose Detection** - Using MoveNet Thunder
2. **Visual Feedback** - Color-coded skeleton overlay
3. **Performance Scoring** - 0-100 score based on joint alignment
4. **Audio Guidance** - Voice feedback for corrections
5. **Reference Images** - From your dataset
6. **Performance Levels**:
   - 90-100: Excellent ✨
   - 75-89: Good 👍
   - 60-74: Fair 🤔
   - 0-59: Needs Work 💪

### 🔄 Score Calculation:
```
Score = (Aligned Joints / Total Joints) × 100
```

Example:
- Total joints checked: 5
- Aligned joints: 4
- Score: (4/5) × 100 = 80% (Good)

## 🎨 Customization

### Adjust Joint Angle Ranges:
Edit `src/utils/poseReferences.ts`:

```typescript
Downdog: {
  joints: {
    left_elbow: { min: 160, max: 180 },  // Adjust these values
    right_elbow: { min: 160, max: 180 },
    // ...
  }
}
```

### Modify Scoring Thresholds:
Edit `src/components/FeedbackPanel.tsx`:

```typescript
const getPerformanceLevel = (score: number) => {
  if (score >= 90) return { label: 'Excellent', ... };
  if (score >= 75) return { label: 'Good', ... };
  // Adjust thresholds here
};
```

## 🐛 Troubleshooting

### Issue: Low Training Accuracy
**Solution**: 
- Increase epochs (default: 20)
- Adjust learning rate
- Add more data augmentation

### Issue: Model Overfitting
**Solution**:
- Increase dropout rates
- Add more regularization
- Use early stopping (already included)

### Issue: TensorFlow.js Conversion Fails
**Solution**:
```bash
pip install --upgrade tensorflowjs
```

## 📚 Next Steps

1. **Collect More Data**: Add more diverse images for each pose
2. **Advanced Augmentation**: Try more aggressive data augmentation
3. **Ensemble Models**: Combine multiple models for better accuracy
4. **Real-time Classification**: Integrate custom model with MoveNet
5. **Mobile Deployment**: Optimize model for mobile devices

## 🤝 Support

For issues or questions:
1. Check training logs in `model_output/`
2. Review EDA reports for dataset quality
3. Verify all dependencies are installed correctly

## 📄 License

MIT License - Feel free to modify and use for your projects!
