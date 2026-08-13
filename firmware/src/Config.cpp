#include "Config.h"

#include <cstring>

namespace {

bool isPlaceholder(const char* value) {
  return value == nullptr || value[0] == '\0' || strstr(value, "REPLACE_WITH_") != nullptr;
}

}  // namespace

namespace Config {

bool validate() {
  bool valid = true;
  if (CERION_USING_EXAMPLE_CONFIG) {
    Serial.println("[Config] include/local_config.h is missing; copy config.example.h first");
    valid = false;
  }
  if (isPlaceholder(CERION_WIFI_SSID) || isPlaceholder(CERION_WIFI_PASSWORD)) {
    Serial.println("[Config] Wi-Fi credentials are not configured");
    valid = false;
  }
  if (strcmp(CERION_FIREBASE_PROJECT_ID, "cerion-platform") != 0) {
    Serial.println("[Config] Refusing a Firebase project other than cerion-platform");
    valid = false;
  }
  if (strncmp(CERION_INGEST_URL, "https://", 8) != 0 ||
      strstr(CERION_INGEST_URL, "cerion-platform.cloudfunctions.net/ingestReading") == nullptr) {
    Serial.println("[Config] CERION_INGEST_URL is not the expected HTTPS Function");
    valid = false;
  }
  if (isPlaceholder(CERION_DEVICE_ID) || isPlaceholder(CERION_DEVICE_KEY)) {
    Serial.println("[Config] CERION device credentials are not configured");
    valid = false;
  }
  if (CERION_UPLOAD_INTERVAL_MS < 1000UL) {
    Serial.println("[Config] Upload interval must be at least 1000 ms");
    valid = false;
  }
  if (!CERION_ENABLE_BME688 && !CERION_ENABLE_PZEM004T) {
    Serial.println("[Config] At least one physical sensor must be enabled");
    valid = false;
  }
  return valid;
}

void printSummary() {
  Serial.printf("[Config] Firebase project: %s\n", CERION_FIREBASE_PROJECT_ID);
  Serial.printf("[Config] CERION device ID: %s\n", CERION_DEVICE_ID);
  Serial.printf("[Config] Upload interval: %lu ms\n",
                static_cast<unsigned long>(CERION_UPLOAD_INTERVAL_MS));
  Serial.printf("[Config] Sensors: BME688=%s, PZEM-004T=%s\n",
                CERION_ENABLE_BME688 ? "enabled" : "disabled",
                CERION_ENABLE_PZEM004T ? "enabled" : "disabled");
  Serial.println("[Config] Secrets loaded (values are intentionally not printed)");
}

}  // namespace Config
