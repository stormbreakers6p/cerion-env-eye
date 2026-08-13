#include "ReadingBuffer.h"

bool ReadingBuffer::push(const SensorReading& reading) {
  bool retainedEverything = true;
  if (count_ == CERION_OFFLINE_BUFFER_CAPACITY) {
    head_ = (head_ + 1U) % CERION_OFFLINE_BUFFER_CAPACITY;
    --count_;
    retainedEverything = false;
  }
  const size_t tail = (head_ + count_) % CERION_OFFLINE_BUFFER_CAPACITY;
  rows_[tail] = reading;
  ++count_;
  return retainedEverything;
}

const SensorReading& ReadingBuffer::at(size_t offset) const {
  return rows_[(head_ + offset) % CERION_OFFLINE_BUFFER_CAPACITY];
}

void ReadingBuffer::discard(size_t amount) {
  if (amount >= count_) {
    head_ = 0;
    count_ = 0;
    return;
  }
  head_ = (head_ + amount) % CERION_OFFLINE_BUFFER_CAPACITY;
  count_ -= amount;
}

size_t ReadingBuffer::size() const { return count_; }

bool ReadingBuffer::empty() const { return count_ == 0; }

