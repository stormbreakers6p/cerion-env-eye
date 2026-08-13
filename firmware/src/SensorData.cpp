#include "SensorData.h"

#include <cmath>

bool MetricValue::set(float candidate, float minimum, float maximum) {
  if (!std::isfinite(candidate) || candidate < minimum || candidate > maximum) {
    available = false;
    return false;
  }
  value = candidate;
  available = true;
  return true;
}

size_t SensorValues::count() const {
  const MetricValue* metrics[] = {
      &temperatureC, &humidityPct, &pressureHpa, &gasResistanceOhm, &iaq, &co2Ppm,
      &voltageV,     &currentA,   &powerW,      &energyKwh,         &frequencyHz,
      &powerFactor,
  };
  size_t result = 0;
  for (const MetricValue* metric : metrics) {
    if (metric->available) ++result;
  }
  return result;
}

bool SensorValues::hasEnvironment() const {
  return temperatureC.available || humidityPct.available || pressureHpa.available ||
         gasResistanceOhm.available || iaq.available || co2Ppm.available;
}

bool SensorValues::hasEnergy() const {
  return voltageV.available || currentA.available || powerW.available || energyKwh.available ||
         frequencyHz.available || powerFactor.available;
}

