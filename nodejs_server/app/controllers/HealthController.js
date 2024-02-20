const Health = require('../models/Health');
const mqtt = require('mqtt');
const { WebSocketServer } = require('ws');
const axios = require('axios');
var sockserver;
var data_test;


function processHealth(obj) {
    // data_test1: 52 - M - TA - 118  - 186 - 0 - 190 - N
    // age, sex, chestpaintype, restingbp (sysbp), cholesterol, FastingBS (glucose: 1 if > 120), MaxHR, exercise_angina

    // data_test2: [1, 43, 1, 43, 0, 0, 0, 0, 226, 115, 85.5, 27.57, 75, 75]
    // sex, age, currentSmoke (cigsperday), cigsperday, bp_meds, prevalent_stroke, prevalent_hyp, 
    //  diabetes, cholesterol, sysbp, diabp, bmi (height, weight), heartrate, glucose

    let fastingBS = obj.glucose > 120 ? 1 : 0;
    let currentSmoke = obj.cigsperday > 0 ? 1 : 0;
    let BMI = obj.weight / (obj.height * obj.height);

    var x_test1 = [obj.age, obj.sex, obj.chestpaintype, obj.sysbp, obj.cholesterol, fastingBS, 155, obj.exercise_angina] //maxHR: index 6
    var x_test2 = [obj.sex, obj.age, currentSmoke, obj.cigsperday, obj.bp_meds, obj.prevalent_stroke, obj.prevalent_hyp,
    obj.diabetes, obj.cholesterol, obj.sysbp, obj.diabp, BMI, 70, obj.glucose]   // heartRate: index 12
    return [x_test1, x_test2];
}


class HealthController {
    constructor() {  // Constructor
        sockserver = new WebSocketServer({ port: 1111 })
        console.log("Created Sockserver!")
    }

    // GET /signup
    async health_get(req, res, next) {
        let health;
        try {
            // const health = await Health.find({ user: res.locals._id }).sort({createdAt: -1}).limit(1); // array
            health = await Health.findOne({ user: res.locals._id }).sort({ createdAt: -1 });
            data_test = processHealth(health)
            // console.log(health)
        } catch (error) {
            console.log(error.message)
        }
        res.render('health', { data: JSON.stringify(health) })

        /////////////////////////
        // MQTT Broker Server Info
        var options = { clientId: 'Server_App', port: 1883, keepalive: 60 };
        var client = mqtt.connect('mqtt://localhost', options)

        client.subscribe('esp32_01/HeartRate', function (err) {
            console.log("Subscribed to esp32_01/HeartRate topic");
            if (err) { console.log(err); }
        })

        sockserver.on('connection', async ws => {
            console.log('New client connected!')
            ws.on('close', () => console.log('A client has disconnected!'))
            ws.onerror = function () {
                console.log('websocket error')
            }
            client.on('message', async function (topic, message) {

                //Nhận dữ liệu từ mqtt broker
                var msg_str = message.toString();
                //In ra console để debug
                console.log("[Topic arrived] " + topic);
                console.log("[Message arrived] " + msg_str);
                var x = Number.parseInt(msg_str)

                // chạy model machine learning 
                // HRmax = 220 - độ tuổi
                // console.log(data_test)
                let predict_result;
                let model_index = x > 160 ? 1 : 2;

                
                let url = 'http://localhost:8000/api/model' + model_index;
                const response = await axios.post(url, {
                    data_test: data_test[model_index - 1]
                })
                    .then(function (response) {
                        predict_result = response.data.predict;
                    })
                    .catch(function (error) {
                        console.log(error);
                        predict_result = [0, 0];
                    });
                predict_result.push(x)
                console.log(predict_result)

                // Gửi HeartRate, kết quả dự đoán cho browser    
                ws.send(JSON.stringify(predict_result)) // heart ở index 2

                if (topic == "esp32_01/HeartRate") {
                    //Xử lý dữ liệu, chạy mô hình machine learning 
                }
            })
        })

    }

    async health_post(req, res, next) {
        const newHealth = new Health(req.body);
        newHealth.user = res.locals._id;
        newHealth.save()
            .then(() => {
                console.log("Add info health success!");
                res.status(201).json("Created success!")
                data_test = processHealth(newHealth)
            })
            .catch((err) => {
                console.log(err)
                res.status(400).json("Have error!");
            })
    }

}

module.exports = new HealthController();