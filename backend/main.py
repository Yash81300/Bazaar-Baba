from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import json
from pathlib import Path

from config import settings
from database import MongoDB, get_db
from models import Product, ProductCreate, Order, OrderCreate
from services import ProductService, OrderService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def seed_products():
    """Seed products from JSON file if database is empty"""
    try:
        db = get_db()
        product_service = ProductService(db)
        
        # Check if products already exist
        existing_products = await product_service.get_all_products()
        if existing_products:
            logger.info(f"Database already has {len(existing_products)} products. Skipping seed.")
            return
        
        # Load products from JSON file
        products_file = Path(__file__).parent / "products.json"
        if not products_file.exists():
            logger.warning("products.json not found. Skipping seed.")
            return
        
        with open(products_file, "r") as f:
            products_data = json.load(f)
        
        # Insert products
        count = await product_service.bulk_insert_products(products_data)
        logger.info(f"Successfully seeded {count} products into MongoDB")
        
    except Exception as e:
        logger.error(f"Error seeding products: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Bazaar Baba API...")
    await MongoDB.connect_db()
    await seed_products()
    logger.info("API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down API...")
    await MongoDB.close_db()
    logger.info("API shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Bazaar Baba API",
    description="E-commerce backend API with MongoDB",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= Health Check =============

@app.get("/", tags=["Health"])
async def root():
    """API health check"""
    return {
        "status": "healthy",
        "message": "Bazaar Baba API is running",
        "version": "2.0.0"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    try:
        db = get_db()
        await db.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "mongodb_url": settings.mongodb_url.split('@')[-1] if '@' in settings.mongodb_url else settings.mongodb_url
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


# ============= Product Endpoints =============

@app.get("/products", response_model=list[Product], tags=["Products"])
async def get_products():
    """Get all products"""
    try:
        db = get_db()
        product_service = ProductService(db)
        products = await product_service.get_all_products()
        return products
    except Exception as e:
        logger.error(f"Error in get_products: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch products"
        )


@app.get("/products/{product_id}", response_model=Product, tags=["Products"])
async def get_product(product_id: str):
    """Get a specific product by ID"""
    try:
        db = get_db()
        product_service = ProductService(db)
        product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch product"
        )


@app.post("/products", response_model=Product, tags=["Products"], status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    """Create a new product"""
    try:
        db = get_db()
        product_service = ProductService(db)
        
        # Check if product with this ID already exists
        existing = await product_service.get_product_by_id(product.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with id {product.id} already exists"
            )
        
        new_product = await product_service.create_product(product)
        return new_product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )


# ============= Order Endpoints =============

@app.get("/orders", response_model=list[Order], tags=["Orders"])
async def get_orders():
    """Get all orders"""
    try:
        db = get_db()
        order_service = OrderService(db)
        orders = await order_service.get_all_orders()
        return orders
    except Exception as e:
        logger.error(f"Error in get_orders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )


@app.get("/orders/{order_id}", response_model=Order, tags=["Orders"])
async def get_order(order_id: str):
    """Get a specific order by ID"""
    try:
        db = get_db()
        order_service = OrderService(db)
        order = await order_service.get_order_by_id(order_id)
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order"
        )


@app.post("/orders", response_model=Order, tags=["Orders"], status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    """Create a new order"""
    try:
        db = get_db()
        order_service = OrderService(db)
        new_order = await order_service.create_order(order)
        logger.info(f"Order created: {new_order.id}")
        return new_order
    except Exception as e:
        logger.error(f"Error in create_order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )


@app.delete("/orders/{order_id}", tags=["Orders"])
async def delete_order(order_id: str):
    """Delete an order"""
    try:
        db = get_db()
        order_service = OrderService(db)
        
        success = await order_service.delete_order(order_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        
        return {"message": f"Order {order_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete order"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
