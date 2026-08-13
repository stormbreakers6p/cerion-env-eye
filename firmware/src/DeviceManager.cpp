#include "DeviceManager.h"

#include <WiFi.h>
#include <esp_system.h>
#include <time.h>

#include "Config.h"

namespace {

constexpr time_t kMinimumValidEpoch = 1704067200;  // 2024-01-01T00:00:00Z

}  // namespace

void DeviceManager::begin() {
  const uint64_t chipId = ESP.getEfuseMac();
  snprintf(hardwareId_, sizeof(hardwareId_), "CERION-%04X%08X",
           static_cast<unsigned int>((chipId >> 32U) & 0xFFFFU),
           static_cast<unsigned int>(chipId & 0xFFFFFFFFU));

  if (preferences_.begin("cerion", false)) {
    bootCounter_ = preferences_.getULong("boot", 0) + 1U;
    preferences_.putULong("boot", bootCounter_);
    preferences_.end();
  } else {
    bootCounter_ = 1U;
    Serial.println("[Device] NVS unavailable; using a volatile boot counter");
  }
  bootNonce_ = esp_random();
  Serial.printf("[Device] Hardware ID: %s\n", hardwareId_);
  Serial.printf("[Device] Configured CERION ID: %s\n", CERION_DEVICE_ID);
}

void DeviceManager::loop(bool networkConnected) {
  if (networkConnected && !ntpRequested_) {
    configTime(0, 0, CERION_NTP_SERVER_1, CERION_NTP_SERVER_2, CERION_NTP_SERVER_3);
    ntpRequested_ = true;
    Serial.println("[Time] NTP synchronization requested");
  }
  if (!timeReadyLogged_ && timeSynchronized()) {
    timeReadyLogged_ = true;
    Serial.println("[Time] UTC clock synchronized; secure uploads enabled");
  }
}

const char* DeviceManager::hardwareId() const { return hardwareId_; }

void DeviceManager::nextReadingId(char* output, size_t outputSize) {
  ++sequence_;
  snprintf(output, outputSize, "b%lu-r%08lx-s%08lu", static_cast<unsigned long>(bootCounter_),
           static_cast<unsigned long>(bootNonce_), static_cast<unsigned long>(sequence_));
}

bool DeviceManager::timeSynchronized() const { return time(nullptr) >= kMinimumValidEpoch; }

bool DeviceManager::formatTimestamp(char* output, size_t outputSize) const {
  if (!timeSynchronized() || outputSize < 21U) return false;
  const time_t now = time(nullptr);
  struct tm utcTime {};
  gmtime_r(&now, &utcTime);
  return strftime(output, outputSize, "%Y-%m-%dT%H:%M:%SZ", &utcTime) > 0;
}

