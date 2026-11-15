from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from models import Incident, StatusUpdate

app = FastAPI(
    title="Cybersecurity Incident Tracker",
    description="An application for tracking and managing cybersecurity incidents.",
    version="1.0.0"
)

# Temporary storage for incidents
incidents = []


@app.get("/")
def home():
    return {
        "message": "Welcome to the Cybersecurity Incident Tracker!"
    }


@app.post("/incidents")
def create_incident(incident: Incident):
    incidents.append(incident)

    return {
        "message": "Incident created successfully!",
        "incident": incident
    }


@app.get("/incidents")
def get_incidents():
    return incidents

@app.patch("/incidents/{incident_index}/status")
def update_incident_status(
    incident_index: int,
    update: StatusUpdate
):
    if incident_index < 0 or incident_index >= len(incidents):
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incidents[incident_index].status = update.status

    return {
        "message": "Incident status updated successfully!",
        "incident": incidents[incident_index]
    }
app.mount(
    "/dashboard",
    StaticFiles(directory="frontend", html=True),
    name="dashboard"
)