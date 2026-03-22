Insights Devices integration for Homey.

Create predefined and custom virtual measurement devices in Homey that receive their data via MQTT.

Features:
- Single MQTT broker connection at app level with automatic reconnection
- Floor Heating Monitor: tracks flow/return temperatures and calculates Delta T automatically
- Ground Level Monitor: monitors ground or water levels with optional alarm thresholds
- NRG-Watch Itho CVE: full integration for Itho Daalderop CVE ventilation units via MQTT
- Custom MQTT Sensor: flexible device supporting numeric, JSON object, and JSON array payloads with custom mappings and calculated fields
- Comprehensive flow cards: triggers for value changes, conditions with comparison operators (lt, lte, gt, gte), actions for controllable devices
- Insights logging for all measurements
- MQTT broker status monitoring and logging
- Support for TLS/SSL, authentication, custom client IDs, and LWT (Last Will and Testament)
- Fully localized in English and Dutch (Nederlands)

Supported Devices:
- Floor Heating Monitor (sensor class)
- Ground Level Monitor (sensor class)
- NRG-Watch Itho CVE (fan class)
- Custom MQTT Sensor (sensor class)

Setup:
1. Install the app on your Homey
2. Configure MQTT broker settings in app configuration (IP/DNS, port, optional TLS and authentication)
3. Add devices via the standard Homey pairing flow
4. Configure MQTT topics and device-specific settings for each device
5. Devices will automatically subscribe to topics and start receiving data

MQTT Broker Configuration:
- Broker IP address or DNS name
- Port number (default: 1883 for standard, 8883 for TLS)
- Optional TLS/SSL with certificate validation control
- Optional username/password authentication
- Optional custom client ID
- Optional LWT (Last Will and Testament) configuration
- Configurable keepalive interval (default: 60 seconds)

Floor Heating Monitor:
- Monitors flow temperature, return temperature, and automatically calculates Delta T (Δt)
- Expected MQTT payload: JSON object with "flow" and "return" fields
- Example: {"flow": 35.2, "return": 29.8}
- Triggers: flow/return/delta temperature changed
- Conditions: temperature comparisons with operators
- All values logged to Insights

Ground Level Monitor:
- Tracks ground or water level from a single numeric MQTT payload
- Expected MQTT payload: numeric value (e.g., 18.4)
- Optional alarm threshold configuration
- Triggers: ground level changed
- Conditions: level comparisons with operators
- Values logged to Insights

NRG-Watch Itho CVE:
- Full integration for Itho Daalderop CVE ventilation units
- Reads status from multiple MQTT topics (ithostatus, lastcmd, state, LWT, remotesinfo)
- Publishes commands to control fan speed, presets, and modes
- Capabilities: fan speed, preset, humidity, temperature, air quality, supply/exhaust temps, override timer, fault codes
- Triggers: fan speed/preset/sensor changes, device online status, fault codes
- Conditions: speed/temperature/humidity comparisons, preset checks, online status
- Actions: set fan speed (with optional timer), send preset commands, virtual remote commands, clear queue
- Default MQTT topics configurable in device settings
- Supports both simple and advanced Itho CVE payloads

Custom MQTT Sensor:
- Advanced flexible device for custom MQTT use cases
- Supports three payload types: single numeric value, JSON object, JSON array
- JSON object mapping with dot notation (e.g., "heating.flow", "sensors.temp")
- JSON array mapping with index notation (e.g., "0", "1", "2")
- Multiple source value mappings per device
- Calculated fields with formulas using +, -, *, /, and parentheses
- Example calculations: delta_t = flow - return, avg_temp = (flow + return) / 2
- Configurable capability types: measure_temperature, measure_humidity, measure_pressure, measure_level, measure_air_quality, measure_co2, measure_percentage, measure_power, meter_power, custom_numeric
- Per-field Insights logging configuration
- Per-field visibility configuration
- Triggers: mapped/calculated value changed
- Conditions: value comparisons with operators

Flow Cards:
- App-level triggers: broker connected, broker disconnected
- App-level conditions: broker is/is not connected
- Device-specific triggers for all value changes
- Device-specific conditions with comparison operators (lt, lte, gt, gte) and inversion support (!{{is|is not}})
- Device-specific actions for controllable devices (NRG-Watch Itho CVE)

Comparison Operators:
- lt = lower than
- lte = lower than or equal
- gt = greater than
- gte = greater than or equal

Known Limitations:
- Single MQTT broker per app instance
- No MQTT discovery or auto-discovery
- Custom sensor calculations limited to basic arithmetic (no functions like min/max/avg)
- Calculated fields cannot reference other calculated fields in first version
- Device settings changes may require manual reconnection

Security:
- MQTT credentials stored securely in Homey settings
- TLS/SSL support for encrypted connections
- Certificate validation can be disabled for self-signed certificates
- All communication stays within local network
- No cloud or external connections

Technical Details:
- Protocol: MQTT v3.1.1 / v5.0
- SDK: Homey SDK v3
- Dependencies: mqtt (MQTT client), expr-eval (formula parser)
- Languages: English (en), Nederlands (nl)
