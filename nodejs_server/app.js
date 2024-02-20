const express = require('express');
const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');


// customer module
const { connectDB } = require('./config/db');
const route = require('./routes');
const authMiddleware = require('./app/middlewares/AuthMiddleware');

const app = express();
const port = 3000;

//static file
app.use(express.static('public'));
app.use(cookieParser()); //convert cookie to object js
app.use(express.json()); // convert json to object js
app.use(
    // convert form encoded to object js
    express.urlencoded({
        extended: true,
    }),
);

// Customer middleware
app.use(authMiddleware);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Connect database
connectDB();




// set routes
route(app);

// route home
app.get('/', (req, res, next) => {
    res.render('home');
});
app.post('/', (req, res, next) => {
    res.send('Gui thanh cong!');
});

app.get('/secret', (req, res, next) => {
    res.render('secret');
});

// Create server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
