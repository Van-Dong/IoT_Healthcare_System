#include <WiFi.h>
#include <PubSubClient.h>
#include <PulseSensorPlayground.h>
#define PULSE_PIN 32  // PulseSensor PURPLE WIRE connected to ANALOG PIN 0
#define THRESHOLD 515 // Determine which Signal to "count as a beat" and which to ignore.

// Wifi authentication
const char *ssid = "realme 5";
const char *password = "12356789";

// MQTT server
const char *mqtt_server = "192.168.43.224";
const char *topic = "esp32_01/HeartRate";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Pulse sensor PIN
PulseSensorPlayground pulseSensor; // Creates an instance of the PulseSensorPlayground object called "pulseSensor"

// variable for time ellapsed
long lastMsg = 0;

void setup()
{
    // Initialize comunication  38400 bit/s
    Serial.begin(38400);

    // Configure the PulseSensor object
    pulseSensor.analogInput(PULSE_PIN);
    pulseSensor.setThreshold(THRESHOLD);
    // Double-check the "pulseSensor" object was created and "began" seeing a signal.
    if (pulseSensor.begin())
    {
        Serial.println("We created a pulseSensor Object !"); // This prints one time at Arduino power-up,  or on Arduino reset.
    }

    // Setup wifi
    setup_wifi();

    // initialize server
    client.setServer(mqtt_server, mqtt_port);
}

void setup_wifi()
{
    delay(100);
    Serial.println("###");
    Serial.print("Connecting to ");
    Serial.println(ssid);

    // connect to Wifi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("Wifi connected");
    Serial.print("IP address is: ");
    Serial.println(WiFi.localIP());
}

void reconnect()
{
    while (!client.connected())
    {
        Serial.print("Attempting MQTT connection...");
        // random client ID, you can put whatever you want.
        if (client.connect("ESP32Client"))
        {
            Serial.println("connected");
        }
        else
        {
            Serial.print("failed, rc=");
            // if not connected, print the error code
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void loop()
{
    // put your main code here, to run repeatedly:
    if (!client.connected())
    {
        // reconnect to MQTT broker if not connected
        reconnect();
    }
    // maintain connection with mqqt server
    client.loop();
    long now = millis();
    // send message after 2s
    if (now - lastMsg > 2000)
    {
        lastMsg = now;
        // Get Heart Beat (per minute)
        int heartRate = pulseSensor.getBeatsPerMinute();
        char tempString[10];
        Serial.print("Heart Beat: ");
        Serial.println(heartRate);
        // Publish heart rate value to MQTT topic named esp32_01/HeartRate
        if (heartRate > 35 && heartRate < 300)
        {
            sprintf(tempString, "%d", heartRate);
            client.publish(topic, tempString);
        }
    }
}
