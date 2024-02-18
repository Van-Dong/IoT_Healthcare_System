Cách chạy Iot Healthcare System
1. ESP32
- Thêm vào BOARDS MANAGER: ESP32 (của Espressif Systems)
- Thêm thư viện PulseSensorPlayground

2. Chạy Model Server
- python3 ./server_python/run_model.py

3. Chạy Mosquitto Broker & chạy MongoDB server

4. Chạy Nodejs Server
- npm start