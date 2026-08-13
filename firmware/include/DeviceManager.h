#pragma once

#include <Arduino.h>
#include <Preferences.h>

class DeviceManager {
 public:
  void begin();
  void loop(bool networkConnected);
  const char* hardwareId() const;
  void nextReadingId(char* output, size_t outputSize);
  bool timeSynchronized() const;
  bool formatTimestamp(char* output, size_t outputSize) const;

 private:
  Preferences preferences_;
  char hardwareId_[32] = {};
  uint32_t bootCounter_ = 0;
  uint32_t bootNonce_ = 0;
  uint32_t sequence_ = 0;
  bool ntpRequested_ = false;
  bool timeReadyLogged_ = false;
};

