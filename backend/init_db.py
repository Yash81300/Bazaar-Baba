"""
Database initialization and management script
"""
import asyncio
import json
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


async def init_database():
    """Initialize database with products"""
    print("🚀 Initializing Bazaar Baba Database...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB at {settings.mongodb_url}")
        print(f"📊 Using database: {settings.database_name}")
        
        # Check existing products
        products_count = await db.products.count_documents({})
        print(f"📦 Current products in database: {products_count}")
        
        if products_count > 0:
            response = input("⚠️  Products already exist. Delete and re-seed? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Initialization cancelled")
                return
            
            # Delete existing products
            result = await db.products.delete_many({})
            print(f"🗑️  Deleted {result.deleted_count} existing products")
        
        # Load products from JSON
        products_file = Path(__file__).parent / "products.json"
        if not products_file.exists():
            print("❌ products.json not found!")
            return
        
        with open(products_file, 'r') as f:
            products = json.load(f)
        
        # Insert products
        if products:
            result = await db.products.insert_many(products)
            print(f"✅ Inserted {len(result.inserted_ids)} products")
        
        # Create indexes for better performance
        await db.products.create_index("id", unique=True)
        await db.orders.create_index("id", unique=True)
        await db.orders.create_index("orderTime")
        print("✅ Created database indexes")
        
        print("\n🎉 Database initialization complete!")
        print(f"📍 API endpoint: http://{settings.host}:{settings.port}")
        print(f"📖 Documentation: http://{settings.host}:{settings.port}/docs")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


async def reset_orders():
    """Reset all orders"""
    print("🗑️  Resetting orders...")
    
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    try:
        result = await db.orders.delete_many({})
        print(f"✅ Deleted {result.deleted_count} orders")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


async def show_stats():
    """Show database statistics"""
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    try:
        products_count = await db.products.count_documents({})
        orders_count = await db.orders.count_documents({})
        
        print("\n📊 Database Statistics")
        print("=" * 40)
        print(f"Database: {settings.database_name}")
        print(f"Products: {products_count}")
        print(f"Orders: {orders_count}")
        print("=" * 40)
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            asyncio.run(init_database())
        elif command == "reset-orders":
            asyncio.run(reset_orders())
        elif command == "stats":
            asyncio.run(show_stats())
        else:
            print("Unknown command. Use: init, reset-orders, or stats")
    else:
        print("\n🔧 Bazaar Baba Database Manager\n")
        print("Usage:")
        print("  python init_db.py init          - Initialize/seed database")
        print("  python init_db.py reset-orders  - Clear all orders")
        print("  python init_db.py stats         - Show database stats")
