# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importiamo il router degli endpoint (il "vigile urbano")
from src.endpoints.fridge_endpoint import router as fridge_router 

app = FastAPI(
    title="GroceWise API",
    description="Smart inventory and food management backend",
    version="1.0.0"
)

# 2. CONFIGURAZIONE DEI MIDDLEWARE (Sicurezza e CORS)
# Permette al tuo futuro frontend di connettersi a questo backend senza blocchi energetici dei browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione metterai l'URL del tuo frontend (es. https://grocewise.com)
    allow_credentials=True,
    allow_methods=["*"],  # Permette GET, POST, PATCH, DELETE, ecc.
    allow_headers=["*"],
)

# 3. REGISTRAZIONE DELLE ROTTE (Collegamento dei Router)
# Diciamo a FastAPI di prendere tutte le rotte del frigo e metterle sotto /api/v1
app.include_router(fridge_router, prefix="/api/v1")


# 4. ENDPOINT DI SERVIZIO (Health Check)
# Un endpoint rapido per verificare se il server è acceso e risponde
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "GroceWise Backend"}