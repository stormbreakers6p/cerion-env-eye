#pragma once

#include <Arduino.h>

struct MetricValue {
  float value = 0.0F;
  bool available = false;

  bool set(float candidate, float minimum, float maximum);
};

struct SensorValues {
  MetricValue temperatureC;
  MetricValue humidityPct;
  MetricValue pressureHpa;
  MetricValue gasResistanceOhm;
  MetricValue iaq;
  MetricValue co2Ppm;
  MetricValue voltageV;
  MetricValue currentA;
  MetricValue powerW;
  MetricValue energyKwh;
  MetricValue frequencyHz;
  MetricValue powerFactor;

  size_t count() const;
  bool hasEnvironment() const;
  bool hasEnergy() const;
};

struct SensorReading {
  char readingId[81] = {};
  char measuredAt[25] = {};
  SensorValues values;
  int32_t wifiRssi = 0;
  bool hasWifiRssi = false;
};

