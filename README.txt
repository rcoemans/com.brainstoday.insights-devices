Insights Devices integration for Homey.

Create predefined and custom virtual measurement devices in Homey that receive their data via MQTT.

Features:
- Single MQTT broker connection at app level with automatic reconnection
- Floor Heating Monitor: tracks flow/return temperatures and calculates Delta T automatically
- Ground Level Monitor: monitors ground or water levels with optional alarm thresholds
- NRG-Watch Itho CVE: full integration for Itho Daalderop CVE ventilation units via MQTT
- Awtrix 3: integrates Awtrix 3 LED matrix display for monitoring and notifications
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
- Awtrix 3 (sensor class)
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

DEVICE USAGE INSTRUCTIONS:

1. Floor Heating Monitor:
   How to use:
   - Add device: Devices → Add Device → Insights Devices → Floor Heating Monitor
   - Configure MQTT topic in device settings (e.g., heating/floor1/status)
   - Publish JSON messages: {"flow": 35.2, "return": 29.8}
   - "flow" = supply/inlet temperature in °C
   - "return" = return/outlet temperature in °C
   - Delta T is calculated automatically as flow - return
   
   Capabilities:
   - Flow Temperature (In), Return Temperature (Out), Delta T (Δt)
   
   Flow Cards:
   - Triggers: flow/return/delta temperature changed
   - Conditions: temperature comparisons with operators (lt, lte, gt, gte)

2. Ground Level Monitor:
   How to use:
   - Add device: Devices → Add Device → Insights Devices → Ground Level Monitor
   - Configure settings: MQTT topic (e.g., sensor/crawlSpaceHeight), Unit (cm/m/mm), optional Alarm Threshold
   - Publish single numeric value: 42.5 (no JSON wrapping)
   - Value represents level in configured unit
   
   Capabilities:
   - Ground Level (numeric with configurable unit)
   
   Flow Cards:
   - Triggers: ground level changed
   - Conditions: level comparisons with operators (lt, lte, gt, gte)

3. NRG-Watch Itho CVE:
   How to use:
   - Prerequisites: Itho Daalderop CVE unit, NRG-Watch add-on installed and publishing to MQTT
   - Add device: Devices → Add Device → Insights Devices → NRG-Watch Itho CVE
   - Configure MQTT topics in device settings (defaults: itho/ithostatus, itho/state, itho/LWT, itho/cmd)
   - Device automatically subscribes and parses data
   - Fan preset reflects current state (20=Low, 120=Medium, 220=High)
   - Control via device card or flow cards
   
   Capabilities:
   - Speed State (0-255, shown on card), Fan Speed (rpm), Fan Preset, Ventilation Setpoint (%), Fan Setpoint (rpm)
   - Indoor Temperature & Humidity, Absolute Humidity (ppmw)
   - Supply & Exhaust Temperatures (if available), Error Code, Total Operation Hours, Online Status
   
   Expected MQTT payloads:
   - ithostatus: {"temp":22.9,"hum":39.3,"ppmw":6933,"Ventilation setpoint (%)":30,"Fan setpoint (rpm)":920,"Fan speed (rpm)":923,"Error":0,"Total operation (hours)":27005}
   - state: 120 (single number 0-255)
   
   Flow Cards:
   - Triggers: fan speed/preset/sensor changes, online status changes
   - Conditions: speed/temperature/humidity comparisons, preset checks, online status
   - Actions: set fan speed, set fan speed with timer, set preset, send virtual remote commands, clear queue

4. Awtrix 3:
   How to use:
   - Add device: Devices → Add Device → Insights Devices → Awtrix 3
   - Configure MQTT topics in device settings:
     * Base Topic (e.g., awtrix_55f85c)
     * Status Topic (default: stats)
     * Custom App Topic (default: custom)
     * Notify Topic (default: notify)
   - Device automatically subscribes to <base>/stats for telemetry
   - Use flow cards to send notifications and display custom apps
   
   Capabilities:
   - Temperature, Humidity, Brightness (%), Ambient Light (lux)
   - WiFi Signal (dBm), Battery Level (%), Uptime (seconds)
   - Message Count, Current App, Firmware Version, IP Address, Online Status
   
   Expected MQTT payload (stats):
   - {"bat":100,"type":0,"lux":26,"bri":63,"temp":19,"hum":32,"uptime":577,"wifi_signal":-61,"messages":0,"version":"0.98","app":"","ip_address":"192.168.1.123"}
   
   Flow Cards:
   - Triggers: temperature/humidity/brightness/light/signal/battery/messages/app changed, online status changed
   - Conditions: temperature/humidity comparisons, device online status
   - Actions: show notification, show custom app, remove app, clear display, set brightness
   
   More Information:
   - For detailed Awtrix 3 documentation, visit: https://blueforcer.github.io/awtrix3/#/

5. Custom MQTT Sensor:
   How to use:
   - Add device: Devices → Add Device → Insights Devices → Custom MQTT Sensor
   - Configure MQTT topic and payload type (Single Number / JSON Object / JSON Array)
   - Configure slots in device settings:
     * Number Value 1-4: JSON Path, Display Label, Unit, Decimal Places
     * Text Value 1-2: JSON Path, Display Label (JSON Object only)
     * Calculated Value 1-2: Formula (use n1, n2, n3, n4), Display Label, Unit, Decimal Places
   - Leave JSON Path or Formula empty to disable a slot
   - Capabilities automatically added/removed when settings saved
   
   Available Slots:
   - 4 Number Value slots (for numeric data)
   - 2 Text Value slots (for string data, JSON Object only)
   - 2 Calculated Value slots (formulas using +, -, *, /, parentheses)
   
   Example 1 - Single Number (Ground Level):
   - MQTT Topic: sensor/crawlSpaceHeight
   - Payload Type: Single Number
   - Number Value 1: JSON Path = value (or empty), Label = Ground Level, Unit = cm, Decimals = 0
   - MQTT Payload: 42.5
   
   Example 2 - JSON Object (Itho Last Command):
   - MQTT Topic: itho/lastcmd
   - Payload Type: JSON Object
   - Text Value 1: JSON Path = command, Label = Last Command
   - Number Value 1: JSON Path = timestamp, Label = Timestamp, Decimals = 0
   - MQTT Payload: {"source":"MQTT API","command":"speed:120","timestamp":1774182271}
   
   Example 3 - JSON Object with Calculation:
   - MQTT Topic: heating/status
   - Payload Type: JSON Object
   - Number Value 1: JSON Path = flow, Label = Flow Temp, Unit = °C, Decimals = 1
   - Number Value 2: JSON Path = return, Label = Return Temp, Unit = °C, Decimals = 1
   - Calculated Value 1: Formula = n1 - n2, Label = Delta T, Unit = °C, Decimals = 1
   - MQTT Payload: {"flow":35.2,"return":28.5}
   - Result: Shows Flow Temp (35.2°C), Return Temp (28.5°C), Delta T (6.7°C)
   
   JSON Path formats:
   - Single Number: leave empty or enter "value"
   - JSON Object: key name (e.g., "temp") or nested (e.g., "data.temperature")
   - JSON Array: index number (e.g., "0", "1", "2")
   
   Flow Cards:
   - Triggers: value changed (mapped and calculated)
   - Conditions: value comparisons with operators (lt, lte, gt, gte)

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
