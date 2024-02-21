const jwt = require('jsonwebtoken');
require('dotenv').config();

// handle auth errors
function handleErrors(err) {
    // console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // Incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
        return errors;
    }

    // Incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
        return errors;
    }

    // Handle duplicate error
    if (err.code === 11000) {
        errors.email = 'That email is already registered';
        return errors;
    }

    // Handle validate error
    // console.log("err: ", err)
    Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
    });

    return errors;
}

// Create token
function createToken(id, maxAge) {
    const keySecret = process.env.KEY_SECRET;
    return jwt.sign({ id }, keySecret, {
        expiresIn: maxAge,
    });
}

module.exports = { createToken, handleErrors };
