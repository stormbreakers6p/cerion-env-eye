#include <Arduino.h>

#include "Config.h"
#include "DeviceManager.h"
#include "FirebaseManager.h"
#include "ReadingBuffer.h"
#include "SensorManager.h"
#include "WiFiManager.h"

namespace {

DeviceManager deviceManager;
WiFiManager wifiManager;
SensorManager sensorManager;
FirebaseManager firebaseManager;
ReadingBuffer offlineBuffer;

bool configurationValid = false;
uint32_t nextSampleAt = 0;

bool due(uint32_t now, uint32_t target) {
  return static_cast<int32_t>(now - target) >= 0;
}

void collectReading() {
  SensorValues values;
  if (!sensorManager.read(values)) return;

  SensorReading reading;
  deviceManager.nextReadingId(reading.readingId, sizeof(reading.readingId));
  if (!deviceManager.formatTimestamp(reading.measuredAt, sizeof(reading.measuredAt))) {
    Serial.println("[Time] Measurement queued without local time; backend will use receive time");
  }
  reading.values = values;
  reading.hasWifiRssi = wifiManager.connected();
  if (reading.hasWifiRssi) reading.wifiRssi = wifiManager.rssi();

  if (!offlineBuffer.push(reading)) {
    Serial.println("[Buffer] Full; oldest reading dropped to keep the newest 60");
  }
  Serial.printf("[Buffer] Reading %s queued (%u/%u)\n", reading.readingId,
                static_cast<unsigned int>(offlineBuffer.size()),
                static_cast<unsigned int>(CERION_OFFLINE_BUFFER_CAPACITY));
}

}  // namespace

void setup() {
  Serial.begin(115200);
  delay(250);
  Serial.println();
  Serial.println("[Device] CERION Env Eye firmware starting");

  configurationValid = Config::validate();
  Config::printSummary();
  if (!configurationValid) {
    Serial.println("[Config] Startup stopped until valid local configuration is supplied");
    return;
  }

  deviceManager.begin();
  sensorManager.begin();
  firebaseManager.begin();
  wifiManager.begin(deviceManager.hardwareId());
  nextSampleAt = millis();
}

void loop() {
  if (!configurationValid) {
    delay(1000);
    return;
  }

  const uint32_t now = millis();
  wifiManager.loop();
  deviceManager.loop(wifiManager.connected());

  if (due(now, nextSampleAt)) {
    collectReading();
    nextSampleAt += CERION_UPLOAD_INTERVAL_MS;
    if (due(now, nextSampleAt)) nextSampleAt = now + CERION_UPLOAD_INTERVAL_MS;
  }

  if (!offlineBuffer.empty() && wifiManager.connected() && deviceManager.timeSynchronized() &&
      firebaseManager.shouldAttempt(now)) {
    size_t sentCount = 0;
    if (firebaseManager.upload(offlineBuffer, sentCount)) {
      offlineBuffer.discard(sentCount);
      Serial.println("[Device] Backend communication succeeded; lastSeen/status clocks updated");
    }
  }

  delay(10);
}

