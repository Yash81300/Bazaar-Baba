from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Product, ProductCreate, Order, OrderCreate, OrderInDB
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ProductService:
    """Service for product operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.products
    
    async def get_all_products(self) -> List[Product]:
        """Get all products"""
        try:
            cursor = self.collection.find({})
            products = await cursor.to_list(length=None)
            return [Product(**product) for product in products]
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            return []
    
    async def get_product_by_id(self, product_id: str) -> Optional[Product]:
        """Get a product by ID"""
        try:
            product = await self.collection.find_one({"id": product_id})
            if product:
                return Product(**product)
            return None
        except Exception as e:
            logger.error(f"Error fetching product {product_id}: {e}")
            return None
    
    async def create_product(self, product: ProductCreate) -> Product:
        """Create a new product"""
        try:
            product_dict = product.dict()
            await self.collection.insert_one(product_dict)
            return Product(**product_dict)
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            raise
    
    async def bulk_insert_products(self, products: List[dict]) -> int:
        """Bulk insert products"""
        try:
            if products:
                result = await self.collection.insert_many(products)
                return len(result.inserted_ids)
            return 0
        except Exception as e:
            logger.error(f"Error bulk inserting products: {e}")
            raise
    
    async def delete_all_products(self):
        """Delete all products (for reseeding)"""
        try:
            await self.collection.delete_many({})
            logger.info("All products deleted")
        except Exception as e:
            logger.error(f"Error deleting products: {e}")
            raise


class OrderService:
    """Service for order operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.orders
    
    async def get_all_orders(self) -> List[Order]:
        """Get all orders sorted by orderTime descending"""
        try:
            cursor = self.collection.find({}).sort("orderTime", -1)
            orders = await cursor.to_list(length=None)
            return [Order(**order) for order in orders]
        except Exception as e:
            logger.error(f"Error fetching orders: {e}")
            return []
    
    async def get_order_by_id(self, order_id: str) -> Optional[Order]:
        """Get an order by ID"""
        try:
            order = await self.collection.find_one({"id": order_id})
            if order:
                return Order(**order)
            return None
        except Exception as e:
            logger.error(f"Error fetching order {order_id}: {e}")
            return None
    
    async def create_order(self, order: OrderCreate) -> Order:
        """Create a new order"""
        try:
            order_dict = order.dict()
            order_dict['created_at'] = datetime.utcnow()
            
            await self.collection.insert_one(order_dict)
            return Order(**order_dict)
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            raise
    
    async def delete_order(self, order_id: str) -> bool:
        """Delete an order by ID"""
        try:
            result = await self.collection.delete_one({"id": order_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting order {order_id}: {e}")
            return False