# Insights Devices

[![Homey App](https://img.shields.io/badge/Homey-App%20Store-00A94F?logo=homey)](https://homey.app/)
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
| **Custom MQTT Sensor** | Flexible device for custom MQTT payloads with mapping and calculations |

## Requirements

- MQTT broker accessible on your local network
- MQTT broker connection details (IP/hostname, port, optional credentials)
- Devices or systems publishing MQTT messages

## Installation

### Via Homey App Store

Search for **"Insights Devices"** in the Homey App Store.

### Via CLI (development)

```bash
npm install
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

## Device Details

### Floor Heating Monitor

Monitors underfloor heating performance by tracking flow and return temperatures.

**Capabilities:**
- Flow Temperature (In)
- Return Temperature (Out)
- Delta T (Δt) - automatically calculated

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

### Ground Level Monitor

Tracks ground or water level using direct numeric measurements.

**Capabilities:**
- Ground Level (cm)
- Optional alarm threshold

**MQTT Payload Example:**
```
18.4
```

**Flow Cards:**
- Triggers: Ground level changed
- Conditions: Level comparisons (lt, lte, gt, gte)

### NRG-Watch Itho CVE

Integrates Itho Daalderop CVE ventilation units through the NRG-Watch MQTT add-on.

**Capabilities:**
- Fan Speed & Preset
- Temperature & Humidity sensors
- Air Quality monitoring
- Supply/Exhaust temperatures
- Status monitoring & control

**MQTT Topics (default):**
- Status: `itho/ithostatus`
- Commands: `itho/cmd`
- State: `itho/state`
- LWT: `itho/LWT`

**Flow Cards:**
- Triggers: Fan speed/preset/sensor changes, status changes
- Conditions: Speed/temperature/humidity comparisons, preset checks
- Actions: Set fan speed, send preset commands, control modes

### Custom MQTT Sensor

Advanced flexible device for custom MQTT payloads.

**Features:**
- Support for numeric, JSON object, and JSON array payloads
- Multiple source value mappings
- Calculated fields with formulas (e.g., `delta = flow - return`)
- Configurable Insights logging
- Custom capability selection

**Supported Payload Types:**
- Single numeric value
- JSON object with dot notation (e.g., `heating.flow`)
- JSON array with index notation (e.g., `0`, `1`)

**Calculation Engine:**
- Operators: `+`, `-`, `*`, `/`, parentheses
- Example: `avg_temp = (flow + return) / 2`

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

This Homey app was created by **Robert Coemans** with assistance from AI-powered development tools.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
