Create predefined and custom virtual measurement devices that receive their data via MQTT.

Features:
- Single MQTT broker connection at app level with automatic reconnection
- Floor Heating Monitor: tracks flow/return temperatures and calculates Delta T automatically
- Ground Level Monitor: monitors ground or water levels
- NRG-Watch Itho CVE: integration for Itho Daalderop CVE ventilation units via MQTT
- Awtrix 3: integrates Awtrix 3 LED matrix display for monitoring and notifications
- Custom MQTT Sensor: flexible device supporting numeric, JSON object, and JSON array payloads with custom mappings and calculated fields
- Generic MQTT client: trigger on any MQTT topic and publish messages with custom QoS and retain settings
- Insights logging for all measurements
- Support for TLS/SSL, authentication, custom client IDs, and LWT

Supported Devices:
- Floor Heating Monitor
- Ground Level Monitor
- NRG-Watch Itho CVE
- Awtrix 3
- Custom MQTT Sensor

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

Each device type has specific MQTT topic requirements and payload formats. Configure topics in device settings after pairing.

Logging & Diagnostics:
- View application logs in app settings under "Device Logs"
- Filter logs by source: All, App, MQTT, Itho CVE
- Copy logs to clipboard for troubleshooting
- Clear logs when no longer needed

For detailed documentation visit:
- README.md in the app repository
- Awtrix 3: https://blueforcer.github.io/awtrix3/#/
- NRG.Watch: https://www.nrgwatch.nl/
