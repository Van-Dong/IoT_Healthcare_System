const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_USERNAME);
        console.log('Connected DB successfully!');
    } catch (e) {
        console.error('Error connected:\n- ' + e);
    }
}

module.exports = { connectDB };
