#pragma once

#include <Arduino.h>

#include "Config.h"
#include "SensorData.h"

#if CERION_ENABLE_BME688
#include <Adafruit_BME680.h>
#endif

#if CERION_ENABLE_PZEM004T
#include <PZEM004Tv30.h>
#endif

class SensorManager {
 public:
  SensorManager();
  void begin();
  bool read(SensorValues& values);

 private:
#if CERION_ENABLE_BME688
  Adafruit_BME680 bme_;
  bool bmeReady_ = false;
#endif

#if CERION_ENABLE_PZEM004T
  PZEM004Tv30 pzem_;
#endif
};

