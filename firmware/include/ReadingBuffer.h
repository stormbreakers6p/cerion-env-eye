#pragma once

#include <Arduino.h>

#include "Config.h"
#include "SensorData.h"

class ReadingBuffer {
 public:
  static_assert(CERION_OFFLINE_BUFFER_CAPACITY > 0,
                "CERION_OFFLINE_BUFFER_CAPACITY must be positive");
  static_assert(CERION_OFFLINE_BUFFER_CAPACITY <= 60,
                "The CERION ingestion endpoint accepts at most 60 readings");

  // Returns false when the oldest row had to be dropped to retain this row.
  bool push(const SensorReading& reading);
  const SensorReading& at(size_t offset) const;
  void discard(size_t amount);
  size_t size() const;
  bool empty() const;

 private:
  SensorReading rows_[CERION_OFFLINE_BUFFER_CAPACITY];
  size_t head_ = 0;
  size_t count_ = 0;
};

