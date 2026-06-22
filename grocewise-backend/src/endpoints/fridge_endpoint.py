from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from src.services.fridge_service import FridgeService
from src.core.models.product import Product
from src.core.containers.app_container import AppContainer 
from datetime import datetime

router = APIRouter(prefix="/fridge", tags=["Fridge Management"])

@router.get("/products/unconsumed", response_model=list[Product])
def get_unconsumed_products(
    # Diciamo a FastAPI di chiamare il metodo del container per avere il servizio pronto
    service: FridgeService = Depends(AppContainer.get_fridge_service)
):
    try:
        return service.get_all_unconsumed_products()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/all", response_model=list[Product])
def get_all_products(
    service: FridgeService = Depends(AppContainer.get_fridge_service)
):
    try:
        return service.get_all_products()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/products", status_code=201)
def add_product(
    barcode: str = Query(..., min_length=8, max_length=13),
    price: float = Query(0.0, ge=0),
    buy_date: datetime = Query(default_factory=datetime.now),
    service: FridgeService = Depends(AppContainer.get_fridge_service)
):
    try:
        inserted_id = service.add_product_from_barcode(barcode=barcode, price=price, buy_date=buy_date)
        return {"status": "success", "inserted_id": inserted_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/products/{product_id}/consume", status_code=200)
def consume_product(
    product_id: str = Path(..., min_length=24, max_length=24),
    finish_date: datetime = Query(default_factory=datetime.now),
    quantity: float | None = Query(None, gt=0, description="Quantità in grammi; se omessa consuma tutto il residuo"),
    service: FridgeService = Depends(AppContainer.get_fridge_service),
):
    try:
        if quantity is not None:
            success = service.partially_consume_product(product_id, quantity, consumed_at=finish_date)
        else:
            success = service.mark_product_as_consumed(product_id, finish_date=finish_date)

        if not success:
            raise HTTPException(status_code=404, detail="Product not found or already consumed")
        return {"status": "success", "message": f"Product {product_id} consumption recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/products/{product_id}", status_code=200)
def delete_product(
    product_id: str = Path(..., min_length=24, max_length=24),
    service: FridgeService = Depends(AppContainer.get_fridge_service)
):
    try:
        success = service.delete_product(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"status": "success", "message": f"Product {product_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/products/all", status_code=200)
def delete_all_products(
    service: FridgeService = Depends(AppContainer.get_fridge_service)
):
    try:
        deleted_count = service.delete_all_products()
        return {"status": "success", "message": f"Deleted {deleted_count} products"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))