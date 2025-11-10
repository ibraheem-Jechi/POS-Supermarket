🛒 Supermarket POS System (MERN Stack)

A Point of Sale (POS) web application for supermarkets that manages sales, products, suppliers, users, expenses, and reports — built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

This system is designed for admins and cashiers to easily handle day-to-day store operations with real-time sales tracking, expense management, inventory monitoring, and performance reports.

🚀 Features Overview

![Login Page](https://i.imgur.com/O2Kfzrr.png)

💳 POS (Point of Sale)

User-friendly sales interface for cashiers.

Add products to the cart, scan barcodes, or search manually.

Multiple payment methods (Cash, Card, etc.).

Calculates subtotal, tax, and total automatically.

Print daily and monthly reports.

Real-time sales summary dashboard.

![POS Page](https://i.imgur.com/3Ztm9wk.png)

📦 Product Management

Add, edit, and delete products.

Manage details: name, barcode, cost, price, quantity, expiry, category, and supplier.

Automatically calculates profit margins.

Highlights low stock and expired items.

Batch and supplier tracking.

![Product Page](https://i.imgur.com/wWEGBl0.png)

🚚 Supplier Management

Add and manage supplier details (name, contact person, phone, email, and address).

Supplier contacts automatically linked to products.

Edit or remove suppliers anytime.

![Supplier Page](https://i.imgur.com/k7AqNmA.png)

👥 User Management

Manage all system users with role-based access control:

Admin: Full access to all modules.

Cashier: POS access and daily reports.

Accountant / Finance: Manage expenses and view reports.

Track total users, total salaries, and roles.

Edit or remove users with a single click.

![User Management Page](https://i.imgur.com/CTdBGFf.png)

🧺 Categories Management

Add, view, or delete product categories dynamically.

Categories displayed in the POS for easy product filtering.

![Categories Page](https://i.imgur.com/SOiJFmY.png)

💵 Expenses Management

Record and track monthly and daily expenses (Rent, Salaries, Suppliers, Utilities, etc.).

Filter by date, month, or category.

View total monthly expenses and detailed breakdown.

Edit or delete expenses easily.

![Expenses Page](https://i.imgur.com/EbsjfRs.png)


📊 Reports & Analytics

Monthly, yearly, and daily performance visualization.

Charts showing Sales, Expenses, and Profit over time.

Detailed tabular report for each month.

Identify trends in store performance.

![Reports Page](https://i.imgur.com/vtlDwzF.png)

🧾 Sales History

Track all invoices with cashier names, dates, and totals.

Filter by day, week, or month.

Calculate average sale per receipt.

View, edit, or delete transactions.

![Sales History Page](https://i.imgur.com/aSN9ZFz.png)


📈 TOPS (Performance Reports)

Top 10 Products — based on units sold and revenue.

Top 3 Cashiers — ranked by total sales.

Top 5 Categories — based on performance.

Helps management analyze productivity and trends.

![Tops Page](https://i.imgur.com/LPwz2sk.png)


💰 Daily Sales Report

Generates reports for specific dates.

Displays overall summary including Total Invoices, Subtotal, Tax, and Total.

Lists all invoices with cashier names, time, and itemized details.

Supports printing for documentation.

![Main Reading Page](https://i.imgur.com/sgjRvNC.png)


🚨 Alerts & Notifications

Real-time alerts for:

Low Stock

Out of Stock

Expired Items

Helps prevent sales interruptions and ensures inventory accuracy.

![Alerts Page](https://i.imgur.com/CmlEWdX.png)


🧠 Tech Stack
    Layer	                Technology
    Frontend	             React.js, Bootstrap, Axios
    Backend                 Node.js, Express.js
    Database	            MongoDB with Mongoose
    Authentication	        JWT (JSON Web Token)
    Charts & Visualization	Chart.js / Recharts
    State Management    	React Hooks + Context API






⚙️ How to Run the Project

Follow these steps to set up the Supermarket POS system locally.

1️⃣ Clone the Repository
git clone https://github.com/ibraheem-Jechi/POS-Supermarket.git
cd POS-Supermarket

2️⃣ Install Dependencies
Backend Setup
cd backend
npm install

Frontend Setup
cd ../frontend
npm install

3️⃣ Configure Environment Variables

Create a .env file in the backend folder and add the following values:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


🧠 You can get your MongoDB connection string from MongoDB Atlas
.

4️⃣ Run the Application
Start Backend Server
cd backend
npm run dev

Start Frontend

Open another terminal and run:

cd frontend
npm start
