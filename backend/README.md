# Bazaar Baba Backend API

A modern FastAPI backend with MongoDB for the Bazaar Baba e-commerce platform.

## Features

✅ **MongoDB Integration** - Persistent data storage with Motor (async MongoDB driver)  
✅ **RESTful API** - Clean endpoints for products and orders  
✅ **Auto-seeding** - Automatically loads products from JSON on first run  
✅ **Environment Configuration** - Flexible configuration via .env files  
✅ **CORS Support** - Configured for frontend integration  
✅ **Logging** - Comprehensive logging for debugging  
✅ **Type Safety** - Full Pydantic models for validation  

---

## Prerequisites

- Python 3.11+
- MongoDB 6.0+ (running locally or remote)

---

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection details:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=bazaar_baba
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

### 3. Start MongoDB

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Using MongoDB Compass or local installation:**
- Make sure MongoDB is running on `localhost:27017`

---

## Running the Server

### Development Mode (with auto-reload)

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at: `http://localhost:8000`

---

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## API Endpoints

### Health Check

```
GET /                  - Basic health check
GET /health           - Detailed health check with DB status
```

### Products

```
GET    /products           - Get all products
GET    /products/{id}      - Get product by ID
POST   /products           - Create new product
```

### Orders

```
GET    /orders             - Get all orders
GET    /orders/{id}        - Get order by ID
POST   /orders             - Create new order
DELETE /orders/{id}        - Delete order
```

---

## Project Structure

```
backend/
├── main.py              # FastAPI application & routes
├── models.py            # Pydantic models
├── services.py          # Business logic layer
├── database.py          # MongoDB connection manager
├── config.py            # Configuration management
├── products.json        # Initial product data
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
├── .env.example         # Environment template
└── README.md           # This file
```

---

## Database Collections

### Products Collection
- Stores product catalog
- Auto-seeded from `products.json` on first run
- Schema includes: id, name, description, price, rating, images, etc.

### Orders Collection
- Stores customer orders
- Includes: order ID, timestamp, items, total cost
- Auto-sorted by order time (newest first)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `bazaar_baba` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000,...` |

---

## Development Tips

### View MongoDB Data

Use MongoDB Compass:
1. Connect to `mongodb://localhost:27017`
2. Select database: `bazaar_baba`
3. View collections: `products`, `orders`

### Reset Database

To clear all data and re-seed:

```python
# Connect to MongoDB shell
mongosh

use bazaar_baba
db.products.deleteMany({})
db.orders.deleteMany({})
```

Then restart the server - products will be re-seeded automatically.

### Testing Endpoints

Using curl:

```bash
# Get all products
curl http://localhost:8000/products

# Create an order
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "order-123",
    "orderTime": "2024-02-07T10:00:00Z",
    "products": [
      {"productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6", "quantity": 2}
    ],
    "totalCostCents": 2180
  }'
```

---

## Troubleshooting

### MongoDB Connection Failed

```
Error: Failed to connect to MongoDB
```

**Solution:**
1. Ensure MongoDB is running
2. Check `MONGODB_URL` in `.env`
3. Verify firewall/network settings

### Port Already in Use

```
Error: [Errno 48] Address already in use
```

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Products Not Loading

**Solution:**
1. Check that `products.json` exists
2. Verify MongoDB connection
3. Check server logs for errors

---

## Production Deployment

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t bazaar-baba-api .
docker run -p 8000:8000 --env-file .env bazaar-baba-api
```

### Environment-specific Settings

Use different `.env` files:
- `.env.development`
- `.env.production`

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions, please open an issue on GitHub.
