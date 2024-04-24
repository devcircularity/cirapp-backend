from fastapi import FastAPI, UploadFile, Form, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import boto3
from pymongo import MongoClient
import datetime
from ultralytics import YOLO
from pathlib import Path
import asyncio

# AWS S3 Configuration
S3_BUCKET = "cirapp"  # Your S3 bucket
S3_REGION = "us-west-2"  # AWS region
s3_client = boto3.client('s3', region_name=S3_REGION)

# MongoDB Configuration
MONGODB_URI = "mongodb+srv://devcircularityke:5Idgvp13JsF6sKu4@cirapp.brkdwul.mongodb.net/?retryWrites=true&w=majority"
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client.test  # Adjust to your MongoDB database
detections_collection = db.Detections

# FastAPI Setup
app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOLO Model Initialization
model_path = "yolov8n.pt"  # Ensure this path is correct
model = YOLO(model_path)

# Utility function to create a unique folder for storing files locally
def create_unique_folder(base_path):
    folder_name = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    folder_path = os.path.join(base_path, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path

@app.post("/upload-images/")
async def upload_images(file: UploadFile = File(...), userId: str = Form(...)):
    # Create a unique folder to save the image temporarily
    frame_folder_path = create_unique_folder("data/frames")

    # Save the uploaded image locally
    frame_path = os.path.join(frame_folder_path, f"{file.filename}")
    if not frame_path.lower().endswith('.png'):
        frame_path += '.png'

    with open(frame_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Immediately respond to the frontend with success
    response = JSONResponse(content={
        "userId": userId,
        "message": "Image received successfully."
    })

    # Asynchronous background processing with the correct variable context
    asyncio.create_task(
        background_process(frame_path, frame_folder_path, file.filename, userId)
    )

    return response

# Asynchronous background process for object detection and S3 upload
async def background_process(frame_path, frame_folder_path, filename, userId):
    # Perform object detection
    model(frame_path, save_txt=True, project=frame_folder_path, name='labels')

    # Get the most recent folder in the frames directory
    most_recent_frame_folder = max(Path(frame_folder_path).iterdir(), key=os.path.getctime)

    # Check if the labels folder exists within the most recent frame folder
    label_folder_path = most_recent_frame_folder / 'labels'
    label_file = label_folder_path / f"{filename.split('.')[0]}.txt"
    detected_object_count = 0
    s3_url_label = "No Detection"

    if label_file.exists():
        # Upload the label file to S3
        s3_key_label = f"{most_recent_frame_folder}/labels/{filename.split('.')[0]}.txt"
        s3_client.upload_file(str(label_file), S3_BUCKET, s3_key_label)
        s3_url_label = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key_label}"

        with label_file.open('r') as f:
            detected_object_count = len([line.split()[0] for line in f.readlines()])
    else:
        # If no label file exists, set detected_object_count to 0
        detected_object_count = 0

    # Upload the image to S3
    s3_key = f"{frame_folder_path}/{filename}"
    s3_client.upload_file(frame_path, S3_BUCKET, s3_key)
    s3_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"

    # Save metadata to MongoDB
    detection_data = {
        "userId": userId,
        "s3_url": s3_url,
        "s3_url_label": s3_url_label,  # Add reference to the label file's S3 URL or "No Detection"
        "detection_count": detected_object_count,
        "timestamp": datetime.datetime.now().isoformat(),
    }
    detections_collection.insert_one(detection_data)

# Start FastAPI with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
