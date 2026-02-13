
import os
import argparse
from training.train_classifier import train_classifier
from training.train_detector import train_detector
from evaluation.evaluate_model import evaluate
from export.export_tfjs import export_to_tfjs
from data.prepare_dataset import prepare_dataset

def main():
    parser = argparse.ArgumentParser(description="Acne AI Pipeline Orchestrator")
    parser.add_argument('action', choices=['prepare_data', 'train_classifier', 'train_yolo', 'evaluate', 'export', 'all'], 
                        help="Action to perform")
    
    args = parser.parse_args()
    
    if args.action == 'prepare_data' or args.action == 'all':
        print("\n=== STEP 1: PREPARE DATA ===")
        prepare_dataset()
        
    if args.action == 'train_classifier' or args.action == 'all':
        print("\n=== STEP 2: TRAIN CLASSIFIER ===")
        train_classifier()
        
    if args.action == 'train_yolo' or args.action == 'all':
        print("\n=== STEP 3: TRAIN DETECTOR ===")
        train_detector()
        
    if args.action == 'evaluate' or args.action == 'all':
        print("\n=== STEP 4: EVALUATE MODEL ===")
        evaluate()
        
    if args.action == 'export' or args.action == 'all':
        print("\n=== STEP 5: EXPORT MODEL ===")
        export_to_tfjs()
        
    print("\nPipeline execution complete.")

if __name__ == "__main__":
    main()
