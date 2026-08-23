import json
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request as FastAPIRequest
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from googleapiclient.discovery import build
from supabase import create_client

load_dotenv()

_log_formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")

# Vercel's log viewer buckets by stream (stdout -> Info, stderr -> Error), not by
# Python log level, so INFO/DEBUG go to stdout and WARNING+ go to stderr to keep
# routine "accepted submission" logs from showing up as errors in the dashboard.
_stdout_handler = logging.StreamHandler(sys.stdout)
_stdout_handler.setFormatter(_log_formatter)
_stdout_handler.addFilter(lambda record: record.levelno < logging.WARNING)

_stderr_handler = logging.StreamHandler(sys.stderr)
_stderr_handler.setFormatter(_log_formatter)
_stderr_handler.setLevel(logging.WARNING)

logging.basicConfig(
    level=os.getenv("WOLFHACKS_LOG_LEVEL", "INFO"),
    handlers=[_stdout_handler, _stderr_handler],
)
logger = logging.getLogger("wolfhacks")

app = FastAPI(title="WolfHacks API")
GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "service-account.json")
SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")
SPREADSHEET_ID = os.getenv(
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "1ckYK82T8wayiCLtluOkQek4gQ4lwwE2WEvyWRLR6I3M",
)
SHEETS_RANGE = os.getenv("GOOGLE_SHEETS_RANGE", "Applications!A:X")

# Supabase connection fields. Writes go through the service role key so they
# bypass RLS from the backend the same way the Sheets append bypasses sharing
# permissions via the service account.
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_APPLICATIONS_TABLE = os.getenv("SUPABASE_APPLICATIONS_TABLE", "applications")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "WOLFHACKS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: FastAPIRequest, exc: RequestValidationError):
    body = exc.body if isinstance(exc.body, dict) else {}
    errors = jsonable_encoder(exc.errors())
    logger.warning(
        "Rejected application submission (validation failed) from %s %s <%s>: %s",
        body.get("first_name", "?"),
        body.get("last_name", "?"),
        body.get("email", "?"),
        errors,
    )
    return JSONResponse(status_code=422, content={"detail": errors})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: FastAPIRequest, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


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
    university: str = Field(default="", max_length=160)
    classification: Literal["Freshman", "Sophomore", "Junior", "Senior", "Post-Graduate", "Graduated", ""] = ""
    major: str = Field(default="", max_length=120)
    hackathon_participation: Literal["Yes", "No"]
    gender: Literal["Male", "Female", "Other"]
    gender_other: str = Field(default="", max_length=80)
    shirt_size: Literal["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Other"]
    shirt_size_other: str = Field(default="", max_length=80)
    pronouns: Literal["He / Him", "She / Her", "They / Them", "Other", ""] = ""
    pronouns_other: str = Field(default="", max_length=80)
    dietary_notes: Literal["None", "Vegetarian", "Vegan", "Celiac Disease", "Allergies", "Kosher", "Halal", "Other"]
    dietary_notes_other: str = Field(default="", max_length=160)
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
        if self.dietary_notes in ("Allergies", "Other") and not self.dietary_notes_other.strip():
            raise ValueError("Please provide additional dietary information")
        return self


def get_sheets_service():
    if SERVICE_ACCOUNT_JSON:
        credentials = service_account.Credentials.from_service_account_info(
            json.loads(SERVICE_ACCOUNT_JSON),
            scopes=[GOOGLE_SHEETS_SCOPE],
        )
    elif os.path.exists(SERVICE_ACCOUNT_FILE):
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=[GOOGLE_SHEETS_SCOPE],
        )
    else:
        logger.warning(
            "No Google Sheets credentials found (checked GOOGLE_SERVICE_ACCOUNT_JSON and %s)",
            SERVICE_ACCOUNT_FILE,
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Sheets is not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON (the key file's "
                "contents) or GOOGLE_SERVICE_ACCOUNT_FILE (a path to it), and share the spreadsheet "
                "with that service account."
            ),
        )

    credentials.refresh(Request())
    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def get_supabase_client():
    if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY):
        return None
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def write_to_supabase(application: Application):
    client = get_supabase_client()
    if client is None:
        logger.warning(
            "Skipping Supabase write: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured"
        )
        return

    row = application.model_dump() if hasattr(application, "model_dump") else application.dict()
    row["submitted_at"] = datetime.now(timezone.utc).isoformat()

    try:
        client.table(SUPABASE_APPLICATIONS_TABLE).insert(row).execute()
    except Exception:
        logger.exception(
            "Failed to write application from %s to Supabase table %s",
            application.email,
            SUPABASE_APPLICATIONS_TABLE,
        )


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
        values["dietary_notes_other"],
        values["mlh_code_of_conduct"],
        values["mlh_data_authorization"],
        values["mlh_marketing_emails"],
    ]]


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "storage": "google-sheets",
        "configured": bool(
            SPREADSHEET_ID and (SERVICE_ACCOUNT_JSON or os.path.exists(SERVICE_ACCOUNT_FILE))
        ),
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY),
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
    logger.info(
        "Accepted application submission: %s %s <%s> appended at %s",
        application.first_name,
        application.last_name,
        application.email,
        updated_range,
    )

    write_to_supabase(application)

    return {
        "updated_range": updated_range,
        "message": "Application received",
    }
