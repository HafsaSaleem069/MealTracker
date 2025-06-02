const mongoose = require("mongoose");

// Define the User Schema
const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // may be null for Google-only users
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    // Reset password-related
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    previousPasswords: { type: [String], default: [] }
});


// Define the Product Schema
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Define the Cart Schema
const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            name: { type: String, required: true },  // Product name for quick access
            quantity: { type: Number, default: 0 },
            price: { type: Number },
            totalPrice: { type: Number, default: 0 },
        }
    ],
    totalBill: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Define the Order Schema
const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }, // Store the name of the user
    purchases: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },  // Store product name
            quantity: { type: Number, required: true },
            purchaseDate: { type: Date, default: Date.now },
            totalPrice: { type: Number, required: true }
        }
    ],
    orderStatus: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: { type: Date, default: Date.now },
});

// Define the Notifications Schema
const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Define the Queries Schema
const QuerySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }, // Store the name of the user
    queries: [
        {
            queryText: { type: String, required: true },
            response: { type: String, default: null },  // Response to the query
            queryDate: { type: Date, default: Date.now },
            responseDate: { type: Date }
        }
    ]
});


// Models
const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Query = mongoose.model('Query', QuerySchema);

// Export Models
module.exports = {
    User,
    Product,
    Cart,
    Order,
    Notification,
    Query
};
