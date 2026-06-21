#include <Arduino.h>
#include <ArduinoJson.h>
#include <FastLED.h>

// Definición de las dimensiones de la matriz y el pin
#define LED_PIN 4 // GPIO4 (Pin 26 en la placa de desarrollo)
#define MATRIX_WIDTH 32
#define MATRIX_HEIGHT 8
#define NUM_LEDS (MATRIX_WIDTH * MATRIX_HEIGHT) // 256 LEDs

#define LED_TYPE WS2812B
#define COLOR_ORDER GRB

// Tamaño del buffer para líneas serial entrantes
#define SERIAL_BUF_SIZE 256

CRGB leds[NUM_LEDS];

// ── Parámetros controlables por serial ───────────────────────────────────
uint8_t paramBrightness = 48;    // 0-255
uint8_t paramSpeed      = 30;   // 1-100  (divisor de millis)
uint8_t paramSaturation = 240;  // 0-255
uint8_t paramHueOffset  = 0;    // 0-255

// ── Buffer de lectura serial ─────────────────────────────────────────────
char serialBuf[SERIAL_BUF_SIZE];
uint16_t serialBufIdx = 0;

// ── Función para enviar estado actual como JSON ──────────────────────────
void sendStatus()
{
  JsonDocument doc;
  doc["type"] = "led-params";
  doc["params"]["brightness"] = paramBrightness;
  doc["params"]["speed"]      = paramSpeed;
  doc["params"]["saturation"] = paramSaturation;
  doc["params"]["hueOffset"]  = paramHueOffset;
  serializeJson(doc, Serial);
  Serial.println();
}

// ── Procesar un comando JSON recibido por serial ─────────────────────────
void processCommand(const char *json)
{
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, json);

  if (err)
  {
    Serial.print("{\"error\":\"");
    Serial.print(err.c_str());
    Serial.println("\"}");
    return;
  }

  const char *cmd = doc["cmd"] | "set";

  if (strcmp(cmd, "get") == 0)
  {
    sendStatus();
    return;
  }

  // Si viene en el formato {"type": "led-params", "params": {...}}
  // o directo {"brightness": ...}
  JsonVariant params = doc["params"];
  if (params.isNull())
  {
    params = doc.as<JsonVariant>();
  }

  if (!params["brightness"].isNull())
    paramBrightness = params["brightness"].as<uint8_t>();

  if (!params["speed"].isNull())
    paramSpeed = constrain(params["speed"].as<uint8_t>(), 1, 100);

  if (!params["saturation"].isNull())
    paramSaturation = params["saturation"].as<uint8_t>();

  if (!params["hueOffset"].isNull())
    paramHueOffset = params["hueOffset"].as<uint8_t>();

  FastLED.setBrightness(paramBrightness);

  // Responder con el estado actualizado
  sendStatus();
}

// ── Función auxiliar para obtener el índice de un pixel ───────────────────
// Distribución "progressive" (fila por fila de izquierda a derecha)
// Si tu matriz física es de tipo "zigzag", descomenta la sección indicada.
uint16_t getPixelIndex(uint8_t x, uint8_t y)
{
  // Distribución progresiva estándar (Fila por Fila):
  return (y * MATRIX_WIDTH) + x;

  // Distribución en Zigzag:
  if (y % 2 == 0)
  {
    // Fila par: de izquierda a derecha
    return (y * MATRIX_WIDTH) + x;
  }
  else
  {
    // Fila impar: de derecha a izquierda
    return (y * MATRIX_WIDTH) + (MATRIX_WIDTH - 1 - x);
  }
}

void setup()
{
  // Inicializar comunicación serial
  Serial.begin(115200);

  // Retardo de seguridad para encendido
  delay(1000);

  // Configuración de la librería FastLED
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS)
      .setCorrection(TypicalLEDStrip);

  FastLED.setBrightness(paramBrightness);

  Serial.println("{\"status\":\"ready\"}");
}

void loop()
{
  // ── Leer datos del serial (sin bloquear) ───────────────────────────────
  while (Serial.available() > 0)
  {
    char c = Serial.read();

    if (c == '\n' || c == '\r')
    {
      if (serialBufIdx > 0)
      {
        serialBuf[serialBufIdx] = '\0';
        processCommand(serialBuf);
        serialBufIdx = 0;
      }
    }
    else if (serialBufIdx < SERIAL_BUF_SIZE - 1)
    {
      serialBuf[serialBufIdx++] = c;
    }
  }

  // ── Generar efecto plasma 2D ───────────────────────────────────────────
  uint32_t ms = millis();

  // El factor de velocidad se calcula a partir de paramSpeed
  // speed=1 → muy lento,  speed=100 → muy rápido
  float speedFactor = paramSpeed / 30.0f;

  for (uint8_t y = 0; y < MATRIX_HEIGHT; y++)
  {
    for (uint8_t x = 0; x < MATRIX_WIDTH; x++)
    {
      // Cálculo de ondas senoidales con velocidad dinámica
      uint8_t hue1 = sin8((x * 8) + (uint16_t)(ms * speedFactor / 15));
      uint8_t hue2 = sin8((y * 32) - (uint16_t)(ms * speedFactor / 20));
      uint8_t finalHue = ((hue1 + hue2) / 2) + paramHueOffset;

      uint16_t pixelIdx = getPixelIndex(x, y);

      // Asignar color en formato HSV con saturación dinámica
      leds[pixelIdx] = CHSV(finalHue, paramSaturation, 255);
    }
  }

  // Enviar colores actualizados a los LEDs
  FastLED.show();

  // Regular los FPS (~60 FPS)
  FastLED.delay(16);
}