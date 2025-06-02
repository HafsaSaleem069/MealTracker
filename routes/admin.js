const express = require('express');
const router = express.Router();
const { User, Product, Cart, Order, Notification, Query } = require('../models/usersModel');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb('Error: Only images are allowed!');
        }
    }
});
router.get('/', (req, res) => {
    res.render("adminDashboard"); // Render admin.ejs with usersdata
});
// adminUsersPage Route
// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch users from MongoDB
        res.render('adminUser', { users }); // Pass users to EJS
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/users/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete all related data from Cart, Order, Notification, and Query
        await Cart.deleteMany({ userId: id });
        await Order.deleteMany({ userId: id });
        await Notification.deleteMany({ userId: id });
        await Query.deleteMany({ userId: id });

        // Delete the user
        await User.findByIdAndDelete(id);

        res.redirect('/admin/users'); // Redirect back to the users list
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete user and related data');
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const orders = await Order.find({ userId }).populate('purchases.productId'); // Fetch orders for the user

        res.render('userDetail', { user, orders }); // Pass orders to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// Update a user (POST updated data)
router.post('/users/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, username, phone, address } = req.body;
        await User.findByIdAndUpdate(id, { fullName, email, username, phone, address });
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update user');
    }
});

//------------------//Handling Orders

router.get('/orders', async (req, res) => {

    try {
        // Extract query parameters
        const { page = 1, search = '', status = '', sort = 'asc' } = req.query;
        const limit = 5; // Items per page
        const skip = (page - 1) * limit;

        // Build the query for searching and filtering
        let query = {};
        if (search) {
            query['userName'] = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        if (status) {
            query['orderStatus'] = status;
        }

        // Fetch orders with total price calculation from purchases directly in the Order collection
        const ordersWithTotalPrice = await Order.aggregate([
            {
                $match: query // Apply search and filter query
            },
            {
                $addFields: {
                    totalPrice: {
                        $sum: {
                            $map: {
                                input: '$purchases',
                                as: 'purchase',
                                in: { $multiply: ['$$purchase.totalPrice', '$$purchase.quantity'] } // Calculate total price for each purchase
                            }
                        }
                    }
                }
            },
            {
                $sort: { totalPrice: sort === 'asc' ? 1 : -1 } // Sort by total price
            },
            {
                $skip: skip // Pagination
            },
            {
                $limit: limit // Limit the number of results
            }
        ]);

        // Get the total number of orders for pagination
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('adminOrders', { orders: ordersWithTotalPrice, totalPages, currentPage: page, });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching orders');
    }
});

router.post('/orders/update-status', async (req, res) => {
    const { orderId, status } = req.body;

    try {
        const order = await Order.findById(orderId).populate('userId');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Update order status
        order.orderStatus = status;
        await order.save();

        // If status is "Delivered", create a notification
        if (status === 'Delivered') {
            const message = `Your order of ${order.purchases.reduce((sum, p) => sum + p.totalPrice, 0)}/- has been delivered.`;
            const notification = new Notification({
                userId: order.userId._id,
                message,
            });
            await notification.save();
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

//------------------// Products Management----------


router.post('/adminProducts/add', upload.single('image'), async (req, res) => {
    try {
        const { name, category, description, price } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const newProduct = new Product({
            name,
            category,
            image,
            description,
            price
        });

        await newProduct.save();
        res.redirect('/admin/products'); // Redirect to the product list page
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/products', async (req, res) => {
    try {
        const { category } = req.query; // Get the category from query params
        let query = {}; // Initialize an empty query object

        // If a category is selected, modify the query to filter by category
        if (category) {
            query.category = category;
        }

        // Fetch products based on the query
        const products = await Product.find(query);
        const categories = await Product.distinct('category'); // Fetch distinct categories

        // Render the products page with filtered products and categories
        res.render('adminProducts', { products, categories, selectedCategory: category });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// DELETE a product
router.post('/products/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id); // Delete product by ID
        res.redirect('/admin/products'); // Redirect to the products list
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete product');
    }
});

// adminCategory Page Route
router.get('/category', (req, res) => {
    res.render("adminCategory"); // Render adminDashboard.ejs with usersdata
});
// adminDeliveredItems Page Route
router.get('/deliveries', (req, res) => {
    res.render("adminDeliveredItems"); // Render adminDashboard.ejs with usersdata
});

// Fetch all users with their latest query for the sidebar
router.get('/queries', async (req, res) => {
    try {
        // Fetch all queries
        const queries = await Query.find({});

        // Combine users and their latest queries for the sidebar
        const usersWithLatestQueries = queries.map(query => {
            const latestQuery = query.queries[query.queries.length - 1]; // Get the latest query for the user

            return {
                userId: query.userId,
                userName: query.userName || 'Unknown User',
                latestQuery: latestQuery ? latestQuery.queryText : 'No latest query',
                latestQueryDate: latestQuery ? new Date(latestQuery.queryDate) : null // Date object for sorting
            };
        });

        // Sort users by latestQueryDate in descending order
        const sortedUsers = usersWithLatestQueries.sort((a, b) => b.latestQueryDate - a.latestQueryDate);

        // Render the page with sorted users
        res.render('adminQueries', { users: sortedUsers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Fetch all queries for a specific user
router.get('/queries/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userQueries = await Query.findOne({ userId }).populate('userId', 'userName');
        if (!userQueries) return res.status(404).send('No queries found for this user');

        res.json({ userName: userQueries.userName, queries: userQueries.queries });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add a response to a specific query
router.post('/queries/respond', async (req, res) => {
    const { userId, queryIndex, responseText } = req.body;

    try {
        const queryDoc = await Query.findOne({ userId });
        if (!queryDoc) return res.status(404).json({ success: false, message: 'Query not found' });

        if (!queryDoc.queries[queryIndex]) return res.status(404).json({ success: false, message: 'Invalid query index' });

        // Update response and responseDate
        queryDoc.queries[queryIndex].response = responseText;
        queryDoc.queries[queryIndex].responseDate = new Date();

        await queryDoc.save();

        res.json({ success: true, message: 'Response added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add response' });
    }
});


module.exports = router;
