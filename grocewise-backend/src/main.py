from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.endpoints.fridge_endpoint import router as fridge_router 
from src.endpoints.analytics_endpoint import router as analytics_router
from src.endpoints.override_endpoint import router as override_router
from src.endpoints.chat_endpoint import router as chat_router

app = FastAPI(
    title="GroceWise API",
    description="Smart inventory and food management backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

app.include_router(fridge_router)
app.include_router(analytics_router)
app.include_router(override_router) 
app.include_router(chat_router)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "GroceWise Backend"}