
import argparse
from pipeline import AcnePipeline

def main():
    parser = argparse.ArgumentParser(description="Acne AI Prediction CLI")
    parser.add_argument("--image", required=True, help="Path to input image")
    args = parser.parse_args()
    
    pipeline = AcnePipeline()
    result = pipeline.predict(args.image)
    
    print("\n[Analysis Report]")
    print(result)

if __name__ == "__main__":
    main()
