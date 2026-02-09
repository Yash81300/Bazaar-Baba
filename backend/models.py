from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# ============= Product Models =============

class ProductRating(BaseModel):
    """Product rating information"""
    stars: float = Field(..., ge=0, le=5)
    count: int = Field(..., ge=0)


class ProductColor(BaseModel):
    """Product color option"""
    name: str
    hex: str


class Product(BaseModel):
    """Product model"""
    id: str
    image: str
    name: str
    description: str
    rating: ProductRating
    priceCents: int
    keywords: List[str]
    type: Optional[str] = None
    sizeChartLink: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[ProductColor]] = None
    instructionsLink: Optional[str] = None
    warrantyLink: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}



class ProductCreate(BaseModel):
    """Model for creating a new product"""
    id: str
    image: str
    name: str
    description: str
    rating: ProductRating
    priceCents: int
    keywords: List[str]
    type: Optional[str] = None
    sizeChartLink: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[ProductColor]] = None
    instructionsLink: Optional[str] = None
    warrantyLink: Optional[str] = None


# ============= Order Models =============

class OrderItem(BaseModel):
    """Item in an order"""
    productId: str
    quantity: int
    deliveryOptionId: Optional[str] = "1"


class Order(BaseModel):
    """Order model"""
    id: str
    orderTime: str
    products: List[OrderItem]
    totalCostCents: int
    created_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class OrderInDB(Order):
    """Order model as stored in database"""
    mongo_id: Optional[PyObjectId] = Field(default=None, alias="_id")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class OrderCreate(BaseModel):
    """Model for creating a new order"""
    id: str
    orderTime: str
    products: List[OrderItem]
    totalCostCents: int