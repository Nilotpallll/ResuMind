import os

from dotenv import load_dotenv


load_dotenv()


class Config:
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}

    SQLALCHEMY_DATABASE_URI = (
        "sqlite:///"
        + os.path.join(os.getcwd(), "resumind.db")
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False