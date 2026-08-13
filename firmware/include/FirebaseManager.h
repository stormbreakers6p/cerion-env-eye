#pragma once

#include <Arduino.h>

#include "ReadingBuffer.h"

class FirebaseManager {
 public:
  void begin();
  bool shouldAttempt(uint32_t now) const;
  bool upload(const ReadingBuffer& readings, size_t& sentCount);

 private:
  void recordSuccess();
  void recordFailure(uint32_t now);

  uint32_t nextAttemptAt_ = 0;
  uint32_t retryDelayMs_ = 0;
};

