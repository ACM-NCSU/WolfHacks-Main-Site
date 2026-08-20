# WolfHacks Backend

Minimal FastAPI server for the WolfHacks frontend.

## Setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

Server runs at `http://127.0.0.1:8000`. Check it's alive:

```bash
curl http://127.0.0.1:8000/api/health
```

Applications are submitted as JSON to `POST /api/applications` and appended to the configured Google Sheet. Create an `Applications` worksheet with this header row:

```text
Submitted at | First name | Middle Name | Last name | Age | Email | Country Of Residence | Discord Username | Phone number | University | Classification | Major | Hackathon before | Gender | Other gender | Shirt size | Other shirt size | Pronouns | Other pronouns | Dietary Restrictions | MLH Code of Conduct | MLH Data Authorization | MLH Marketing Emails
```

Create a Google Cloud service account, enable the Google Sheets API, download
its JSON key, and share the spreadsheet with the service account email as an
Editor. Keep the JSON key outside version control, then set:

```bash
# Path to the downloaded service-account JSON file
set GOOGLE_SERVICE_ACCOUNT_FILE=C:\secrets\wolfhacks-sheets.json
# The ID from https://docs.google.com/spreadsheets/d/<ID>/edit
set GOOGLE_SHEETS_SPREADSHEET_ID=1ckYK82T8wayiCLtluOkQek4gQ4lwwE2WEvyWRLR6I3M
set GOOGLE_SHEETS_RANGE=Applications!A:W
set WOLFHACKS_ALLOWED_ORIGINS=http://localhost:5173
```

The default CORS origins are the local Vite URLs. The API never sends Google
credentials to the browser.
