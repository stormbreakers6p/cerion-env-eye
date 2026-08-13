#pragma once

#include <Arduino.h>

class WiFiManager {
 public:
  void begin(const char* hostname);
  void loop();
  bool connected() const;
  int32_t rssi() const;

 private:
  void startAttempt(uint32_t now);
  void scheduleRetry(uint32_t now);

  bool connected_ = false;
  bool attemptInProgress_ = false;
  uint32_t attemptStartedAt_ = 0;
  uint32_t nextAttemptAt_ = 0;
  uint32_t retryDelayMs_ = 0;
};

