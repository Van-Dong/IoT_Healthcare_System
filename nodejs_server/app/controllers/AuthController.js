const User = require('../models/User');
const { handleErrors, createToken } = require('../../util/auth');

class AuthController {
    // GET /login
    login_get(req, res, next) {
        res.render('auth/login');
    }

    // POST /login
    async login_post(req, res, next) {
        const { email, password } = req.body;
        try {
            const user = await User.login(email, password);
            const maxAge = 3 * 24 * 60 * 60; // 3 days

            // createToken
            const token = createToken(user._id, maxAge); //tính theo giây
            res.cookie('jwt', token, { maxAge: maxAge * 1000, httpOnly: true }); // Tính theo ms
            res.status(201).json({ id: user._id });
        } catch (err) {
            console.log(err);
            const errors = handleErrors(err);
            res.status(400).json(errors);
        }
    }

    // GET /signup
    signup_get(req, res, next) {
        res.render('auth/signup');
    }

    // POST /signup
    signup_post(req, res, next) {
        const user = new User(req.body);
        const maxAge = 3 * 24 * 60 * 60;
        user.save()
            .then(() => {
                // createToken
                const token = createToken(user._id, maxAge);
                res.cookie('jwt', token, {
                    maxAge: maxAge * 1000,
                    httpOnly: true,
                });
                res.status(201).json({ id: user._id });
            })
            .catch((err) => {
                const errors = handleErrors(err);
                res.status(400).json(errors);
            });
    }

    // GET /logout
    logout_get(req, res, next) {
        res.cookie('jwt', '', { maxAge: 1 });
        res.redirect('/');
    }
}

module.exports = new AuthController();
