#include <Arduino.h>
#ifdef ESP32
#include <WiFi.h>
#include <AsyncTCP.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#endif
#include <ESPAsyncWebServer.h>
AsyncWebServer server(80);
int relayPin = 2; // GPIO2 of ESP8266
const char* ssid = "";
const char* password = "";
const char* PARAM_MESSAGE = "No need to send data.";
void notFound(AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
}
void setup() {
    pinMode(relayPin, OUTPUT);
    digitalWrite(relayPin, LOW);
    Serial.begin(115200);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    if (WiFi.waitForConnectResult() != WL_CONNECTED) {
        Serial.printf("WiFi Failed!\n");
        return;
    }
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/plain", "esp rest service");
    });
    server.on("/on", HTTP_GET, [] (AsyncWebServerRequest *request) {
        String message = "turning relay connected decive on";
            digitalWrite(relayPin, HIGH);
        request->send(200, "text/plain", "Hello, " + message);
    });
    server.on("/off", HTTP_GET, [] (AsyncWebServerRequest *request) {
        String message = "turning relay connected decive off";
            digitalWrite(relayPin, LOW);
        request->send(200, "text/plain", "Hello, " + message);
    });
    server.onNotFound(notFound);
    server.begin();
}
void loop() {
}
