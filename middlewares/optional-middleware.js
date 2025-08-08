const { User } = require('../models/usersModel');

module.exports = async function (req, res, next) {
    try {
        const email = req.session?.user?.email;

        if (email) {
            const user = await User.findOne({ email });

            if (user) {
                req.session.user = user;
                res.locals.user = user;
                req.user = user;
            }
        }

        next(); // Always continue to next middleware/route
    } catch (error) {
        console.error('Optional user middleware error:', error.message);
        next(); // Still continue even if error happens
    }
};
