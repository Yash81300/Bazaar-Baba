# 🛒 Bazaar Baba

A modern, full-stack e-commerce web application with a clean UI, shopping cart functionality, and MongoDB backend. Built with vanilla JavaScript, HTML/CSS, and Python FastAPI.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)

---

## 🌟 Features

### Frontend
- 🛍️ **Product Catalog** - Browse products with images, ratings, and prices
- 🔍 **Search Functionality** - Search products by name or description
- 🛒 **Shopping Cart** - Add, remove, and update product quantities
- 📦 **Order Management** - View order history and track deliveries
- 💳 **Checkout System** - Complete orders with delivery options
- 🌙 **Dark/Light Theme** - Toggle between themes with persistent settings
- 📱 **Responsive Design** - Mobile-friendly layout with adaptive logos
- ⚡ **Loading States** - Smooth loading animations and transitions

### Backend
- 🚀 **FastAPI REST API** - High-performance async Python backend
- 🗄️ **MongoDB Database** - NoSQL database for products and orders
- 🔄 **Auto-seeding** - Automatically loads products from JSON on startup
- 📝 **API Documentation** - Auto-generated Swagger/ReDoc documentation
- 🔐 **CORS Support** - Configured for frontend integration
- 📊 **Type Safety** - Full Pydantic models for data validation

---

## 🖼️ Screenshots

### Light Theme
![Bazaar Baba Light Theme](images/bazaar-baba-logo.png)

### Dark Theme
![Bazaar Baba Dark Theme](images/bazaar-baba-logo-neon.png)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- MongoDB 6.0+
- Modern web browser
- Live Server extension (for VS Code) or any local server

### 1. Clone the Repository
```bash
git clone https://github.com/Yash81300/Bazaar-Baba.git
cd Bazaar-Baba
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB connection details
# MONGODB_URL=mongodb://localhost:27017
# DATABASE_NAME=bazaar_baba
```

### 3. Start MongoDB

**Install MongoDB locally:**
- Download from: [MongoDB Download](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- Ensure it's running on `localhost:27017`

### 4. Run the Backend Server

```bash
# From backend directory
python main.py
```

Backend will be available at: `http://localhost:8000`

### 5. Run the Frontend

```bash
# From project root directory
# Use Live Server in VS Code, or any local server
# Simply open bazaar-baba.html in your browser via a local server
```

Frontend will be available at: `http://localhost:5500` (or your server's port)

---

## 📁 Project Structure

```
Bazaar-Baba/
├── backend/                    # Backend API
│   ├── main.py                # FastAPI application & routes
│   ├── models.py              # Pydantic data models
│   ├── services.py            # Business logic layer
│   ├── database.py            # MongoDB connection
│   ├── config.py              # Configuration management
│   ├── products.json          # Initial product data
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   └── README.md             # Backend documentation
│
├── config/                    # Frontend configuration
│   └── config.js             # API endpoint configuration
│
├── data/                      # Data layer
│   ├── cart.js               # Shopping cart logic
│   ├── products.js           # Product data handling
│   ├── orders.js             # Order management
│   └── deliveryOptions.js    # Delivery options
│
├── images/                    # Static assets
│   ├── products/             # Product images
│   ├── icons/                # UI icons
│   ├── ratings/              # Star rating images
│   └── *.png                 # Logo files
│
├── scripts/                   # JavaScript modules
│   ├── bazaar-baba.js        # Main page logic
│   ├── checkout.js           # Checkout functionality
│   ├── orders.js             # Orders page logic
│   ├── theme.js              # Theme switcher
│   ├── logo-switcher.js      # Responsive logo handler
│   ├── checkout/             # Checkout modules
│   │   ├── orderSummary.js
│   │   └── paymentSummary.js
│   └── utils/                # Utility functions
│       ├── money.js          # Currency formatting
│       ├── search.js         # Search functionality
│       └── loading.js        # Loading states
│
├── styles/                    # CSS stylesheets
│   ├── shared/               # Shared styles
│   │   ├── general.css
│   │   ├── bazaar-baba-header.css
│   │   ├── loading.css
│   │   └── theme-dark.css
│   └── pages/                # Page-specific styles
│       ├── bazaar-baba.css
│       ├── checkout/
│       ├── orders.css
│       └── tracking.css
│
├── tests-jasmine/             # Test suite
│   ├── cartTest.js           # Cart functionality tests
│   ├── searchTest.js         # Search tests
│   └── moneyTest.js          # Money utility tests
│
├── bazaar-baba.html          # Main page
├── checkout.html             # Checkout page
├── orders.html               # Orders page
├── product-details.html      # Product details page
├── tracking.html             # Order tracking page
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🔧 API Endpoints

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

### Health Check
```
GET    /                   - Basic health check
GET    /health            - Detailed health with DB status
```

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🎨 Customization

### Change API Endpoint
Edit `config/config.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Add Products
Edit `backend/products.json` and restart the backend server.

### Modify Theme Colors
Edit `styles/shared/theme-dark.css` for dark theme colors.

---

## 🧪 Testing

Run Jasmine tests by opening `tests-jasmine/tests.html` in your browser.

Tests include:
- ✅ Cart functionality
- ✅ Money formatting utilities
- ✅ Search functionality

---

## 🛠️ Technologies Used

### Frontend
- **HTML5/CSS3** - Modern web standards
- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **Jasmine** - Testing framework
- **Responsive Design** - Mobile-first approach

### Backend
- **Python 3.11+** - Modern Python features
- **FastAPI** - High-performance async web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

---

## 📝 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=bazaar_baba
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

---


---

## 🙏 Acknowledgments

- Product images are for demonstration purposes
- Icons from custom design
- Jasmine testing framework

---

## 📧 Contact

**Yash Malik**
- GitHub: [@Yash81300](https://github.com/Yash81300)
- Email: yashmalik81300@gmail.com

**Project Link:** [https://github.com/Yash81300/Bazaar-Baba](https://github.com/Yash81300/Bazaar-Baba)

---

## 🐛 Known Issues

- Ensure MongoDB is running before starting the backend
- Use a local server (not file://) to run the frontend
- CORS might need adjustment for production deployment

---

## 🚧 Future Enhancements

- [ ] User authentication and login
- [ ] Payment gateway integration
- [ ] Product reviews and ratings
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced filtering and sorting
- [ ] Wishlist functionality
- [ ] Product recommendations

---

**Made with ❤️ by Yash Malik**
