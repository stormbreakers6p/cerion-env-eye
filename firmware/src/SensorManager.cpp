#include "SensorManager.h"

#include <Wire.h>

SensorManager::SensorManager()
#if CERION_ENABLE_PZEM004T
    : pzem_(Serial2, CERION_PZEM_RX_PIN, CERION_PZEM_TX_PIN)
#endif
{
}

void SensorManager::begin() {
  Serial.println("[Sensor] Initializing sensor layer...");

#if CERION_ENABLE_BME688
  Wire.begin(CERION_I2C_SDA_PIN, CERION_I2C_SCL_PIN);
  bmeReady_ = bme_.begin(CERION_BME688_I2C_ADDRESS);
  if (!bmeReady_) {
    const uint8_t alternate = CERION_BME688_I2C_ADDRESS == 0x76 ? 0x77 : 0x76;
    bmeReady_ = bme_.begin(alternate);
  }
  if (bmeReady_) {
    bme_.setTemperatureOversampling(BME680_OS_8X);
    bme_.setHumidityOversampling(BME680_OS_2X);
    bme_.setPressureOversampling(BME680_OS_4X);
    bme_.setIIRFilterSize(BME680_FILTER_SIZE_3);
    bme_.setGasHeater(320, 150);
    Serial.println("[Sensor] BME688 ready (raw gas resistance; no synthetic IAQ/CO2)");
  } else {
    Serial.println("[Sensor] BME688 initialization failed; its fields will be omitted");
  }
#endif

#if CERION_ENABLE_PZEM004T
  Serial.printf("[Sensor] PZEM-004T enabled on RX=%d TX=%d\n", CERION_PZEM_RX_PIN,
                CERION_PZEM_TX_PIN);
#endif
}

bool SensorManager::read(SensorValues& values) {
  values = SensorValues{};
  Serial.println("[Sensor] Reading sensors...");

#if CERION_ENABLE_BME688
  if (bmeReady_) {
    if (!bme_.performReading()) {
      Serial.println("[Sensor] BME688 read failed");
    } else {
      if (!values.temperatureC.set(bme_.temperature, -40.0F, 85.0F))
        Serial.println("[Sensor] Rejected invalid BME688 temperature");
      if (!values.humidityPct.set(bme_.humidity, 0.0F, 100.0F))
        Serial.println("[Sensor] Rejected invalid BME688 humidity");
      if (!values.pressureHpa.set(bme_.pressure / 100.0F, 300.0F, 1200.0F))
        Serial.println("[Sensor] Rejected invalid BME688 pressure");
      if (!values.gasResistanceOhm.set(static_cast<float>(bme_.gas_resistance), 0.0F,
                                       100000000.0F))
        Serial.println("[Sensor] Rejected invalid BME688 gas resistance");
    }
  }
#endif

#if CERION_ENABLE_PZEM004T
  const size_t countBeforePzem = values.count();
  values.voltageV.set(pzem_.voltage(), 0.0F, 400.0F);
  values.currentA.set(pzem_.current(), 0.0F, 100.0F);
  values.powerW.set(pzem_.power(), 0.0F, 50000.0F);
  values.energyKwh.set(pzem_.energy(), 0.0F, 1000000000.0F);
  values.frequencyHz.set(pzem_.frequency(), 0.0F, 100.0F);
  values.powerFactor.set(pzem_.pf(), 0.0F, 1.2F);
  if (values.count() == countBeforePzem) {
    Serial.println("[Sensor] PZEM-004T read failed; energy fields will be omitted");
  }
#endif

  if (values.count() == 0) {
    Serial.println("[Sensor] No valid measurements; upload skipped");
    return false;
  }
  Serial.printf("[Sensor] %u validated field(s) ready\n", static_cast<unsigned int>(values.count()));
  return true;
}
