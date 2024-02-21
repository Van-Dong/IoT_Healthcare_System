const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const keySecret = process.env.KEY_SECRET;

// Check cookie jwt
function authMiddleware(req, res, next) {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, keySecret, async (err, decodedToken) => {
            if (err) {
                // console.log(err.message)
                res.locals.userEmail = null;
                res.locals._id = null;
                if (!['/login', '/signup', '/'].includes(req.url)) {
                    res.redirect('/login');
                } else {
                    next();
                }
            } else {
                // console.log(decodedToken)
                let user = await User.findOne({ _id: decodedToken.id });
                res.locals.userEmail = user.email;
                res.locals._id = user._id;
                res.locals.topic = user.topic;
                // console.log(res.locals.userEmail)
                if (!['/login', '/signup', '/'].includes(req.url)) {
                    next()
                } else {
                    res.redirect('/health');;
                }
            }
        });
    } else {
        res.locals.userEmail = null;
        res.locals._id = null;
        if (!['/login', '/signup', '/'].includes(req.url)) {
            res.redirect('/login');
        } else {
            next();
        }
    }
}

module.exports = authMiddleware;
