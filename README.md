# Insights Devices

[![Homey App](https://img.shields.io/badge/Homey-App%20Store-00A94F?logo=homey)](https://homey.app/en-nl/app/com.brainstoday.insights-devices/Insights-Devices/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

Homey app for creating **predefined and custom virtual measurement devices** that receive their data via **MQTT**. This app provides a single MQTT broker connection at app level and allows you to create multiple MQTT-driven devices with different capabilities.

## Features

- **Single MQTT broker connection** at app level
- **Multiple device types** with predefined templates
- **Custom MQTT sensor** for flexible advanced use cases
- **Automatic calculated values** (e.g., Delta T for floor heating)
- **Insights logging** for all measurements
- **Flow cards** for triggers, conditions, and actions
- **Fully localized** in English and Dutch

## Supported Devices

| Device | Description |
|--------|-------------|
| **Floor Heating Monitor** | Monitors underfloor heating with flow/return temperatures and Delta T calculation |
| **Ground Level Monitor** | Tracks ground or water level for crawl spaces, tanks, or flood-prone areas |
| **NRG-Watch Itho CVE** | Integrates Itho Daalderop CVE ventilation units via NRG-Watch MQTT add-on |
| **Awtrix 3** | Integrates Awtrix 3 LED matrix display for monitoring and notifications |
| **Custom MQTT Sensor** | Flexible device for custom MQTT payloads with mapping and calculations |

## Requirements

- MQTT broker accessible on your local network
- MQTT broker connection details (IP/hostname, port, optional credentials)
- Devices or systems publishing MQTT messages

## Installation

### Via Homey App Store

Search for **"Insights Devices"** in the Homey App Store.

### Via CLI (sideloading / development)

```bash
npm install -g homey
git clone https://github.com/rcoemans/com.brainstoday.insights-devices
cd com.brainstoday.insights-devices
npm install
npm run build
homey login
homey app install
```

## Setup

### 1. Configure MQTT Broker

1. Open the app settings in Homey
2. Navigate to **Configure** → **MQTT Client**
3. Enter your MQTT broker details:
   - Broker IP address or DNS name
   - Port (default: 1883)
   - Optional: TLS, authentication, LWT settings
4. Save settings

The app will automatically connect to the broker and maintain the connection.

### 2. Add Devices

Add devices through the standard Homey pairing flow:

1. Go to **Devices** → **Add Device**
2. Select **Insights Devices**
3. Choose your device type
4. Configure MQTT topic and device-specific settings
5. Complete pairing

## Device Details & Usage Instructions

### Floor Heating Monitor

Monitors underfloor heating performance by tracking flow and return temperatures.

**Capabilities:**
- Flow Temperature (In)
- Return Temperature (Out)
- Delta T (Δt) - automatically calculated

**How to Use:**

1. **Add the device:**
   - Go to Devices → Add Device → Insights Devices
   - Select "Floor Heating Monitor"
   - Click "Add Device"

2. **Configure MQTT topic:**
   - Open device settings
   - Set MQTT Topic (e.g., `heating/floor1/status`)
   - Save settings

3. **Publish MQTT data:**
   - Your system must publish JSON messages to the configured topic
   - Required format: `{"flow": 35.2, "return": 29.8}`
   - `flow` = supply/inlet temperature in °C
   - `return` = return/outlet temperature in °C
   - Delta T is calculated automatically as `flow - return`

**MQTT Payload Example:**
```json
{
  "flow": 35.2,
  "return": 29.8
}
```

**Flow Cards:**
- Triggers: Flow/Return/Delta T temperature changed
- Conditions: Temperature comparisons (lt, lte, gt, gte)

---

### Ground Level Monitor

Tracks ground or water level using direct numeric measurements.

**Capabilities:**
- Ground Level (numeric value with configurable unit)
- Optional alarm threshold

**How to Use:**

1. **Add the device:**
   - Go to Devices → Add Device → Insights Devices
   - Select "Ground Level Monitor"
   - Click "Add Device"

2. **Configure settings:**
   - Open device settings
   - Set MQTT Topic (e.g., `sensor/crawlSpaceHeight`)
   - Set Unit (e.g., `cm`, `m`, `mm`)
   - Optional: Set Alarm Threshold (0 = disabled)
   - Save settings

3. **Publish MQTT data:**
   - Your system must publish a single numeric value to the configured topic
   - Example: `42.5` (representing 42.5 cm)
   - No JSON wrapping needed - just the raw number

**MQTT Payload Example:**
```
18.4
```

**Flow Cards:**
- Triggers: Ground level changed
- Conditions: Level comparisons (lt, lte, gt, gte)

---

### NRG-Watch Itho CVE

Integrates Itho Daalderop CVE ventilation units through the NRG-Watch MQTT add-on.

**Capabilities:**
- Speed State (0-255) - shown on device card
- Fan Speed (rpm)
- Fan Preset (Low/Medium/High/Timer1/Timer2/Timer3)
- Ventilation Setpoint (%)
- Fan Setpoint (rpm)
- Indoor Temperature & Humidity
- Absolute Humidity (ppmw)
- Supply & Exhaust Temperatures (if available)
- Error Code
- Total Operation Hours
- Online Status

**How to Use:**

1. **Prerequisites:**
   - Itho Daalderop CVE ventilation unit
   - NRG-Watch add-on installed and configured
   - NRG-Watch publishing to MQTT broker

2. **Add the device:**
   - Go to Devices → Add Device → Insights Devices
   - Select "NRG-Watch Itho CVE"
   - Click "Add Device"

3. **Configure MQTT topics:**
   - Open device settings
   - Configure the following topics (defaults shown):
     - Status Topic: `itho/ithostatus`
     - Last Command Topic: `itho/lastcmd`
     - State Topic: `itho/state`
     - LWT Topic: `itho/LWT`
     - Command Topic: `itho/cmd`
   - Save settings

4. **Device will automatically:**
   - Subscribe to status, state, and LWT topics
   - Parse incoming data and update capabilities
   - Reflect current fan preset based on speed state (20=Low, 120=Medium, 220=High)
   - Track all sensor values and operation hours

5. **Control the fan:**
   - Use the device card to change presets
   - Use flow cards to set specific speeds or send commands
   - All commands are published to the command topic

**Expected MQTT Payload (ithostatus):**
```json
{
  "temp": 22.9,
  "hum": 39.3,
  "ppmw": 6933,
  "Ventilation setpoint (%)": 30,
  "Fan setpoint (rpm)": 920,
  "Fan speed (rpm)": 923,
  "Error": 0,
  "Total operation (hours)": 27005
}
```

**Expected MQTT Payload (state):**
```
120
```
(Single number 0-255 representing fan speed state)

**Flow Cards:**
- Triggers: Fan speed/preset/sensor changes, online status changes
- Conditions: Speed/temperature/humidity comparisons, preset checks, online status
- Actions: Set fan speed, set fan speed with timer, set preset, send virtual remote commands, clear command queue

---

### Awtrix 3

Integrates Awtrix 3 LED matrix display for monitoring device telemetry and displaying notifications and custom apps.

**Capabilities:**
- Temperature
- Humidity
- Brightness (%)
- Ambient Light (lux)
- WiFi Signal (dBm)
- Battery Level (%)
- Uptime (seconds)
- Message Count
- Current App
- Firmware Version
- IP Address
- Online Status

**How to Use:**

1. **Add the device:**
   - Go to Devices → Add Device → Insights Devices
   - Select "Awtrix 3"
   - Click "Add Device"

2. **Configure MQTT topics:**
   - Open device settings
   - Set Base Topic (e.g., `awtrix_55f85c`)
   - Optionally customize:
     - Status Topic (default: `stats`)
     - Custom App Topic (default: `custom`)
     - Notify Topic (default: `notify`)
   - Save settings

3. **Monitor device status:**
   - The device automatically subscribes to `<base>/stats`
   - All sensor values are updated from incoming MQTT messages
   - Use Insights to track temperature, humidity, brightness, etc.

4. **Send notifications and apps:**
   - Use flow cards to display messages on the Awtrix
   - Show notifications with custom text, colors, and icons
   - Create custom apps with persistent displays
   - Control brightness and clear the screen

**Expected MQTT Payload (stats):**
```json
{
  "bat": 100,
  "type": 0,
  "lux": 26,
  "bri": 63,
  "temp": 19,
  "hum": 32,
  "uptime": 577,
  "wifi_signal": -61,
  "messages": 0,
  "version": "0.98",
  "app": "",
  "ip_address": "192.168.1.123"
}
```

**Flow Cards:**
- Triggers: Temperature/humidity/brightness/light/signal/battery/messages/app changed, online status changed
- Conditions: Temperature/humidity comparisons, device online status
- Actions: Show notification, show custom app, remove app, clear display, set brightness

**More Information:**
For detailed Awtrix 3 documentation, visit: https://blueforcer.github.io/awtrix3/#/

---

### Custom MQTT Sensor

Advanced flexible device for custom MQTT payloads with configurable value mappings and calculations.

**Available Slots:**
- **4 Number Value slots** - for numeric data
- **2 Text Value slots** - for string data  
- **2 Calculated Value slots** - for formulas

**How to Use:**

1. **Add the device:**
   - Go to Devices → Add Device → Insights Devices
   - Select "Custom MQTT Sensor"
   - Click "Add Device"

2. **Configure MQTT settings:**
   - Open device settings
   - Set MQTT Topic
   - Select Payload Type:
     - **Single Number**: payload is just a number (e.g., `42.5`)
     - **JSON Object**: payload is JSON (e.g., `{"temp":22.9}`)
     - **JSON Array**: payload is array (e.g., `[22.9, 39.3]`)

3. **Configure Number Value slots (1-4):**
   - For each slot you want to use:
     - **JSON Path**: 
       - Single Number: leave empty or enter `value`
       - JSON Object: enter key name (e.g., `temp` or `data.temperature` for nested)
       - JSON Array: enter index (e.g., `0`, `1`)
     - **Display Label**: Name shown on device card (e.g., `Ground Level`)
     - **Unit**: Measurement unit (e.g., `cm`, `°C`, `%`)
     - **Decimal Places**: 0-5 decimal places to show
   - Leave JSON Path empty to disable a slot

4. **Configure Text Value slots (1-2):**
   - Only works with JSON Object payload type
   - **JSON Path**: Key name in JSON (e.g., `command`, `source`)
   - **Display Label**: Name shown on device card
   - Leave JSON Path empty to disable a slot

5. **Configure Calculated Value slots (1-2):**
   - **Formula**: Use `n1`, `n2`, `n3`, `n4` to reference Number Values
   - Supports: `+`, `-`, `*`, `/`, parentheses
   - Examples: `n1 - n2`, `(n1 + n2) / 2`
   - **Display Label**: Name shown on device card
   - **Unit**: Measurement unit
   - **Decimal Places**: 0-5 decimal places
   - Leave Formula empty to disable a slot

6. **Save settings:**
   - Capabilities are automatically added/removed based on configuration
   - Device starts receiving and processing MQTT messages immediately

**Example 1: Single Number (Ground Level)**

Settings:
- MQTT Topic: `sensor/crawlSpaceHeight`
- Payload Type: `Single Number`
- Number Value 1:
  - JSON Path: `value` (or leave empty)
  - Display Label: `Ground Level`
  - Unit: `cm`
  - Decimal Places: `0`

MQTT Payload: `42.5`

**Example 2: JSON Object (Itho Last Command)**

Settings:
- MQTT Topic: `itho/lastcmd`
- Payload Type: `JSON Object`
- Text Value 1:
  - JSON Path: `command`
  - Display Label: `Last Command`
- Number Value 1:
  - JSON Path: `timestamp`
  - Display Label: `Timestamp`
  - Decimal Places: `0`

MQTT Payload:
```json
{
  "source": "MQTT API",
  "command": "speed:120",
  "timestamp": 1774182271
}
```

**Example 3: JSON Object with Calculation (Heating System)**

Settings:
- MQTT Topic: `heating/status`
- Payload Type: `JSON Object`
- Number Value 1:
  - JSON Path: `flow`
  - Display Label: `Flow Temp`
  - Unit: `°C`
  - Decimal Places: `1`
- Number Value 2:
  - JSON Path: `return`
  - Display Label: `Return Temp`
  - Unit: `°C`
  - Decimal Places: `1`
- Calculated Value 1:
  - Formula: `n1 - n2`
  - Display Label: `Delta T`
  - Unit: `°C`
  - Decimal Places: `1`

MQTT Payload:
```json
{
  "flow": 35.2,
  "return": 28.5
}
```

Result: Device shows Flow Temp (35.2°C), Return Temp (28.5°C), and Delta T (6.7°C)

**Flow Cards:**
- Triggers: Value changed (for both mapped and calculated values)
- Conditions: Value comparisons (lt, lte, gt, gte)

## MQTT Broker Configuration

The app supports comprehensive MQTT broker configuration:

- **Connection:** IP/DNS, port, TLS/SSL
- **Authentication:** Username/password
- **Client ID:** Auto-generated or custom
- **LWT (Last Will and Testament):** Optional
- **Keepalive:** Configurable interval
- **Certificate validation:** Can be disabled for self-signed certificates

## Flow Cards

### App-Level Triggers

- MQTT broker connected
- MQTT broker disconnected

### App-Level Conditions

- MQTT broker is/is not connected
- MQTT broker is/is not disconnected

### Device-Specific Cards

Each device type provides:
- **Triggers** when values change
- **Conditions** for value comparisons with inversion support
- **Actions** for controllable devices (e.g., NRG-Watch Itho CVE)

## Comparison Operators

All condition cards use consistent operators:

- `lt` = lower than
- `lte` = lower than or equal
- `gt` = greater than
- `gte` = greater than or equal

## Logging & Diagnostics

The app maintains an MQTT broker log accessible through the app settings:

- Connection events
- Subscription changes
- Message parsing errors
- Command publish results

## Known Limitations

- Single MQTT broker per app instance
- No MQTT discovery/auto-discovery
- Custom sensor calculations limited to basic arithmetic
- Device settings changes require manual topic resubscription

## Security Considerations

- MQTT credentials are stored securely in Homey
- TLS/SSL supported for encrypted connections
- All communication stays within your local network
- No cloud or external connections

## Technical Details

- **Protocol:** MQTT v3.1.1 / v5.0
- **SDK:** Homey SDK v3
- **Languages:** English (en), Nederlands (nl)
- **Dependencies:** mqtt, expr-eval

## Support & Issues

- **Homepage:** [GitHub Repository](https://github.com/rcoemans/com.brainstoday.insights-devices)
- **Issues:** [GitHub Issues](https://github.com/rcoemans/com.brainstoday.insights-devices/issues)
- **Support:** [GitHub Discussions](https://github.com/rcoemans/com.brainstoday.insights-devices/issues)

## Credits

This app is a co-creation between **Robert Coemans** and **Claude Opus** (Anthropic), built using **[Windsurf](https://windsurf.com)** — an AI-powered IDE for collaborative software development.

If you like this, consider [buying me a coffee](https://buymeacoffee.com/kabxpqqg7z).

Pull requests and issue reports are welcome on [GitHub](https://github.com/rcoemans/com.brainstoday.insights-devices/issues).

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
