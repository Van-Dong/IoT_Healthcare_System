const express = require('express');
const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');
const mqtt = require('mqtt');

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


// MQTT Broker
var options = { clientId: 'ESP32', port: 1883, keepalive: 60 };
var client = mqtt.connect('mqtt://localhost', options)

client.on('connect', function () {
    //Subscribe đến topic sensor/update để nhận dữ liệu cảm biến
    client.subscribe('esp32_01/HeartRate', function (err) {
        console.log("Subscribed to esp32_01/HeartRate topic");
        if (err) { console.log(err); }
    })
})

//
client.on('message', function (topic, message) {
    //Nhận dữ liệu và lưu vào biến msg_str
    var msg_str = message.toString();
    //In ra console để debug
    console.log("[Topic arrived] " + topic);
    console.log("[Message arrived] " + msg_str);
    var x = Number.parseInt(msg_str)
    console.log(x)

    if (topic == "esp32_01/HeartRate") {
        //Xử lý dữ liệu, chạy mô hình machine learning 
        //Lưu trữ vào MySQL
        // INSERT_SENSOR_DATA(temperature, humidity);
    }
})


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
