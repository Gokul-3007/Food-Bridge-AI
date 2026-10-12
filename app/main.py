from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import MatchRequest, MatchResponse, MatchWeights
from .matching import run_matching_pipeline

app = FastAPI(
    title="FoodBridge AI - Recipient Matching Service",
    description="Explainable rule-based recipient matching engine with weighted multi-criteria scoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FoodBridge AI Python Matching Engine",
        "version": "1.0.0"
    }

@app.get("/api/scoring-weights")
def get_default_weights():
    weights = MatchWeights()
    return {
        "weights": weights.model_dump(),
        "documentation": {
            "proximity": "40% - Geographic distance normalized against service radius",
            "compatibility": "25% - Dietary and temperature storage condition compatibility",
            "capacity": "20% - Available intake volume vs donation quantity",
            "availability": "15% - Operating hours and acceptance availability"
        }
    }

@app.post("/api/match", response_model=MatchResponse)
def match_recipients(request: MatchRequest):
    try:
        weights = request.weights or MatchWeights()
        response = run_matching_pipeline(request.donation, request.recipients, weights)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching calculation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
