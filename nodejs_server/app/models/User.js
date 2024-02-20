const mongoose = require('mongoose');
const { isEmail } = require('validator'); // this is a function
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const user = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Please enter an email'],
            unique: true,
            lowercase: true, //Tự động chuyển thành lowercase nếu tồn tại chữ in hoa
            validate: [isEmail, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please enter an password'],
            minLength: [6, 'Minimum password length is 6 characters'],
        },
        topic: {
            type: String,
            minLength: [6, 'Minimum topic length is 6 characters']
        }
    },
    {
        timestamps: true,
    },
);

// Hash password before doc saved to db
user.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Check account login
user.statics.login = async function (email, password) {
    const user_login = await this.findOne({ email });
    if (user_login) {
        const auth = await bcrypt.compare(password, user_login.password);
        if (auth) {
            return user_login;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

module.exports = mongoose.model('User', user);
