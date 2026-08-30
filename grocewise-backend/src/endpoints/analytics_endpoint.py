from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from src.core.containers.app_container import AppContainer 
from datetime import datetime
from src.core.models.stats import AnalyticsResponse
from src.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["consumes analytics"])

@router.get("/consumption", response_model=AnalyticsResponse)
def get_consumption_statistics(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    service: AnalyticsService = Depends(AppContainer.get_analytics_service)
):
    try:
        # Convert string dates to datetime objects
        start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        if start_date_dt > end_date_dt:
            raise HTTPException(status_code=400, detail="Start date must be before or equal to end date.")
        
        return service.get_consumption_statistics(start_date=start_date_dt, end_date=end_date_dt)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/consumption/{product_id}", response_model=AnalyticsResponse)
def get_product_consumption_statistics(
    product_id: str = Path(..., description="ID of the product"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    service: AnalyticsService = Depends(AppContainer.get_analytics_service)
):
    try:
        # Convert string dates to datetime objects
        start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        if start_date_dt > end_date_dt:
            raise HTTPException(status_code=400, detail="Start date must be before or equal to end date.")
        
        return service.get_product_consumption_statistics(product_id=product_id, start_date=start_date_dt, end_date=end_date_dt)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))