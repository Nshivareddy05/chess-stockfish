from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..db import database, models
from pydantic import BaseModel

router = APIRouter()

class GameCreate(BaseModel):
    white_player: str
    black_player: str
    pgn: str
    fen: str
    result: str

class GameResponse(GameCreate):
    id: int

    class Config:
        orm_mode = True

@router.get("/api/games", response_model=List[GameResponse])
def get_games(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    games = db.query(models.Game).offset(skip).limit(limit).all()
    return games

@router.post("/api/games", response_model=GameResponse)
def save_game(game: GameCreate, db: Session = Depends(database.get_db)):
    db_game = models.Game(**game.dict())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

@router.delete("/api/games/{game_id}")
def delete_game(game_id: int, db: Session = Depends(database.get_db)):
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    db.delete(db_game)
    db.commit()
    return {"ok": True}

@router.get("/api/settings")
def get_settings(db: Session = Depends(database.get_db)):
    settings = db.query(models.Setting).all()
    return {s.key: s.value for s in settings}

@router.post("/api/settings")
def update_settings(settings: Dict[str, str], db: Session = Depends(database.get_db)):
    for k, v in settings.items():
        db_setting = db.query(models.Setting).filter(models.Setting.key == k).first()
        if db_setting:
            db_setting.value = v
        else:
            db_setting = models.Setting(key=k, value=v)
            db.add(db_setting)
    db.commit()
    return {"ok": True}
