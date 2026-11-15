
from pydantic import BaseModel
from typing import Literal, Optional


class Incident(BaseModel):
    title: str
    description: str
    category: str
    severity: str
    status: str = "Open"
    investigation_notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: Literal[
        "Open",
        "Investigating",
        "Resolved"
    ]
