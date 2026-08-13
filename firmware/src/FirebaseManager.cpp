#include "FirebaseManager.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#include "Config.h"
#include "SensorData.h"

extern const uint8_t gtsRootsPemStart[] asm("_binary_data_gts_roots_pem_start");

namespace {

bool due(uint32_t now, uint32_t target) {
  return static_cast<int32_t>(now - target) >= 0;
}

void addMetric(JsonObject values, const char* key, const MetricValue& metric) {
  if (metric.available) values[key] = metric.value;
}

void writeValues(JsonObject values, const SensorValues& source) {
  addMetric(values, "temperatureC", source.temperatureC);
  addMetric(values, "humidityPct", source.humidityPct);
  addMetric(values, "pressureHpa", source.pressureHpa);
  addMetric(values, "gasResistanceOhm", source.gasResistanceOhm);
  addMetric(values, "iaq", source.iaq);
  addMetric(values, "co2Ppm", source.co2Ppm);
  addMetric(values, "voltageV", source.voltageV);
  addMetric(values, "currentA", source.currentA);
  addMetric(values, "powerW", source.powerW);
  addMetric(values, "energyKwh", source.energyKwh);
  addMetric(values, "frequencyHz", source.frequencyHz);
  addMetric(values, "powerFactor", source.powerFactor);
}

void writeReading(JsonObject object, const SensorReading& reading) {
  object["readingId"] = reading.readingId;
  if (reading.measuredAt[0] != '\0') object["measuredAt"] = reading.measuredAt;
  object["firmwareVersion"] = CERION_FIRMWARE_VERSION;
  if (reading.hasWifiRssi) object["wifiRssi"] = reading.wifiRssi;
  writeValues(object["values"].to<JsonObject>(), reading.values);
}

String serverError(const String& responseBody) {
  JsonDocument response;
  if (deserializeJson(response, responseBody) == DeserializationError::Ok &&
      response["error"].is<const char*>()) {
    return String(response["error"].as<const char*>());
  }
  return "unparseable-response";
}

}  // namespace

void FirebaseManager::begin() {
  retryDelayMs_ = CERION_BACKEND_RETRY_INITIAL_MS;
  Serial.println("[Firebase] Secure CERION ingestion client initialized");
  Serial.println("[Firebase] Authentication mode: per-device key over verified HTTPS");
}

bool FirebaseManager::shouldAttempt(uint32_t now) const { return due(now, nextAttemptAt_); }

bool FirebaseManager::upload(const ReadingBuffer& readings, size_t& sentCount) {
  sentCount = 0;
  if (readings.empty()) return true;

  JsonDocument payload;
  payload["deviceId"] = CERION_DEVICE_ID;
  if (readings.size() == 1U) {
    writeReading(payload.as<JsonObject>(), readings.at(0));
  } else {
    JsonArray rows = payload["readings"].to<JsonArray>();
    for (size_t index = 0; index < readings.size(); ++index) {
      JsonObject row = rows.add<JsonObject>();
      writeReading(row, readings.at(index));
    }
  }

  String body;
  serializeJson(payload, body);
  WiFiClientSecure secureClient;
  secureClient.setCACert(reinterpret_cast<const char*>(gtsRootsPemStart));
  HTTPClient http;
  http.setConnectTimeout(CERION_HTTP_TIMEOUT_MS);
  http.setTimeout(CERION_HTTP_TIMEOUT_MS);
  http.setReuse(false);
  if (!http.begin(secureClient, CERION_INGEST_URL)) {
    Serial.println("[Firebase] Could not initialize HTTPS request");
    recordFailure(millis());
    return false;
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-cerion-device-key", CERION_DEVICE_KEY);

  Serial.printf("[Firebase] Uploading %u reading(s)...\n",
                static_cast<unsigned int>(readings.size()));
  const int status = http.POST(body);
  const String responseBody = status > 0 ? http.getString() : String();
  http.end();

  if (status == 200 || status == 202) {
    JsonDocument response;
    const bool parsed = deserializeJson(response, responseBody) == DeserializationError::Ok;
    const bool accepted = parsed && (response["accepted"] | false);
    if (accepted) {
      sentCount = readings.size();
      recordSuccess();
      Serial.printf("[Firebase] Authenticated; upload successful (HTTP %d)\n", status);
      return true;
    }
    Serial.println("[Firebase] Backend response did not confirm acceptance");
  } else if (status == 401) {
    Serial.printf("[Firebase] Authentication failed: %s\n", serverError(responseBody).c_str());
  } else if (status == 429) {
    Serial.println("[Firebase] Rate limited; retrying with backoff");
  } else if (status > 0) {
    Serial.printf("[Firebase] Firestore ingestion failed (HTTP %d): %s\n", status,
                  serverError(responseBody).c_str());
  } else {
    Serial.printf("[Firebase] HTTPS connection failed: %s\n",
                  HTTPClient::errorToString(status).c_str());
  }

  recordFailure(millis());
  return false;
}

void FirebaseManager::recordSuccess() {
  retryDelayMs_ = CERION_BACKEND_RETRY_INITIAL_MS;
  nextAttemptAt_ = 0;
}

void FirebaseManager::recordFailure(uint32_t now) {
  nextAttemptAt_ = now + retryDelayMs_;
  Serial.printf("[Firebase] Next upload attempt in %lu ms\n",
                static_cast<unsigned long>(retryDelayMs_));
  const uint32_t maximum = CERION_BACKEND_RETRY_MAX_MS;
  retryDelayMs_ = retryDelayMs_ >= maximum / 2U ? maximum : retryDelayMs_ * 2U;
}
