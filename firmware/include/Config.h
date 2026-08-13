#pragma once

#include <Arduino.h>

#if __has_include("local_config.h")
#include "local_config.h"
#define CERION_USING_EXAMPLE_CONFIG 0
#else
#include "config.example.h"
#define CERION_USING_EXAMPLE_CONFIG 1
#endif

namespace Config {

bool validate();
void printSummary();

}  // namespace Config
