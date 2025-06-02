# MealTracker – Restaurant Web Application

**MealTracker** is a full-stack restaurant website built using Node.js, Express, EJS, and MongoDB. It is designed for a single restaurant to manage its food items and customers. The system offers both a customer-facing website and an admin panel for smooth business operations.

---

##  Project Overview

MealTracker provides two interfaces:

- **Customer Side**: Users can browse food items, register/login, add items to cart, and place orders.
- **Admin Panel**: Admin can add/edit/delete products, manage orders, respond to customer queries, and handle user data.

The application is responsive and suitable for both desktop and mobile users. MongoDB is used for storing products, orders, and user data.

---

##  Project Structure

MealTracker/
├── public/ # Static assets like CSS, JS, and images
├── views/ # EJS templates for frontend
├── routes/ # Express route handlers
├── models/ # Mongoose models
├── middlewares/ # Custom middleware functions
├── uploads/ # Uploaded user images
├── server.js # Application entry point
├── package.json # Project metadata and dependencies
├── .gitignore


---

## ⚙️ Requirements

To run this project locally, make sure you have:

- Node.js installed
- MongoDB (local or Atlas)
- npm

 Features
🔹 Admin Panel
Add, edit, and delete food products

View and manage customer orders

Mark orders as delivered

View user list and user details

Respond to customer queries

Dashboard with sales/analytics overview

🔸 Customer Side
Register and login

View food categories (Pizza, Coffee, Desi, Desserts, etc.)

Add items to cart

Place orders

Receive order notifications

Responsive interface for all screen sizes
