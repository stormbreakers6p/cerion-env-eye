#include "WiFiManager.h"

#include <WiFi.h>

#include "Config.h"

namespace {

bool due(uint32_t now, uint32_t target) {
  return static_cast<int32_t>(now - target) >= 0;
}

}  // namespace

void WiFiManager::begin(const char* hostname) {
  retryDelayMs_ = CERION_WIFI_RETRY_INITIAL_MS;
  WiFi.persistent(false);
  WiFi.setHostname(hostname);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(false);
  nextAttemptAt_ = millis();
  Serial.println("[WiFi] Connection manager ready");
}

void WiFiManager::loop() {
  const uint32_t now = millis();
  const wl_status_t status = WiFi.status();

  if (status == WL_CONNECTED) {
    if (!connected_) {
      connected_ = true;
      attemptInProgress_ = false;
      retryDelayMs_ = CERION_WIFI_RETRY_INITIAL_MS;
      Serial.printf("[WiFi] Connected, IP=%s, RSSI=%ld dBm\n", WiFi.localIP().toString().c_str(),
                    static_cast<long>(WiFi.RSSI()));
    }
    return;
  }

  if (connected_) {
    connected_ = false;
    attemptInProgress_ = false;
    Serial.println("[WiFi] Disconnected; sensor collection will continue");
    scheduleRetry(now);
  }

  if (attemptInProgress_) {
    if (now - attemptStartedAt_ >= CERION_WIFI_CONNECT_TIMEOUT_MS) {
      WiFi.disconnect(false, false);
      attemptInProgress_ = false;
      Serial.println("[WiFi] Connection attempt timed out");
      scheduleRetry(now);
    }
    return;
  }

  if (due(now, nextAttemptAt_)) startAttempt(now);
}

bool WiFiManager::connected() const { return connected_ && WiFi.status() == WL_CONNECTED; }

int32_t WiFiManager::rssi() const { return connected() ? WiFi.RSSI() : 0; }

void WiFiManager::startAttempt(uint32_t now) {
  Serial.printf("[WiFi] Connecting to %s...\n", CERION_WIFI_SSID);
  WiFi.begin(CERION_WIFI_SSID, CERION_WIFI_PASSWORD);
  attemptInProgress_ = true;
  attemptStartedAt_ = now;
}

void WiFiManager::scheduleRetry(uint32_t now) {
  nextAttemptAt_ = now + retryDelayMs_;
  Serial.printf("[WiFi] Next attempt in %lu ms\n", static_cast<unsigned long>(retryDelayMs_));
  const uint32_t maximum = CERION_WIFI_RETRY_MAX_MS;
  retryDelayMs_ = retryDelayMs_ >= maximum / 2U ? maximum : retryDelayMs_ * 2U;
}
