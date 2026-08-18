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

CORS is currently configured to allow requests from the Vite dev server (`http://localhost:5173`).
