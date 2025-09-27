from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
from collections import deque
import logging

# Initialize FastAPI app
app = FastAPI()

# Initialize game state
class GameState:
    def __init__(self):
        self.banner_queue = deque(maxlen=10)  # Keep more in queue than we show
        self.crowd_hype = 0
        self.events = []
        self.home_score = 0
        self.away_score = 0
        self.last_lead = None  # Track who was leading
        self.run_window = []  # Track recent scoring for run detection
        
        # Stats for recap
        self.biggest_run = {"team": None, "delta": 0}
        self.lead_changes = 0
        self.fastest_burst = None

game_state = GameState()

# Data Models
class ScoreInfo(BaseModel):
    score: int
    id: Optional[str] = None
    abbr: Optional[str] = None

class GameEvent(BaseModel):
    type: str
    team: str
    value: Optional[int] = None
    label: Optional[str] = None

class EventPayload(BaseModel):
    t: str  # ISO timestamp
    game_id: str
    quarter: int
    clock: str
    home: ScoreInfo
    away: ScoreInfo
    event: GameEvent

class Banner(BaseModel):
    id: str
    kind: str  # "RUN_SPIKE" | "LEAD_CHANGE" | "PACE_SPIKE"
    text: str
    trigger: dict

class Explainer(BaseModel):
    why: str
    next: str

class CrowdHype(BaseModel):
    hype: int

class RecapInfo(BaseModel):
    biggest_run: dict
    lead_changes: int
    fastest_burst: str

# Event Detection Logic
def detect_run_spike(events, window_seconds=20):
    """Detect if there's been a significant run in recent events"""
    if len(events) < 2:
        return None
    
    # Simple run detection: one team scoring ≥ 8 while opponent ≤ 2
    home_points = sum(e.home.score - prev.home.score 
                     for prev, e in zip(events[:-1], events[1:]))
    away_points = sum(e.away.score - prev.away.score 
                     for prev, e in zip(events[:-1], events[1:]))
    
    if home_points >= 8 and away_points <= 2:
        return {
            "kind": "RUN_SPIKE",
            "text": f"PHI ON A {home_points}-{away_points} RUN! 🔥",
            "trigger": {"team": "PHI", "for": home_points, "against": away_points}
        }
    elif away_points >= 8 and home_points <= 2:
        return {
            "kind": "RUN_SPIKE",
            "text": f"DAL ON A {away_points}-{home_points} RUN! 🔥",
            "trigger": {"team": "DAL", "for": away_points, "against": home_points}
        }
    return None

def detect_lead_change(prev_event, curr_event):
    """Detect if there's been a lead change"""
    if not prev_event:
        return None
    
    prev_diff = prev_event.home.score - prev_event.away.score
    curr_diff = curr_event.home.score - curr_event.away.score
    
    if (prev_diff <= 0 and curr_diff > 0) or (prev_diff >= 0 and curr_diff < 0):
        leading_team = "PHI" if curr_diff > 0 else "DAL"
        return {
            "kind": "LEAD_CHANGE",
            "text": f"{leading_team} TAKES THE LEAD! 👑",
            "trigger": {"team": leading_team, "margin": abs(curr_diff)}
        }
    return None

# Endpoints
@app.get("/health")
async def health_check():
    return {"ok": True}

@app.post("/ingest")
async def ingest_event(event: EventPayload):
    # Store event
    game_state.events.append(event)
    
    # Update scores
    game_state.home_score = event.home.score
    game_state.away_score = event.away.score
    
    # Detect runs
    if run_banner := detect_run_spike(game_state.events):
        game_state.banner_queue.append({
            "id": f"run_{len(game_state.events)}",
            **run_banner
        })
    
    # Detect lead changes
    if len(game_state.events) > 1:
        if lead_banner := detect_lead_change(game_state.events[-2], event):
            game_state.banner_queue.append({
                "id": f"lead_{len(game_state.events)}",
                **lead_banner
            })
            game_state.lead_changes += 1
    
    # Handle pace events
    if event.event.type == "PACE":
        game_state.banner_queue.append({
            "id": f"pace_{len(game_state.events)}",
            "kind": "PACE_SPIKE",
            "text": f"{event.event.team} PLAYING AT BLAZING SPEED! ⚡",
            "trigger": {"team": event.event.team, "label": event.event.label}
        })
        if not game_state.fastest_burst:
            game_state.fastest_burst = f"{event.event.team} lightning burst"
    
    return {"status": "ok"}

@app.get("/overlays")
async def get_overlays() -> List[Banner]:
    # Return and clear up to 3 most recent banners
    banners = []
    while len(banners) < 3 and game_state.banner_queue:
        banners.append(game_state.banner_queue.popleft())
    return banners

@app.post("/explain")
async def explain_banner(banner: Banner) -> Explainer:
    # Deterministic explanations based on banner kind
    explanations = {
        "RUN_SPIKE": {
            "why": f"{banner.trigger['team']} scored {banner.trigger['for']} while holding opponent to {banner.trigger['against']}",
            "next": "Watch if the defense can adjust and stop the momentum"
        },
        "LEAD_CHANGE": {
            "why": f"{banner.trigger['team']} pulled ahead by {banner.trigger['margin']} points",
            "next": "Keep an eye on how the other team responds to losing the lead"
        },
        "PACE_SPIKE": {
            "why": f"{banner.trigger['team']} is pushing the tempo up the court",
            "next": "Look for defensive adjustments to slow down the pace"
        }
    }
    
    kind = banner.kind
    if kind not in explanations:
        raise HTTPException(status_code=400, detail="Unknown banner kind")
    
    return explanations[kind]

@app.post("/party/tap")
async def party_tap():
    game_state.crowd_hype = min(100, game_state.crowd_hype + 5)
    return {"status": "ok"}

@app.get("/party/hype")
async def get_hype() -> CrowdHype:
    return {"hype": game_state.crowd_hype}

@app.get("/recap")
async def get_recap() -> RecapInfo:
    return {
        "biggest_run": game_state.biggest_run or {"team": "PHI", "delta": 9},
        "lead_changes": game_state.lead_changes,
        "fastest_burst": game_state.fastest_burst or "No significant pace changes"
    }