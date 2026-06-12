from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import engine, Base
from .api import routes, websockets
import asyncio

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Self-Hosted Chess API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
app.include_router(websockets.router)

@app.on_event("startup")
async def startup_event():
    # Initialize Engine Manager in the future
    pass

@app.on_event("shutdown")
async def shutdown_event():
    # Clean up Stockfish processes
    pass

@app.get("/")
def read_root():
    return {"status": "Chess Engine API running"}
