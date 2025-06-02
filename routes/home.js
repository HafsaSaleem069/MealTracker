const express = require('express');
const router = express.Router();
const userSessionMiddleware = require("../middlewares/site-middleware");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("832761851712-kubtp813vs6b7iledisqok9mrqdnn31v.apps.googleusercontent.com"); // replace this
const bcrypt = require('bcrypt');
const { User, Product, Cart, Order, Notification, Query } = require('../models/usersModel');
// Home Page Route
router.get('/', userSessionMiddleware,
    async (req, res) => {
        res.render("home", { user: res.locals.user });
    });
router.get('/navbar', userSessionMiddleware,
    async (req, res) => {
        res.render("navbar", { user: res.locals.user });
    });
// Burger Page Route
router.get('/burger', userSessionMiddleware, async (req, res) => {
    try {
        // Fetch products where category is "Burger"
        const burgers = await Product.find({ category: "Burger" });

        // Render the burger.ejs file and pass the burgers data
        res.render('burger', { user: res.locals.user, burgers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching burger products');
    }
});
// pizza Page Route
router.get('/pizza', userSessionMiddleware, async (req, res) => {
    try {
        // Fetch products where category is "Burger"
        const burgers = await Product.find({ category: "Pizza" });

        // Render the burger.ejs file and pass the burgers data
        res.render('pizza', { user: res.locals.user, burgers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching burger products');
    }
});
// drinks Page Route
router.get('/desi', userSessionMiddleware, async (req, res) => {
    try {
        // Fetch products where category is "Burger"
        const burgers = await Product.find({ category: "Traditionals" });

        // Render the burger.ejs file and pass the burgers data
        res.render('desi', { user: res.locals.user, burgers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching burger products');
    }
});
// coffee Page Route
router.get('/coffee', userSessionMiddleware, async (req, res) => {
    try {
        // Fetch products where category is "Burger"
        const burgers = await Product.find({ category: "Coffee" });

        // Render the burger.ejs file and pass the burgers data
        res.render('coffee', { user: res.locals.user, burgers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching burger products');
    }
});
// desserts Page Route
router.get('/desserts', userSessionMiddleware, async (req, res) => {
    try {
        // Fetch products where category is "Burger"
        const burgers = await Product.find({ category: "Desserts" });

        // Render the burger.ejs file and pass the burgers data
        res.render('desserts', { user: res.locals.user, burgers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching burger products');
    }
});
// Register Page Route
router.get('/register', (req, res) => {
    res.render("register");
});
// LOGIN Page Route
router.get('/login', (req, res) => {
    res.render("login");
});
// home.js
router.post('/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "832761851712-kubtp813vs6b7iledisqok9mrqdnn31v.apps.googleusercontent.com"
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Here: check if user exists or create one
        // For now, just return the user info
        res.json({ success: true, user: { email, name } });

    } catch (error) {
        console.error("Error verifying Google token", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
});
router.post("/reset-password", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email not registered." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        const resetLink = `http://localhost:3000/home/reset-password/${token}`;

        await transporter.sendMail({
            to: email,
            subject: "Reset your password",
            html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
        });

        res.json({ message: "Reset link sent to your email." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error occurred." });
    }
});
router.get('/reset-password', (req, res) => {
    res.render('reset-password');
});
//---//Register a new user
router.post("/register/users", async (req, res) => {
    const { fullname, email, password, phone, address } = req.body;

    try {
        // Create a new user using the userModel by passing to constructor
        const newUser = new User({ fullname, email, password, phone, address });
        // Save user to MongoDB
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        console.error("Error during registration:", error.message);

        // Handle unique email constraint error
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});
router.get('/register/users', (req, res) => {
    res.send(User);
})
//-------------------------//Login a user
router.post("/login/users", async (req, res) => {
    const { email, password } = req.body;
    // Save user details to session


    try {
        // Find the user by email
        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            // If no user is found
            return res.status(404).json({ message: "User not found!" });
        }

        // Check if the password matches
        if (existingUser.password !== password) {
            return res.status(401).json({ message: "Incorrect password!" });
        }
        console.log("Before data entered in session")
        req.session.user = { email: existingUser.email }; // Store only necessary fields
        console.log("data entered in session")
        // If authentication succeeds
        res.status(200).json({ message: "Login successful!", user: existingUser });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: "Error during login", error: error.message });
    }
});
//------------------------//Adding items to cart
router.post('/cart/items', userSessionMiddleware, async (req, res) => {
    console.log("Request entered in /cart/items route");

    const { name, price } = req.body; // Extract product name and price from request body
    console.log({ name, price });

    try {
        // Get the logged-in user's email from the session
        const userEmail = req.session.user.email;

        // Find the user by email
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            res.redirect("/home/login")
        }

        // Find the user's cart
        let cart = await Cart.findOne({ userId: user._id });

        if (!cart) {
            // If the user doesn't have a cart, create one
            cart = new Cart({
                userId: user._id,
                products: [],
                totalBill: 0,
            });
        }

        // Check if the product is already in the cart
        const existingItem = cart.products.find(item => item.name === name);

        if (existingItem) {
            // If the item exists, update its quantity and total price
            existingItem.quantity += 1;
            existingItem.totalPrice = existingItem.quantity * price;
        } else {
            // If the item does not exist, add it to the cart
            cart.products.push({
                name,
                quantity: 1, // Start with 1 quantity
                price,
                totalPrice: price, // Total price for this item
            });
        }

        // Recalculate the total bill for the cart
        cart.totalBill = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: "Item added to cart!", cart: cart.products });
    } catch (error) {
        console.error("Error adding item to cart:", error.message);
        res.status(500).json({ message: "Error adding item to cart", error: error.message });
    }
});
//-----------------------//Cart related Routes
// Route to get cart items for the logged-in user
router.get('/cart', userSessionMiddleware, async (req, res) => {
    try {
        // Find the user based on the session email
        const user = await User.findOne({ email: req.session.user.email });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Find the user's cart using the user's ID
        const cart = await Cart.findOne({ userId: user._id });
        res.render("cart", { user: res.locals.user, cart: cart || null });

        // Respond with the products in the user's cart
        // res.status(200).json({ products: cart.products });
    } catch (error) {
        console.error("Error retrieving cart items:", error.message);
        res.status(500).json({ message: "Error retrieving cart items", error: error.message });
    }
});
router.patch('/cart/items', userSessionMiddleware, async (req, res) => {
    const { name, action } = req.body;

    try {
        const userEmail = req.session.user.email;

        // Find the user and cart
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found!" });
        }

        const existingItem = cart.products.find(item => item.name === name);
        if (!existingItem) {
            return res.status(404).json({ message: "Item not found in cart!" });
        }

        if (action === 'increment') {
            existingItem.quantity += 1;
            existingItem.totalPrice = existingItem.quantity * existingItem.price; // Correct totalPrice
        } else if (action === 'decrement') {
            if (existingItem.quantity > 1) {
                existingItem.quantity -= 1;
                existingItem.totalPrice = existingItem.quantity * existingItem.price; // Correct totalPrice
            } else {
                // Remove item if quantity drops to 0
                cart.products = cart.products.filter(item => item.name !== name);
            }
        } else if (action === 'remove') {
            cart.products = cart.products.filter(item => item.name !== name);
        } else {
            return res.status(400).json({ message: "Invalid action!" });
        }

        // Save updated cart
        await cart.save();
        res.status(200).json({ success: true, cart: cart.products });
    } catch (error) {
        console.error("Error updating cart items:", error.message);
        res.status(500).json({ message: "Error updating cart items", error: error.message });
    }
});
// Route to delete an item from the cart
router.delete('/cart/items', userSessionMiddleware, async (req, res) => {
    const { name } = req.body; // Get the item name from the request body

    try {
        const userEmail = req.session.user.email;

        // Find the user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found!" });
        }

        // Check if the item exists in the cart
        const existingItem = cart.products.find(item => item.name === name);
        if (!existingItem) {
            return res.status(404).json({ message: "Item not found in cart!" });
        }

        // Remove the item from the cart
        cart.products = cart.products.filter(item => item.name !== name);

        // Save the updated cart
        await cart.save();

        res.status(200).json({ success: true, message: "Item removed successfully", cart: cart.products });
    } catch (error) {
        console.error("Error deleting item from cart:", error.message);
        res.status(500).json({ message: "Error deleting item from cart", error: error.message });
    }
});
// -------------------------// Profile Page Route
router.get('/profile', userSessionMiddleware, async (req, res) => {
    try {
        // Get the logged-in user's email from the session
        const userEmail = req.session.user.email;

        // Find the user by email
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Fetch purchase history for the user
        const purchaseHistory = await PurchaseHistory.find({ userId: user._id }); // Corrected to use PurchaseHistory model

        // Render the profile page with user data and purchase history
        res.render('profile', {
            user: user, // Pass the whole user object to access fullname and other details
            purchaseHistory: purchaseHistory // Pass the purchaseHistory directly
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get("/logout", async (req, res) => {
    req.session.user = null;
    console.log("session clear");
    res.redirect("http://localhost:3000/home/login");
});
//I have made this route /cart/order to  write data in orders collection of database 
router.post('/cart/order', userSessionMiddleware, async (req, res) => {
    try {
        const userEmail = req.session.user.email; // Retrieve email from session
        console.log("User email from session:", userEmail);

        // Find the user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.error("User not found for email:", userEmail);
            return res.status(404).json({ message: "User not found!" });
        }
        console.log("User found:", user);

        // Find the user's cart
        const cart = await Cart.findOne({ userId: user._id });
        if (!cart || cart.products.length === 0) {
            console.error("Cart is empty or not found for user ID:", user._id);
            return res.status(400).json({ message: "Cart is empty!" });
        }
        console.log("Cart found with products:", cart.products);

        // Prepare order details
        const purchases = cart.products.map(product => ({
            productId: product._id, // Assuming product._id exists in the cart schema
            name: product.name,
            quantity: product.quantity,
            totalPrice: product.totalPrice,
            purchaseDate: new Date()
        }));

        // Create a new order
        const newOrder = new Order({
            userId: user._id,
            userName: user.fullname, // Add user's name from the User collection
            purchases: purchases,
            orderStatus: 'Pending' // Default status
        });

        console.log("Order object before save:", newOrder);

        // Save the order to the database
        await newOrder.save();
        console.log("Order saved successfully!");

        // Delete the user's cart collection
        await Cart.deleteOne({ userId: user._id });
        console.log("Cart deleted successfully for user:", user._id);

        res.status(200).json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        console.error("Error placing order:", error.message);
        res.status(500).json({ message: "Error placing order", error: error.message });
    }
});
//---------------------//NOTIFICATIONS
router.get('/notifications', userSessionMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.session.user.email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Fetch notifications for the logged-in user
        const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });

        res.render('notifications', { notifications });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching notifications');
    }
});
//-----------------------//QUERY
// POST /query - Save the user's query
router.post('/query', userSessionMiddleware, async (req, res) => {
    const { queryText } = req.body; // No need to include queryDate as it defaults to Date.now

    try {
        // Find the user based on the session email
        const user = await User.findOne({ email: req.session.user.email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Find or create a query document for the user
        const userQuery = await Query.findOneAndUpdate(
            { userId: user._id }, // Using the user's ID from the session
            {
                $push: {
                    queries: {
                        queryText,
                        // queryDate is now automatically set to Date.now by the schema
                    },
                },
                userName: user.fullname // Set userName to the user's full name
            },
            { new: true, upsert: true } // Return the updated document, and create if it doesn't exist
        );

        res.status(201).json({ message: "Query saved successfully!", data: userQuery });
    } catch (error) {
        console.error("Error saving query:", error.message);
        res.status(500).json({ message: "Failed to save query.", error: error.message });
    }
});
// Fetch all responses for a specific user
router.get('/responses/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user's queries with responses
        const userQueries = await Query.findOne({ userId })
            .select('queries') // Only select the queries array
            .lean(); // Use lean for better performance

        if (!userQueries) {
            return res.status(404).send('No queries found for this user');
        }

        // Filter out queries that have a response
        const userResponses = userQueries.queries.filter(query => query.response !== null);

        // Format the response data
        const formattedResponses = userResponses.map(query => ({
            queryText: query.queryText,
            responseText: query.response,
            queryDate: query.queryDate,
            responseDate: query.responseDate
        }));

        res.json(formattedResponses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
module.exports = router;



