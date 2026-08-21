import logging
import os
from datetime import datetime, timezone
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from googleapiclient.discovery import build

load_dotenv()

logging.basicConfig(level=os.getenv("WOLFHACKS_LOG_LEVEL", "INFO"))
logger = logging.getLogger("wolfhacks")

app = FastAPI(title="WolfHacks API")
GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "service-account.json")
SPREADSHEET_ID = os.getenv(
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "1ckYK82T8wayiCLtluOkQek4gQ4lwwE2WEvyWRLR6I3M",
)
SHEETS_RANGE = os.getenv("GOOGLE_SHEETS_RANGE", "Applications!A:W")

# Supabase connection fields (not yet wired into any route)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "WOLFHACKS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class Application(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    middle_name: str = Field(default="", max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    age: int = Field(ge=18, le=99)
    email: str = Field(min_length=5, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    country_of_residence: str = Field(min_length=2, max_length=100)
    discord_username: str = Field(min_length=3, max_length=33, pattern=r"^@[a-z0-9_.]{2,32}$")
    phone_number: str = Field(
        min_length=14,
        max_length=14,
        pattern=r"^\([2-9]\d{2}\) [2-9]\d{2}-\d{4}$",
    )
    university: str = Field(min_length=2, max_length=160)
    classification: Literal["Freshman", "Sophomore", "Junior", "Senior", "Post-Graduate", "Graduated"]
    major: str = Field(min_length=2, max_length=120)
    hackathon_participation: Literal["Yes", "No"]
    gender: Literal["Male", "Female", "Other"]
    gender_other: str = Field(default="", max_length=80)
    shirt_size: Literal["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Other"]
    shirt_size_other: str = Field(default="", max_length=80)
    pronouns: Literal["He / Him", "She / Her", "They / Them", "Other"]
    pronouns_other: str = Field(default="", max_length=80)
    dietary_notes: Literal["Vegetarian", "Vegan", "Celiac Disease", "Allergies", "Kosher", "Halal"]
    mlh_code_of_conduct: bool
    mlh_data_authorization: bool
    mlh_marketing_emails: bool = False

    @model_validator(mode="after")
    def validate_other_shirt_size(self):
        if ".." in self.discord_username:
            raise ValueError("Discord usernames cannot contain consecutive periods")
        if self.shirt_size == "Other" and not self.shirt_size_other.strip():
            raise ValueError("Please enter your shirt size when Other is selected")
        if self.gender == "Other" and not self.gender_other.strip():
            raise ValueError("Please enter your gender when Other is selected")
        if self.pronouns == "Other" and not self.pronouns_other.strip():
            raise ValueError("Please enter your pronouns when Other is selected")
        return self


def get_sheets_service():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        logger.warning(
            "Google Sheets service account file not found at %s", SERVICE_ACCOUNT_FILE
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Sheets is not configured. Set GOOGLE_SERVICE_ACCOUNT_FILE "
                "to the service-account JSON path and share the spreadsheet with that account."
            ),
        )

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=[GOOGLE_SHEETS_SCOPE],
    )
    credentials.refresh(Request())
    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def application_values(application: Application):
    values = application.model_dump() if hasattr(application, "model_dump") else application.dict()
    return [[
        datetime.now(timezone.utc).isoformat(),
        values["first_name"],
        values["middle_name"],
        values["last_name"],
        values["age"],
        values["email"],
        values["country_of_residence"],
        values["discord_username"],
        values["phone_number"],
        values["university"],
        values["classification"],
        values["major"],
        values["hackathon_participation"],
        values["gender"],
        values["gender_other"],
        values["shirt_size"],
        values["shirt_size_other"],
        values["pronouns"],
        values["pronouns_other"],
        values["dietary_notes"],
        values["mlh_code_of_conduct"],
        values["mlh_data_authorization"],
        values["mlh_marketing_emails"],
    ]]


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "storage": "google-sheets",
        "configured": bool(SPREADSHEET_ID and os.path.exists(SERVICE_ACCOUNT_FILE)),
    }


@app.post("/api/applications", status_code=201)
def create_application(application: Application):
    logger.info(
        "Received application submission: %s %s <%s>",
        application.first_name,
        application.last_name,
        application.email,
    )

    if not SPREADSHEET_ID:
        logger.warning("Rejected submission: GOOGLE_SHEETS_SPREADSHEET_ID is not configured")
        raise HTTPException(status_code=503, detail="Google Sheets spreadsheet ID is not configured")

    service = get_sheets_service()
    try:
        result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=SHEETS_RANGE,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": application_values(application)},
        ).execute()
    except Exception:
        logger.exception(
            "Failed to append application from %s to spreadsheet %s",
            application.email,
            SPREADSHEET_ID,
        )
        raise HTTPException(
            status_code=502,
            detail="We could not save your application to Google Sheets. Please try again shortly.",
        )

    updated_range = result.get("updates", {}).get("updatedRange")
    logger.info("Application from %s appended at %s", application.email, updated_range)

    return {
        "updated_range": updated_range,
        "message": "Application received",
    }
