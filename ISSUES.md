Although the app works fine, there is a small issue with the 'NRG-Watch Itho CVE' device. I have tried the app on multiple Homeys and sometimes I get device capabilities and sometimes not. When looking into another Homey app which among others can connect to the Itho CVE using MQTT (see: ***nl.nrgwatch.itho*** below), I see this always works thus is more robust and even has an additional device capability. I want you to analyze this codebase, see what is done differently for connecting to the Itho CVE using MQTT and apply the learnings so this Homey app becomes as robust as the '***nl.nrgwatch.itho***' app.

Another difference is that the '***nl.nrgwatch.itho***' app has the functionality where you can go to the app, the go into 'Settings' and here you can find all the logs. Please analyze the code and apply the same functionality for this app so that user can go into the app settings and see the logs there as well as the ability to copy the logs to the clipboard.

To recap:

1. Anyalyze '***nl.nrgwatch.itho***'
2. Apply the MQTT learnings for the Itho CVE' to this app.
3. Create new functionality on app level which allows customer to see the logs and copy the logs to the clipboard.

***nl.nrgwatch.itho***

Directory structure:
└── rcoemans-nl.nrgwatch.itho/
    ├── README.md
    ├── README.nl.txt
    ├── README.txt
    ├── api.ts
    ├── app.ts
    ├── CODE_OF_CONDUCT.md
    ├── CONTRIBUTING.md
    ├── LICENSE
    ├── package.json
    ├── tsconfig.json
    ├── .eslintrc.json
    ├── .homeychangelog.json
    ├── drivers/
    │   ├── itho-api/
    │   │   ├── device.ts
    │   │   ├── driver.compose.json
    │   │   └── driver.ts
    │   └── itho-mqtt/
    │       ├── device.ts
    │       ├── driver.compose.json
    │       └── driver.ts
    ├── lib/
    │   ├── AppLogger.ts
    │   ├── IthoCommandMapper.ts
    │   ├── IthoMqttClient.ts
    │   └── IthoStateNormalizer.ts
    ├── locales/
    │   ├── en.json
    │   └── nl.json
    ├── settings/
    │   └── index.html
    └── .homeycompose/
        ├── app.json
        ├── capabilities/
        │   ├── itho_absolute_humidity.json
        │   ├── itho_error_code.json
        │   ├── itho_exhaust_temperature.json
        │   ├── itho_fan_preset.json
        │   ├── itho_fan_setpoint_rpm.json
        │   ├── itho_fan_speed_raw.json
        │   ├── itho_fan_speed_rpm.json
        │   ├── itho_online.json
        │   ├── itho_startup_counter.json
        │   ├── itho_supply_temperature.json
        │   ├── itho_total_operation.json
        │   └── itho_ventilation_setpoint.json
        └── flow/
            ├── actions/
            │   ├── clear_queue.json
            │   ├── mqtt_publish_advanced.json
            │   ├── mqtt_publish_simple.json
            │   ├── send_virtual_remote.json
            │   ├── set_fan_preset.json
            │   ├── set_fan_speed.json
            │   ├── set_speed_with_timer.json
            │   └── start_timer.json
            ├── conditions/
            │   ├── device_has_error.json
            │   ├── device_is_online.json
            │   ├── fan_preset_is.json
            │   ├── fan_speed_above.json
            │   ├── fan_speed_below.json
            │   ├── fan_speed_equal.json
            │   ├── humidity_above.json
            │   ├── humidity_below.json
            │   ├── mqtt_broker_connected.json
            │   ├── temperature_above.json
            │   └── temperature_below.json
            └── triggers/
                ├── command_failed.json
                ├── command_sent_success.json
                ├── device_offline.json
                ├── device_online.json
                ├── error_state_changed.json
                ├── fan_preset_changed.json
                ├── fan_speed_changed.json
                ├── humidity_changed.json
                ├── mqtt_broker_connected.json
                ├── mqtt_broker_disconnected.json
                ├── mqtt_message_received.json
                └── temperature_changed.json


Files Content:

================================================
FILE: README.md
================================================
# NRG.Watch Itho add-on

[![Homey App](https://img.shields.io/badge/Homey-App%20Store-00A94F?logo=homey)](https://homey.app/en-nl/app/nl.nrgwatch.itho/NRG.Watch-Itho-add-on/)
[![Homey App Test](https://img.shields.io/badge/Homey-Test%20App-FFA500?logo=homey)](https://homey.app/en-nl/app/nl.nrgwatch.itho/NRG.Watch-Itho-add-on/test/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

> App has not yet been submitted for certification but is available via [test](https://homey.app/en-nl/app/nl.nrgwatch.itho/NRG.Watch-Itho-add-on/test/) link.

Homey app for **Itho ventilation systems** via the **NRG.Watch Itho add-on**. Control and monitor your Itho ventilation through **MQTT** or **HTTP API** directly from Homey.

## Disclaimer

> **This is an unofficial, community-developed integration.**
>
> - Not affiliated with, endorsed by, or supported by **Itho** or **NRG.Watch**.
> - The NRG.Watch Itho add-on may change or discontinue these interfaces at any time without notice — app functionality may break as a result.
> - Use at your own risk. The developers accept no liability for incorrect readings or unintended ventilation control changes.

## Supported Devices

This app supports Itho ventilation systems through the NRG.Watch Itho add-on with two connection methods:

| Connection Type | Description | Real-time Updates |
|----------------|-------------|-------------------|
| **MQTT** | Connect via MQTT broker | ✅ Yes (event-driven) |
| **HTTP API** | Connect via Web API | ⏱️ Polling-based |

## Requirements

- Itho ventilation system with **NRG.Watch Itho add-on** installed
- For MQTT: Access to an **MQTT broker** (can be the same device running the add-on)
- For API: Network access to the add-on's **HTTP API endpoint**
- Homey Pro (2016-2019, 2023) or Homey Cloud

## Installation

### Via Homey App Store

Search for **"NRG.Watch Itho add-on"** in the Homey App Store.

### Via CLI (sideloading / development)

```bash
npm install -g homey
git clone https://github.com/rcoemans/nl.nrgwatch.itho
cd nl.nrgwatch.itho
npm install
homey login
homey app install
```

## Setup

### Adding an MQTT Device

1. Install the app on your Homey
2. Add a new device: **NRG.Watch Itho add-on → NRG.Watch Itho (MQTT)**
3. Configure MQTT connection settings:
   - **Broker**: IP address or DNS name of your MQTT broker
   - **Port**: Default 1883 (or 8883 for TLS)
   - **Username/Password**: If required by your broker
   - **Base Topic**: Default `itho` (the app automatically derives all subtopics)
4. Optionally configure TLS and Last Will and Testament (LWT)
5. Save settings and the device will connect automatically

### Adding an API Device

1. Install the app on your Homey
2. Add a new device: **NRG.Watch Itho add-on → NRG.Watch Itho (API)**
3. Configure API connection settings:
   - **IP address or DNS**: Address of the NRG.Watch Itho add-on
   - **Username/Password**: If required by the add-on
   - **Poll interval**: How often to poll for updates (default 15 seconds)
4. Save settings and the device will start polling automatically

## Device Capabilities

Both MQTT and API devices expose the same capabilities:

| Capability | Description | Icon | Read/Write |
|-----------|-------------|------|------------|
| Online | Whether the device is online | On/off | Read only |
| Fan Preset | Current fan preset (depends on device type) | - | Read + Write |
| Speed State (0-255) | Raw speed state value | Speedometer | Read only |
| Indoor Temperature | Indoor temperature | - | Read only |
| Humidity | Indoor humidity | - | Read only |
| Absolute Humidity | Absolute humidity (g/m³) | Water drop | Read only |
| Supply Temperature | Supply air temperature | Thermometer | Read only |
| Exhaust Temperature | Exhaust air temperature | Thermometer | Read only |
| Fan Speed | Current fan speed in RPM | Speedometer | Read only |
| Fan Setpoint | Target fan speed in RPM | Speedometer | Read only |
| Ventilation Setpoint | Ventilation setpoint percentage | Speedometer | Read only |
| Error Code | Current error code (0 = no error) | Alarm triangle | Read only |
| Total Operation Hours | Cumulative operation hours | Bar chart | Read only |
| Startup Counter | Number of startups | Counter | Read only |

> **Note:** Supply Temperature, Exhaust Temperature, and Absolute Humidity are only shown when the Itho device reports these values.

## Flow Cards

### Triggers (WHEN…)

| Trigger | Description |
|---------|-------------|
| The Itho device came online | Fires when the device becomes reachable |
| The Itho device went offline | Fires when the device becomes unreachable |
| The fan speed changed | Fires when the fan speed changes |
| The fan preset changed | Fires when the preset changes |
| The temperature changed | Fires when temperature changes |
| The humidity changed | Fires when humidity changes |
| The error state changed | Fires when the error code changes |
| A command was sent successfully | Fires after successful command execution |
| A command failed | Fires when a command fails |
| **MQTT only:** MQTT broker connected | Fires when MQTT broker connects |
| **MQTT only:** MQTT broker disconnected | Fires when MQTT broker disconnects |
| **MQTT only:** Message received on topic | Fires when a message is received on specified topic (supports wildcards) |

### Conditions (AND…)

All condition cards support **inversion** (is/is not):

| Condition | Description |
|-----------|-------------|
| The Itho device !{{is\|is not}} online | Checks if device is available |
| The fan speed !{{is\|is not}} [[speed]] | Checks if fan speed equals value |
| The fan speed !{{is\|is not}} above [[speed]] | Checks if fan speed is above value |
| The fan speed !{{is\|is not}} below [[speed]] | Checks if fan speed is below value |
| The fan preset !{{is\|is not}} [[preset]] | Checks if preset matches |
| The temperature !{{is\|is not}} above [[temperature]] °C | Checks temperature threshold |
| The temperature !{{is\|is not}} below [[temperature]] °C | Checks temperature threshold |
| The humidity !{{is\|is not}} above [[humidity]] % | Checks humidity threshold |
| The humidity !{{is\|is not}} below [[humidity]] % | Checks humidity threshold |
| The Itho device !{{has\|does not have}} an error | Checks for error state |
| **MQTT only:** MQTT broker !{{is\|is not}} connected | Checks MQTT connection status |

### Actions (THEN…)

| Action | Description |
|--------|-------------|
| Set the fan speed to [[speed]] | Sets raw fan speed (0-255) |
| Set the fan preset to [[preset]] | Sets fan preset (away, low, medium, high, etc.) |
| Start a timer for [[seconds]] seconds | Starts a timer |
| Set the fan speed to [[speed]] for [[seconds]] seconds | Sets speed with timer |
| Clear queued timers and commands | Clears the command queue |
| Send virtual remote command [[command]] | Emulates a virtual remote |
| **MQTT only:** Send [[message]] on topic [[topic]] | Publishes MQTT message (QoS 0) |
| **MQTT only:** Send [[message]] on topic [[topic]] with QoS [[qos]] and retain [[retain]] | Publishes MQTT message with custom settings |

## MQTT Topics

The MQTT device automatically derives all topics from the configured **base topic**:

| Purpose | Derived Topic | Direction |
|---------|---------------|-----------|
| Status updates | `<base>/ithostatus` | Subscribe |
| Current speed | `<base>/state` | Subscribe |
| Last command | `<base>/lastcmd` | Subscribe |
| Last Will | `<base>/lwt` | Subscribe |
| Commands | `<base>/cmd` | Publish |

**Example:** With base topic `itho`, the app subscribes to `itho/ithostatus`, `itho/state`, etc.

## API Endpoints

The API device uses these endpoints internally:

| Purpose | Endpoint |
|---------|----------|
| Full status | `/api.html?get=ithostatus` |
| Current speed | `/api.html?get=currentspeed` |
| Send command | `/api.html?command=<preset>` |
| Set speed | `/api.html?speed=<value>` |
| Set timer | `/api.html?timer=<seconds>` |

Authentication parameters are added automatically if configured.

## Use Case Examples

### Automatic ventilation based on humidity

```
WHEN humidity changed
AND humidity is above 70%
THEN set the fan preset to high
```

### Return to low speed after timer

```
WHEN the fan preset changed to timer1
THEN wait 10 minutes
AND set the fan preset to low
```

### Error notifications

```
WHEN the error state changed
AND the Itho device has an error
THEN send push notification: "Itho error: {{error_code}}"
```

### MQTT automation

```
WHEN message received on topic "home/bathroom/humidity"
AND humidity is above 75
THEN set the fan preset to high
```

## App Settings

The app provides an **app-level settings page** accessible from the Homey app settings. This page includes:

- **Device Logs**: View centralized logs from both MQTT and API devices
- **Source Filter**: Filter logs by source (All, App, MQTT Device, API Device)
- **Clear Logs**: Clear log entries

Logs include timestamped entries for connections, subscriptions, polling, errors, and commands.

## Device Settings

### Device Type

Both MQTT and API devices include a **Device Type** dropdown:

| Type | Description | Available Presets |
|------|-------------|-------------------|
| Default (HRU200 / CVE) | Standard Itho devices using PWM2I2C protocol | Low, Medium, High, Timer 1-3 |
| CC1101 RF module | Devices with CC1101 RF module support | Away, Low, Medium, High, Auto, Auto Night, Cook 30, Cook 60, Timer 1-3 |

### MQTT Device Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Device type | Default | Itho device type (determines available presets) |
| MQTT broker | localhost | IP address or DNS name of MQTT broker |
| Port | 1883 | MQTT broker port |
| Use TLS | Off | Enable secure connection |
| Disable cert validation | Off | Allow self-signed certificates |
| Keepalive | 60 | MQTT keepalive interval (seconds) |
| Username | - | MQTT authentication username |
| Password | - | MQTT authentication password |
| Custom client ID | Off | Use custom client ID |
| Base topic | itho | Base MQTT topic (all subtopics derived automatically) |
| Use LWT | Off | Publish Last Will and Testament |

### API Device Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Device type | Default | Itho device type (determines available presets) |
| IP address or DNS | - | Address of NRG.Watch Itho add-on |
| Username | - | API authentication username |
| Password | - | API authentication password |
| Poll interval | 15 | Polling interval in seconds |

## Known Limitations

| Limitation | Description |
|-----------|-------------|
| **Local network only** | Both MQTT and API require local network access |
| **No auto-discovery** | Manual configuration required |
| **Hardware-specific features** | Some commands only work on specific Itho models |
| **MQTT real-time vs API polling** | MQTT provides instant updates; API polls at intervals |

## Supported Itho Commands

### Common Commands (all models)

- Virtual remote commands (away, low, medium, high, timer1-3)
- Clear queue
- Get status

### PWM2I2C Protocol Devices (HRU200, CVE models)

- Set speed (0-255)
- Set timer
- Speed + timer combination

### Devices with CC1101 Module

- RF remote commands
- Additional presets (auto, autonight, cook30, cook60, motion)

## Security Considerations

- **MQTT**: Supports TLS encryption and authentication
- **API**: HTTP only (no HTTPS) - use on trusted networks
- **Credentials**: Stored securely in Homey's encrypted settings
- **Local only**: No cloud or internet connections

## Terminology

| Term | Meaning |
|------|---------|
| **Preset** | Predefined fan speed setting (away, low, medium, high, etc.) |
| **Raw speed** | Direct speed value (0-255) sent to the ventilation unit |
| **Base topic** | Root MQTT topic from which all subtopics are derived |
| **LWT** | Last Will and Testament - MQTT feature for detecting disconnections |
| **Virtual remote** | Software emulation of physical Itho remote control |

## Technical Details

- **Protocol**: MQTT v3.1.1 / HTTP 1.1
- **SDK**: Homey Apps SDK v3
- **Languages**: English (en), Nederlands (nl)
- **Transport abstraction**: Unified device model for MQTT and API

## Troubleshooting

### MQTT device shows offline

1. Check MQTT broker is running and accessible
2. Verify broker address and port in device settings
3. Check username/password if authentication is enabled
4. Review logs in the **App Settings** page (filter by MQTT)

### API device shows unavailable

1. Verify IP address of NRG.Watch Itho add-on
2. Check network connectivity from Homey to add-on
3. Verify username/password if required
4. Review logs in the **App Settings** page (filter by API)
5. Try reducing poll interval

### Commands not working

1. Verify your Itho model supports the command (check Device Type setting)
2. Check device is online
3. Review flow card logs for error messages
4. Check the **App Settings** log page for detailed error information

## Credits & Acknowledgements

This Homey app integrates the Itho CVE with the Itho module (designed by **Arjen Hiemstra** from **[NRG.Watch](https://www.nrgwatch.nl/)**) with your Homey, which makes the perfect end-to-end smart solution.

> Arjen, thanks for the great work you did on the Itho module, I am using it already for a couple of years to full satisfaction!

The Homey app was created by **Robert Coemans** with assistance from **Claude** (Anthropic), built using **[Windsurf](https://windsurf.com)** — an AI-powered IDE for collaborative software development.

If you like this Homey app, consider [buying me a coffee](https://buymeacoffee.com/kabxpqqg7z), if you like it this means you already using the Itho module, in that case consider [buying Arjen a coffee](https://buymeacoffee.com/nrgwatch) as well.

Pull requests and issue reports are welcome on [GitHub](https://github.com/rcoemans/nl.nrgwatch.itho/issues).

## License

GPL-3.0 - see [LICENSE](LICENSE) file for details.



================================================
FILE: README.nl.txt
================================================
Integreer je Itho ventilatiesysteem met Homey via de NRG.Watch Itho add-on hardware module. Deze integratie maakt geautomatiseerde klimaatregeling mogelijk op basis van luchtvochtigheid, temperatuur of tijdschema's, voor een gezonder en comfortabeler binnenklimaat.

Verbind via MQTT voor realtime updates of HTTP API voor polling-gebaseerde besturing. Monitor het binnenklimaat met temperatuur- en vochtigheidssensoren, regel ventilatorsnelheden en presets, en volg de systeemgezondheid met foutbewaking en diagnostische gegevens. De app ondersteunt zowel standaard Itho units als systemen met CC1101 RF modules voor uitgebreide functionaliteit.

De installatie is eenvoudig: voeg het apparaat toe in Homey, kies je verbindingsmethode (MQTT of API), selecteer je Itho apparaattype en configureer de verbindingsinstellingen. De app regelt alle communicatie met je ventilatiesysteem automatisch.



================================================
FILE: README.txt
================================================
Integrate your Itho ventilation system with Homey using the NRG.Watch Itho add-on hardware module. This integration enables automated climate control based on humidity, temperature, or time schedules, creating a healthier and more comfortable indoor environment.

Connect via MQTT for real-time updates or HTTP API for polling-based control. Monitor indoor climate with temperature and humidity sensors, control fan speeds and presets, and track system health with error monitoring and diagnostic data. The app supports both standard Itho units and systems with CC1101 RF modules for extended functionality.

Set up is straightforward: add the device in Homey, choose your connection method (MQTT or API), select your Itho device type, and configure the connection settings. The app handles all communication with your ventilation system automatically.



================================================
FILE: api.ts
================================================
'use strict';

module.exports = {

  async getLogs({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText() || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async getLogsMqtt({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText('MQTT') || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async getLogsApi({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText('API') || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async getLogsApp({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText('App') || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async clearLogs({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      app.appLogger.clear();
      return 'Logs cleared.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  }

};



================================================
FILE: app.ts
================================================
'use strict';

import Homey from 'homey';
import { AppLogger } from './lib/AppLogger';

module.exports = class NRGWatchIthoApp extends Homey.App {

  public appLogger!: AppLogger;

  async onInit() {
    this.log('NRG.Watch Itho add-on has been initialized');

    this.appLogger = new AppLogger(500);
    this.appLogger.info('App', 'NRG.Watch Itho add-on initialized');

    this.registerFlowCards();
  }

  registerFlowCards() {
    // Condition cards
    this.homey.flow.getConditionCard('device_is_online')
      .registerRunListener(async (args) => {
        return args.device.getAvailable();
      });

    this.homey.flow.getConditionCard('fan_speed_equal')
      .registerRunListener(async (args) => {
        const currentSpeed = args.device.getCapabilityValue('itho_fan_speed_raw');
        return currentSpeed === args.speed;
      });

    this.homey.flow.getConditionCard('fan_speed_above')
      .registerRunListener(async (args) => {
        const currentSpeed = args.device.getCapabilityValue('itho_fan_speed_raw');
        return currentSpeed > args.speed;
      });

    this.homey.flow.getConditionCard('fan_speed_below')
      .registerRunListener(async (args) => {
        const currentSpeed = args.device.getCapabilityValue('itho_fan_speed_raw');
        return currentSpeed < args.speed;
      });

    this.homey.flow.getConditionCard('fan_preset_is')
      .registerRunListener(async (args) => {
        const currentPreset = args.device.getCapabilityValue('itho_fan_preset');
        return currentPreset === args.preset;
      });

    this.homey.flow.getConditionCard('temperature_above')
      .registerRunListener(async (args) => {
        const currentTemp = args.device.getCapabilityValue('measure_temperature');
        return currentTemp !== null && currentTemp > args.temperature;
      });

    this.homey.flow.getConditionCard('temperature_below')
      .registerRunListener(async (args) => {
        const currentTemp = args.device.getCapabilityValue('measure_temperature');
        return currentTemp !== null && currentTemp < args.temperature;
      });

    this.homey.flow.getConditionCard('humidity_above')
      .registerRunListener(async (args) => {
        const currentHum = args.device.getCapabilityValue('measure_humidity');
        return currentHum !== null && currentHum > args.humidity;
      });

    this.homey.flow.getConditionCard('humidity_below')
      .registerRunListener(async (args) => {
        const currentHum = args.device.getCapabilityValue('measure_humidity');
        return currentHum !== null && currentHum < args.humidity;
      });

    this.homey.flow.getConditionCard('device_has_error')
      .registerRunListener(async (args) => {
        const errorCode = args.device.getCapabilityValue('itho_error_code');
        return errorCode !== null && errorCode !== 0;
      });

    this.homey.flow.getConditionCard('mqtt_broker_connected')
      .registerRunListener(async (args) => {
        return args.device.isMqttConnected ? args.device.isMqttConnected() : false;
      });

    // Action cards
    this.homey.flow.getActionCard('set_fan_speed')
      .registerRunListener(async (args) => {
        await args.device.setFanSpeed(args.speed);
      });

    this.homey.flow.getActionCard('set_fan_preset')
      .registerRunListener(async (args) => {
        await args.device.setFanPreset(args.preset);
      });

    this.homey.flow.getActionCard('start_timer')
      .registerRunListener(async (args) => {
        await args.device.startTimer(args.seconds);
      });

    this.homey.flow.getActionCard('set_speed_with_timer')
      .registerRunListener(async (args) => {
        await args.device.setFanSpeed(args.speed, args.seconds);
      });

    this.homey.flow.getActionCard('clear_queue')
      .registerRunListener(async (args) => {
        await args.device.clearQueue();
      });

    this.homey.flow.getActionCard('send_virtual_remote')
      .registerRunListener(async (args) => {
        await args.device.sendVirtualRemote(args.command);
      });

    // MQTT-specific action cards
    this.homey.flow.getActionCard('mqtt_publish_simple')
      .registerRunListener(async (args) => {
        await args.device.publishMqttMessage(args.topic, args.message);
      });

    this.homey.flow.getActionCard('mqtt_publish_advanced')
      .registerRunListener(async (args) => {
        const qos = parseInt(args.qos) as 0 | 1 | 2;
        const retain = args.retain === 'true';
        await args.device.publishMqttMessage(args.topic, args.message, qos, retain);
      });

    // MQTT trigger card with topic matching
    const mqttMessageReceived = this.homey.flow.getTriggerCard('mqtt_message_received');
    mqttMessageReceived.registerRunListener(async (args, state) => {
      return this.matchMqttTopic(args.topic, state.topic);
    });
  }

  matchMqttTopic(pattern: string, topic: string): boolean {
    const regexPattern = pattern
      .replace(/\+/g, '[^/]+')
      .replace(/#$/, '.*')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }

}



================================================
FILE: CODE_OF_CONDUCT.md
================================================
# Contributor Covenant Code of Conduct

## Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
education, socio-economic status, nationality, personal appearance, race,
religion, or sexual identity and orientation.

## Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
  advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

## Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at support@athom.com. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at https://www.contributor-covenant.org/version/1/4/code-of-conduct.html



================================================
FILE: CONTRIBUTING.md
================================================
# Contributing to Athom and Homey

First off all, thank you for taking the time to contribute!

The following is a set of guidelines for contributing to Athom and its packages, which are hosted in the [Athom Organization](https://github.com/athombv) on GitHub. These are just guidelines, not rules. Use your best judgment, and feel free to contact us if you have any questions.

Please join our [community slack](https://slack.athom.com), if you have not done so already.
We also have a [community forum](https://community.homey.app) for general discussions.


## Before submitting a bug or feature request

* **Have you actually read the error message**?
* Have you searched for similar issues?
* Have you updated homey, all apps, and the development tools (if applicable)?
* Have you checked that it's not a problem with one of the apps you're using, rather than Homey itself?
* Have you looked at what's involved in fixing/implementing this?
 
Capable programmers should always attempt to investigate and fix problems themselves before asking for others to help. Submit a pull request instead of an issue!

## A great bug report contains

* Context – what were you trying to achieve?
* Detailed steps to reproduce the error from scratch. Try isolating the minimal amount of code needed to reproduce the error.
* Any applicable log files or ID's.
* Evidence you've looked into solving the problem and ideally, a theory on the cause and a possible solution.

## A great feature request contains

* The current situation.
* How and why the current situation is problematic.
* A detailed proposal or pull request that demonstrates how the problem could be solved.
* A use case – who needs this feature and why?
* Any caveats.

## A great pull request contains

* Minimal changes. Only submit code relevant to the current issue. Other changes should go in new pull requests.
* Minimal commits. Please squash to a single commit before sending your pull request.
* No conflicts. Please rebase off the latest master before submitting.
* Code conforming to the existing conventions and formats. i.e. Please don't reformat whitespace.
* Passing tests in the test folder (if applicable). Use existing tests as a reference.
* Relevant documentation.

## Speeding up your pull request
Merging pull requests takes time. While we always try to merge your pull request as soon as possible, there are certain things you can do to speed up this process.

* Ask developers to review your code changes and post their feedback.
* Ask users to test your changes and post their feedback.
* Keep your changes to the minimal required amount, and dedicated to one issue/feature only.


================================================
FILE: LICENSE
================================================
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <http://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

                            Preamble

  The GNU General Public License is a free, copyleft license for
software and other kinds of works.

  The licenses for most software and other practical works are designed
to take away your freedom to share and change the works.  By contrast,
the GNU General Public License is intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users.  We, the Free Software Foundation, use the
GNU General Public License for most of our software; it applies also to
any other work released this way by its authors.  You can apply it to
your programs, too.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
them if you wish), that you receive source code or can get it if you
want it, that you can change the software or use pieces of it in new
free programs, and that you know you can do these things.

  To protect your rights, we need to prevent others from denying you
these rights or asking you to surrender the rights.  Therefore, you have
certain responsibilities if you distribute copies of the software, or if
you modify it: responsibilities to respect the freedom of others.

  For example, if you distribute copies of such a program, whether
gratis or for a fee, you must pass on to the recipients the same
freedoms that you received.  You must make sure that they, too, receive
or can get the source code.  And you must show them these terms so they
know their rights.

  Developers that use the GNU GPL protect your rights with two steps:
(1) assert copyright on the software, and (2) offer you this License
giving you legal permission to copy, distribute and/or modify it.

  For the developers' and authors' protection, the GPL clearly explains
that there is no warranty for this free software.  For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.

  Some devices are designed to deny users access to install or run
modified versions of the software inside them, although the manufacturer
can do so.  This is fundamentally incompatible with the aim of
protecting users' freedom to change the software.  The systematic
pattern of such abuse occurs in the area of products for individuals to
use, which is precisely where it is most unacceptable.  Therefore, we
have designed this version of the GPL to prohibit the practice for those
products.  If such problems arise substantially in other domains, we
stand ready to extend this provision to those domains in future versions
of the GPL, as needed to protect the freedom of users.

  Finally, every program is threatened constantly by software patents.
States should not allow patents to restrict development and use of
software on general-purpose computers, but in those that do, we wish to
avoid the special danger that patents applied to a free program could
make it effectively proprietary.  To prevent this, the GPL assures that
patents cannot be used to render the program non-free.

  The precise terms and conditions for copying, distribution and
modification follow.

                       TERMS AND CONDITIONS

  0. Definitions.

  "This License" refers to version 3 of the GNU General Public License.

  "Copyright" also means copyright-like laws that apply to other kinds of
works, such as semiconductor masks.

  "The Program" refers to any copyrightable work licensed under this
License.  Each licensee is addressed as "you".  "Licensees" and
"recipients" may be individuals or organizations.

  To "modify" a work means to copy from or adapt all or part of the work
in a fashion requiring copyright permission, other than the making of an
exact copy.  The resulting work is called a "modified version" of the
earlier work or a work "based on" the earlier work.

  A "covered work" means either the unmodified Program or a work based
on the Program.

  To "propagate" a work means to do anything with it that, without
permission, would make you directly or secondarily liable for
infringement under applicable copyright law, except executing it on a
computer or modifying a private copy.  Propagation includes copying,
distribution (with or without modification), making available to the
public, and in some countries other activities as well.

  To "convey" a work means any kind of propagation that enables other
parties to make or receive copies.  Mere interaction with a user through
a computer network, with no transfer of a copy, is not conveying.

  An interactive user interface displays "Appropriate Legal Notices"
to the extent that it includes a convenient and prominently visible
feature that (1) displays an appropriate copyright notice, and (2)
tells the user that there is no warranty for the work (except to the
extent that warranties are provided), that licensees may convey the
work under this License, and how to view a copy of this License.  If
the interface presents a list of user commands or options, such as a
menu, a prominent item in the list meets this criterion.

  1. Source Code.

  The "source code" for a work means the preferred form of the work
for making modifications to it.  "Object code" means any non-source
form of a work.

  A "Standard Interface" means an interface that either is an official
standard defined by a recognized standards body, or, in the case of
interfaces specified for a particular programming language, one that
is widely used among developers working in that language.

  The "System Libraries" of an executable work include anything, other
than the work as a whole, that (a) is included in the normal form of
packaging a Major Component, but which is not part of that Major
Component, and (b) serves only to enable use of the work with that
Major Component, or to implement a Standard Interface for which an
implementation is available to the public in source code form.  A
"Major Component", in this context, means a major essential component
(kernel, window system, and so on) of the specific operating system
(if any) on which the executable work runs, or a compiler used to
produce the work, or an object code interpreter used to run it.

  The "Corresponding Source" for a work in object code form means all
the source code needed to generate, install, and (for an executable
work) run the object code and to modify the work, including scripts to
control those activities.  However, it does not include the work's
System Libraries, or general-purpose tools or generally available free
programs which are used unmodified in performing those activities but
which are not part of the work.  For example, Corresponding Source
includes interface definition files associated with source files for
the work, and the source code for shared libraries and dynamically
linked subprograms that the work is specifically designed to require,
such as by intimate data communication or control flow between those
subprograms and other parts of the work.

  The Corresponding Source need not include anything that users
can regenerate automatically from other parts of the Corresponding
Source.

  The Corresponding Source for a work in source code form is that
same work.

  2. Basic Permissions.

  All rights granted under this License are granted for the term of
copyright on the Program, and are irrevocable provided the stated
conditions are met.  This License explicitly affirms your unlimited
permission to run the unmodified Program.  The output from running a
covered work is covered by this License only if the output, given its
content, constitutes a covered work.  This License acknowledges your
rights of fair use or other equivalent, as provided by copyright law.

  You may make, run and propagate covered works that you do not
convey, without conditions so long as your license otherwise remains
in force.  You may convey covered works to others for the sole purpose
of having them make modifications exclusively for you, or provide you
with facilities for running those works, provided that you comply with
the terms of this License in conveying all material for which you do
not control copyright.  Those thus making or running the covered works
for you must do so exclusively on your behalf, under your direction
and control, on terms that prohibit them from making any copies of
your copyrighted material outside their relationship with you.

  Conveying under any other circumstances is permitted solely under
the conditions stated below.  Sublicensing is not allowed; section 10
makes it unnecessary.

  3. Protecting Users' Legal Rights From Anti-Circumvention Law.

  No covered work shall be deemed part of an effective technological
measure under any applicable law fulfilling obligations under article
11 of the WIPO copyright treaty adopted on 20 December 1996, or
similar laws prohibiting or restricting circumvention of such
measures.

  When you convey a covered work, you waive any legal power to forbid
circumvention of technological measures to the extent such circumvention
is effected by exercising rights under this License with respect to
the covered work, and you disclaim any intention to limit operation or
modification of the work as a means of enforcing, against the work's
users, your or third parties' legal rights to forbid circumvention of
technological measures.

  4. Conveying Verbatim Copies.

  You may convey verbatim copies of the Program's source code as you
receive it, in any medium, provided that you conspicuously and
appropriately publish on each copy an appropriate copyright notice;
keep intact all notices stating that this License and any
non-permissive terms added in accord with section 7 apply to the code;
keep intact all notices of the absence of any warranty; and give all
recipients a copy of this License along with the Program.

  You may charge any price or no price for each copy that you convey,
and you may offer support or warranty protection for a fee.

  5. Conveying Modified Source Versions.

  You may convey a work based on the Program, or the modifications to
produce it from the Program, in the form of source code under the
terms of section 4, provided that you also meet all of these conditions:

    a) The work must carry prominent notices stating that you modified
    it, and giving a relevant date.

    b) The work must carry prominent notices stating that it is
    released under this License and any conditions added under section
    7.  This requirement modifies the requirement in section 4 to
    "keep intact all notices".

    c) You must license the entire work, as a whole, under this
    License to anyone who comes into possession of a copy.  This
    License will therefore apply, along with any applicable section 7
    additional terms, to the whole of the work, and all its parts,
    regardless of how they are packaged.  This License gives no
    permission to license the work in any other way, but it does not
    invalidate such permission if you have separately received it.

    d) If the work has interactive user interfaces, each must display
    Appropriate Legal Notices; however, if the Program has interactive
    interfaces that do not display Appropriate Legal Notices, your
    work need not make them do so.

  A compilation of a covered work with other separate and independent
works, which are not by their nature extensions of the covered work,
and which are not combined with it such as to form a larger program,
in or on a volume of a storage or distribution medium, is called an
"aggregate" if the compilation and its resulting copyright are not
used to limit the access or legal rights of the compilation's users
beyond what the individual works permit.  Inclusion of a covered work
in an aggregate does not cause this License to apply to the other
parts of the aggregate.

  6. Conveying Non-Source Forms.

  You may convey a covered work in object code form under the terms
of sections 4 and 5, provided that you also convey the
machine-readable Corresponding Source under the terms of this License,
in one of these ways:

    a) Convey the object code in, or embodied in, a physical product
    (including a physical distribution medium), accompanied by the
    Corresponding Source fixed on a durable physical medium
    customarily used for software interchange.

    b) Convey the object code in, or embodied in, a physical product
    (including a physical distribution medium), accompanied by a
    written offer, valid for at least three years and valid for as
    long as you offer spare parts or customer support for that product
    model, to give anyone who possesses the object code either (1) a
    copy of the Corresponding Source for all the software in the
    product that is covered by this License, on a durable physical
    medium customarily used for software interchange, for a price no
    more than your reasonable cost of physically performing this
    conveying of source, or (2) access to copy the
    Corresponding Source from a network server at no charge.

    c) Convey individual copies of the object code with a copy of the
    written offer to provide the Corresponding Source.  This
    alternative is allowed only occasionally and noncommercially, and
    only if you received the object code with such an offer, in accord
    with subsection 6b.

    d) Convey the object code by offering access from a designated
    place (gratis or for a charge), and offer equivalent access to the
    Corresponding Source in the same way through the same place at no
    further charge.  You need not require recipients to copy the
    Corresponding Source along with the object code.  If the place to
    copy the object code is a network server, the Corresponding Source
    may be on a different server (operated by you or a third party)
    that supports equivalent copying facilities, provided you maintain
    clear directions next to the object code saying where to find the
    Corresponding Source.  Regardless of what server hosts the
    Corresponding Source, you remain obligated to ensure that it is
    available for as long as needed to satisfy these requirements.

    e) Convey the object code using peer-to-peer transmission, provided
    you inform other peers where the object code and Corresponding
    Source of the work are being offered to the general public at no
    charge under subsection 6d.

  A separable portion of the object code, whose source code is excluded
from the Corresponding Source as a System Library, need not be
included in conveying the object code work.

  A "User Product" is either (1) a "consumer product", which means any
tangible personal property which is normally used for personal, family,
or household purposes, or (2) anything designed or sold for incorporation
into a dwelling.  In determining whether a product is a consumer product,
doubtful cases shall be resolved in favor of coverage.  For a particular
product received by a particular user, "normally used" refers to a
typical or common use of that class of product, regardless of the status
of the particular user or of the way in which the particular user
actually uses, or expects or is expected to use, the product.  A product
is a consumer product regardless of whether the product has substantial
commercial, industrial or non-consumer uses, unless such uses represent
the only significant mode of use of the product.

  "Installation Information" for a User Product means any methods,
procedures, authorization keys, or other information required to install
and execute modified versions of a covered work in that User Product from
a modified version of its Corresponding Source.  The information must
suffice to ensure that the continued functioning of the modified object
code is in no case prevented or interfered with solely because
modification has been made.

  If you convey an object code work under this section in, or with, or
specifically for use in, a User Product, and the conveying occurs as
part of a transaction in which the right of possession and use of the
User Product is transferred to the recipient in perpetuity or for a
fixed term (regardless of how the transaction is characterized), the
Corresponding Source conveyed under this section must be accompanied
by the Installation Information.  But this requirement does not apply
if neither you nor any third party retains the ability to install
modified object code on the User Product (for example, the work has
been installed in ROM).

  The requirement to provide Installation Information does not include a
requirement to continue to provide support service, warranty, or updates
for a work that has been modified or installed by the recipient, or for
the User Product in which it has been modified or installed.  Access to a
network may be denied when the modification itself materially and
adversely affects the operation of the network or violates the rules and
protocols for communication across the network.

  Corresponding Source conveyed, and Installation Information provided,
in accord with this section must be in a format that is publicly
documented (and with an implementation available to the public in
source code form), and must require no special password or key for
unpacking, reading or copying.

  7. Additional Terms.

  "Additional permissions" are terms that supplement the terms of this
License by making exceptions from one or more of its conditions.
Additional permissions that are applicable to the entire Program shall
be treated as though they were included in this License, to the extent
that they are valid under applicable law.  If additional permissions
apply only to part of the Program, that part may be used separately
under those permissions, but the entire Program remains governed by
this License without regard to the additional permissions.

  When you convey a copy of a covered work, you may at your option
remove any additional permissions from that copy, or from any part of
it.  (Additional permissions may be written to require their own
removal in certain cases when you modify the work.)  You may place
additional permissions on material, added by you to a covered work,
for which you have or can give appropriate copyright permission.

  Notwithstanding any other provision of this License, for material you
add to a covered work, you may (if authorized by the copyright holders of
that material) supplement the terms of this License with terms:

    a) Disclaiming warranty or limiting liability differently from the
    terms of sections 15 and 16 of this License; or

    b) Requiring preservation of specified reasonable legal notices or
    author attributions in that material or in the Appropriate Legal
    Notices displayed by works containing it; or

    c) Prohibiting misrepresentation of the origin of that material, or
    requiring that modified versions of such material be marked in
    reasonable ways as different from the original version; or

    d) Limiting the use for publicity purposes of names of licensors or
    authors of the material; or

    e) Declining to grant rights under trademark law for use of some
    trade names, trademarks, or service marks; or

    f) Requiring indemnification of licensors and authors of that
    material by anyone who conveys the material (or modified versions of
    it) with contractual assumptions of liability to the recipient, for
    any liability that these contractual assumptions directly impose on
    those licensors and authors.

  All other non-permissive additional terms are considered "further
restrictions" within the meaning of section 10.  If the Program as you
received it, or any part of it, contains a notice stating that it is
governed by this License along with a term that is a further
restriction, you may remove that term.  If a license document contains
a further restriction but permits relicensing or conveying under this
License, you may add to a covered work material governed by the terms
of that license document, provided that the further restriction does
not survive such relicensing or conveying.

  If you add terms to a covered work in accord with this section, you
must place, in the relevant source files, a statement of the
additional terms that apply to those files, or a notice indicating
where to find the applicable terms.

  Additional terms, permissive or non-permissive, may be stated in the
form of a separately written license, or stated as exceptions;
the above requirements apply either way.

  8. Termination.

  You may not propagate or modify a covered work except as expressly
provided under this License.  Any attempt otherwise to propagate or
modify it is void, and will automatically terminate your rights under
this License (including any patent licenses granted under the third
paragraph of section 11).

  However, if you cease all violation of this License, then your
license from a particular copyright holder is reinstated (a)
provisionally, unless and until the copyright holder explicitly and
finally terminates your license, and (b) permanently, if the copyright
holder fails to notify you of the violation by some reasonable means
prior to 60 days after the cessation.

  Moreover, your license from a particular copyright holder is
reinstated permanently if the copyright holder notifies you of the
violation by some reasonable means, this is the first time you have
received notice of violation of this License (for any work) from that
copyright holder, and you cure the violation prior to 30 days after
your receipt of the notice.

  Termination of your rights under this section does not terminate the
licenses of parties who have received copies or rights from you under
this License.  If your rights have been terminated and not permanently
reinstated, you do not qualify to receive new licenses for the same
material under section 10.

  9. Acceptance Not Required for Having Copies.

  You are not required to accept this License in order to receive or
run a copy of the Program.  Ancillary propagation of a covered work
occurring solely as a consequence of using peer-to-peer transmission
to receive a copy likewise does not require acceptance.  However,
nothing other than this License grants you permission to propagate or
modify any covered work.  These actions infringe copyright if you do
not accept this License.  Therefore, by modifying or propagating a
covered work, you indicate your acceptance of this License to do so.

  10. Automatic Licensing of Downstream Recipients.

  Each time you convey a covered work, the recipient automatically
receives a license from the original licensors, to run, modify and
propagate that work, subject to this License.  You are not responsible
for enforcing compliance by third parties with this License.

  An "entity transaction" is a transaction transferring control of an
organization, or substantially all assets of one, or subdividing an
organization, or merging organizations.  If propagation of a covered
work results from an entity transaction, each party to that
transaction who receives a copy of the work also receives whatever
licenses to the work the party's predecessor in interest had or could
give under the previous paragraph, plus a right to possession of the
Corresponding Source of the work from the predecessor in interest, if
the predecessor has it or can get it with reasonable efforts.

  You may not impose any further restrictions on the exercise of the
rights granted or affirmed under this License.  For example, you may
not impose a license fee, royalty, or other charge for exercise of
rights granted under this License, and you may not initiate litigation
(including a cross-claim or counterclaim in a lawsuit) alleging that
any patent claim is infringed by making, using, selling, offering for
sale, or importing the Program or any portion of it.

  11. Patents.

  A "contributor" is a copyright holder who authorizes use under this
License of the Program or a work on which the Program is based.  The
work thus licensed is called the contributor's "contributor version".

  A contributor's "essential patent claims" are all patent claims
owned or controlled by the contributor, whether already acquired or
hereafter acquired, that would be infringed by some manner, permitted
by this License, of making, using, or selling its contributor version,
but do not include claims that would be infringed only as a
consequence of further modification of the contributor version.  For
purposes of this definition, "control" includes the right to grant
patent sublicenses in a manner consistent with the requirements of
this License.

  Each contributor grants you a non-exclusive, worldwide, royalty-free
patent license under the contributor's essential patent claims, to
make, use, sell, offer for sale, import and otherwise run, modify and
propagate the contents of its contributor version.

  In the following three paragraphs, a "patent license" is any express
agreement or commitment, however denominated, not to enforce a patent
(such as an express permission to practice a patent or covenant not to
sue for patent infringement).  To "grant" such a patent license to a
party means to make such an agreement or commitment not to enforce a
patent against the party.

  If you convey a covered work, knowingly relying on a patent license,
and the Corresponding Source of the work is not available for anyone
to copy, free of charge and under the terms of this License, through a
publicly available network server or other readily accessible means,
then you must either (1) cause the Corresponding Source to be so
available, or (2) arrange to deprive yourself of the benefit of the
patent license for this particular work, or (3) arrange, in a manner
consistent with the requirements of this License, to extend the patent
license to downstream recipients.  "Knowingly relying" means you have
actual knowledge that, but for the patent license, your conveying the
covered work in a country, or your recipient's use of the covered work
in a country, would infringe one or more identifiable patents in that
country that you have reason to believe are valid.

  If, pursuant to or in connection with a single transaction or
arrangement, you convey, or propagate by procuring conveyance of, a
covered work, and grant a patent license to some of the parties
receiving the covered work authorizing them to use, propagate, modify
or convey a specific copy of the covered work, then the patent license
you grant is automatically extended to all recipients of the covered
work and works based on it.

  A patent license is "discriminatory" if it does not include within
the scope of its coverage, prohibits the exercise of, or is
conditioned on the non-exercise of one or more of the rights that are
specifically granted under this License.  You may not convey a covered
work if you are a party to an arrangement with a third party that is
in the business of distributing software, under which you make payment
to the third party based on the extent of your activity of conveying
the work, and under which the third party grants, to any of the
parties who would receive the covered work from you, a discriminatory
patent license (a) in connection with copies of the covered work
conveyed by you (or copies made from those copies), or (b) primarily
for and in connection with specific products or compilations that
contain the covered work, unless you entered into that arrangement,
or that patent license was granted, prior to 28 March 2007.

  Nothing in this License shall be construed as excluding or limiting
any implied license or other defenses to infringement that may
otherwise be available to you under applicable patent law.

  12. No Surrender of Others' Freedom.

  If conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot convey a
covered work so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you may
not convey it at all.  For example, if you agree to terms that obligate you
to collect a royalty for further conveying from those to whom you convey
the Program, the only way you could satisfy both those terms and this
License would be to refrain entirely from conveying the Program.

  13. Use with the GNU Affero General Public License.

  Notwithstanding any other provision of this License, you have
permission to link or combine any covered work with a work licensed
under version 3 of the GNU Affero General Public License into a single
combined work, and to convey the resulting work.  The terms of this
License will continue to apply to the part which is the covered work,
but the special requirements of the GNU Affero General Public License,
section 13, concerning interaction through a network will apply to the
combination as such.

  14. Revised Versions of this License.

  The Free Software Foundation may publish revised and/or new versions of
the GNU General Public License from time to time.  Such new versions will
be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

  Each version is given a distinguishing version number.  If the
Program specifies that a certain numbered version of the GNU General
Public License "or any later version" applies to it, you have the
option of following the terms and conditions either of that numbered
version or of any later version published by the Free Software
Foundation.  If the Program does not specify a version number of the
GNU General Public License, you may choose any version ever published
by the Free Software Foundation.

  If the Program specifies that a proxy can decide which future
versions of the GNU General Public License can be used, that proxy's
public statement of acceptance of a version permanently authorizes you
to choose that version for the Program.

  Later license versions may give you additional or different
permissions.  However, no additional obligations are imposed on any
author or copyright holder as a result of your choosing to follow a
later version.

  15. Disclaimer of Warranty.

  THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

  16. Limitation of Liability.

  IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS
THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY
GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE
USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF
DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD
PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS),
EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES.

  17. Interpretation of Sections 15 and 16.

  If the disclaimer of warranty and limitation of liability provided
above cannot be given local legal effect according to their terms,
reviewing courts shall apply local law that most closely approximates
an absolute waiver of all civil liability in connection with the
Program, unless a warranty or assumption of liability accompanies a
copy of the Program in return for a fee.

                     END OF TERMS AND CONDITIONS

            How to Apply These Terms to Your New Programs

  If you develop a new program, and you want it to be of the greatest
possible use to the public, the best way to achieve this is to make it
free software which everyone can redistribute and change under these terms.

  To do so, attach the following notices to the program.  It is safest
to attach them to the start of each source file to most effectively
state the exclusion of warranty; and each file should have at least
the "copyright" line and a pointer to where the full notice is found.

    {one line to give the program's name and a brief idea of what it does.}
    Copyright (C) {year}  {name of author}

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

Also add information on how to contact you by electronic and paper mail.

  If the program does terminal interaction, make it output a short
notice like this when it starts in an interactive mode:

    {project}  Copyright (C) {year}  {fullname}
    This program comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type `show c' for details.

The hypothetical commands `show w' and `show c' should show the appropriate
parts of the General Public License.  Of course, your program's commands
might be different; for a GUI interface, you would use an "about box".

  You should also get your employer (if you work as a programmer) or school,
if any, to sign a "copyright disclaimer" for the program, if necessary.
For more information on this, and how to apply and follow the GNU GPL, see
<http://www.gnu.org/licenses/>.

  The GNU General Public License does not permit incorporating your program
into proprietary programs.  If your program is a subroutine library, you
may consider it more useful to permit linking proprietary applications with
the library.  If this is what you want to do, use the GNU Lesser General
Public License instead of this License.  But first, please read
<http://www.gnu.org/philosophy/why-not-lgpl.html>.



================================================
FILE: package.json
================================================
{
  "name": "nl.nrgwatch.itho",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "lint": "eslint --ext .js,.ts --ignore-path .gitignore ."
  },
  "dependencies": {
    "mqtt": "^5.3.5"
  },
  "devDependencies": {
    "@tsconfig/node16": "^16.1.8",
    "@types/homey": "npm:homey-apps-sdk-v3-types@^0.3.12",
    "@types/node": "^25.5.0",
    "eslint": "^7.32.0",
    "eslint-config-athom": "^3.1.5",
    "typescript": "^5.9.3"
  }
}



================================================
FILE: tsconfig.json
================================================
{
  "extends": "@tsconfig/node16/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": ".homeybuild/"
  }
}


================================================
FILE: .eslintrc.json
================================================
{
  "extends": "athom/homey-app"
}


================================================
FILE: .homeychangelog.json
================================================
{
  "1.0.0": {
    "en": "First version!"
  },
  "1.0.1": {
    "en": "First version of the app"
  },
  "1.0.2": {
    "en": "Fixed icons and readme"
  }
}



================================================
FILE: drivers/itho-api/device.ts
================================================
'use strict';

import Homey from 'homey';
import http from 'http';
import IthoStateNormalizer, { IthoStatusPayload, NormalizedState } from '../../lib/IthoStateNormalizer';
import IthoCommandMapper, { IthoCommand } from '../../lib/IthoCommandMapper';
import { AppLogger } from '../../lib/AppLogger';

module.exports = class IthoApiDevice extends Homey.Device {

  private pollTimer?: NodeJS.Timeout;
  private currentState: NormalizedState | null = null;
  private previousSpeed: number = 0;
  private previousPreset: string | null = null;
  private previousTemperature: number | null = null;
  private previousHumidity: number | null = null;
  private previousErrorCode: number = 0;
  private failureCount: number = 0;
  private maxFailures: number = 3;

  private get appLogger(): AppLogger {
    return (this.homey.app as any).appLogger;
  }

  private appLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.appLogger) {
      this.appLogger[level]('API', message);
    }
  }

  async onInit() {
    this.log('Itho API device has been initialized');
    this.appLog('Device initialized');

    const settings = this.getSettings();
    this.log('Current settings:', JSON.stringify({
      host: settings.api_host,
      username: settings.api_username ? '(set)' : '(empty)',
      poll_interval: settings.api_poll_interval
    }));
    this.appLog(`Settings loaded: host=${settings.api_host}`);

    this.registerCapabilityListeners();
    this.startPolling();
  }

  async onSettings({ oldSettings, newSettings, changedKeys }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('Settings changed:', changedKeys.join(', '));

    // Always restart polling when any setting changes
    this.stopPolling();

    // Schedule restart after settings are persisted
    this.homey.setTimeout(() => {
      this.startPolling();
    }, 1000);
  }

  async onDeleted() {
    this.log('Itho API device deleted');
    this.stopPolling();
  }

  private startPolling() {
    this.stopPolling();

    const host = this.getSetting('api_host') as string;
    if (!host) {
      this.log('No API host configured, waiting for settings...');
      return;
    }

    const intervalSec = (this.getSetting('api_poll_interval') as number) || 15;
    this.log(`Starting polling every ${intervalSec}s to ${host}`);
    this.appLog(`Polling started: ${host} every ${intervalSec}s`);

    // Poll immediately
    this.pollDevice().catch((err: Error) => this.error('Poll error:', err.message));

    // Then poll on interval
    this.pollTimer = this.homey.setInterval(() => {
      this.pollDevice().catch((err: Error) => this.error('Poll error:', err.message));
    }, intervalSec * 1000);
  }

  private stopPolling() {
    if (this.pollTimer) {
      this.homey.clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  private httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        });
      });
      request.on('error', (err: Error) => reject(err));
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timed out'));
      });
    });
  }

  private async pollDevice() {
    const host = this.getSetting('api_host') as string;

    if (!host) {
      return;
    }

    try {
      const baseUrl = `http://${host}`;
      const username = this.getSetting('api_username') as string;
      const password = this.getSetting('api_password') as string;

      const statusUrl = this.buildApiUrl(baseUrl, 'ithostatus', username, password);
      const speedUrl = this.buildApiUrl(baseUrl, 'currentspeed', username, password);

      this.log(`Polling ${host}...`);

      const [statusText, speedText] = await Promise.all([
        this.httpGet(statusUrl),
        this.httpGet(speedUrl)
      ]);

      const statusData: IthoStatusPayload = JSON.parse(statusText);
      const speedValue = parseInt(speedText.trim());

      this.log(`Status keys: ${Object.keys(statusData).join(', ')}`);
      this.log(`Speed value: ${speedValue}`);

      this.currentState = IthoStateNormalizer.normalize(
        statusData,
        isNaN(speedValue) ? null : speedValue,
        'api'
      );

      this.updateCapabilitiesFromState();

      if (this.failureCount > 0) {
        this.log('Connection restored after failures');
        this.appLog('Connection restored after failures');
        await this.setAvailable();
        this.failureCount = 0;
      }

      if (speedValue !== this.previousSpeed) {
        this.homey.flow.getDeviceTriggerCard('fan_speed_changed')
          .trigger(this, {
            speed_raw: speedValue,
            speed_percent: Math.round((speedValue / 255) * 100),
            previous_speed_raw: this.previousSpeed
          })
          .catch((e: Error) => this.error(e.message));

        this.previousSpeed = speedValue;
      }

      const preset = this.currentState.preset;
      if (preset && preset !== this.previousPreset) {
        this.homey.flow.getDeviceTriggerCard('fan_preset_changed')
          .trigger(this, {
            preset: preset,
            previous_preset: this.previousPreset || 'unknown'
          })
          .catch((e: Error) => this.error(e.message));

        this.previousPreset = preset;
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.error(`Poll failed: ${msg}`);
      this.appLog(`Poll failed: ${msg}`, 'error');
      this.failureCount++;

      if (this.failureCount >= this.maxFailures) {
        this.appLog(`Device marked unavailable after ${this.failureCount} failures`, 'error');
        await this.setUnavailable(`Failed to connect to API: ${msg}`);
      }
    }
  }

  private updateCapabilitiesFromState() {
    if (!this.currentState) return;

    const s = this.currentState;

    if (s.currentSpeed !== null) {
      this.setCapabilityValue('itho_fan_speed_raw', s.currentSpeed).catch(this.error);
    }
    if (s.preset) {
      this.setCapabilityValue('itho_fan_preset', s.preset).catch(this.error);
    }
    if (s.temperature !== null) {
      this.setCapabilityValue('measure_temperature', s.temperature).catch(this.error);
      if (s.temperature !== this.previousTemperature) {
        this.homey.flow.getDeviceTriggerCard('temperature_changed')
          .trigger(this, { temperature: s.temperature, previous_temperature: this.previousTemperature ?? 0 })
          .catch((e: Error) => this.error(e.message));
        this.previousTemperature = s.temperature;
      }
    }
    if (s.humidity !== null) {
      this.setCapabilityValue('measure_humidity', s.humidity).catch(this.error);
      if (s.humidity !== this.previousHumidity) {
        this.homey.flow.getDeviceTriggerCard('humidity_changed')
          .trigger(this, { humidity: s.humidity, previous_humidity: this.previousHumidity ?? 0 })
          .catch((e: Error) => this.error(e.message));
        this.previousHumidity = s.humidity;
      }
    }
    if (s.fanSpeedRpm !== null) {
      this.setCapabilityValue('itho_fan_speed_rpm', s.fanSpeedRpm).catch(this.error);
    }
    if (s.fanSetpointRpm !== null) {
      this.setCapabilityValue('itho_fan_setpoint_rpm', s.fanSetpointRpm).catch(this.error);
    }
    if (s.ventilationSetpointPct !== null) {
      this.setCapabilityValue('itho_ventilation_setpoint', s.ventilationSetpointPct).catch(this.error);
    }
    if (s.errorCode !== null) {
      this.setCapabilityValue('itho_error_code', s.errorCode).catch(this.error);
      if (s.errorCode !== this.previousErrorCode) {
        this.homey.flow.getDeviceTriggerCard('error_state_changed')
          .trigger(this, { error_code: s.errorCode, previous_error_code: this.previousErrorCode })
          .catch((e: Error) => this.error(e.message));
        this.previousErrorCode = s.errorCode;
      }
    }
    if (s.totalOperationHours !== null) {
      this.setCapabilityValue('itho_total_operation', s.totalOperationHours).catch(this.error);
    }
    if (s.startupCounter !== null) {
      this.setCapabilityValue('itho_startup_counter', s.startupCounter).catch(this.error);
    }
    if (s.absoluteHumidity !== null) {
      this.setCapabilityValue('itho_absolute_humidity', s.absoluteHumidity).catch(this.error);
    }
    if (s.supplyTemperature !== null) {
      this.setCapabilityValue('itho_supply_temperature', s.supplyTemperature).catch(this.error);
    }
    if (s.exhaustTemperature !== null) {
      this.setCapabilityValue('itho_exhaust_temperature', s.exhaustTemperature).catch(this.error);
    }
    this.setCapabilityValue('itho_online', s.online).catch(this.error);
  }

  private registerCapabilityListeners() {
    this.registerCapabilityListener('itho_fan_preset', async (value: string) => {
      await this.setFanPreset(value);
    });
  }

  async setFanPreset(preset: string) {
    await this.sendCommand({ type: 'preset', value: preset });
  }

  async setFanSpeed(speed: number, timer?: number) {
    await this.sendCommand({ type: 'speed', value: speed, timer });
  }

  async startTimer(seconds: number) {
    await this.sendCommand({ type: 'timer', value: seconds });
  }

  async clearQueue() {
    await this.sendCommand({ type: 'clearqueue' });
  }

  async sendVirtualRemote(remoteCommand: string) {
    await this.sendCommand({ type: 'vremote', value: remoteCommand });
  }

  private async sendCommand(command: IthoCommand) {
    const host = this.getSetting('api_host') as string;
    if (!host) {
      throw new Error('No API host configured');
    }

    const baseUrl = `http://${host}`;
    const username = this.getSetting('api_username') as string;
    const password = this.getSetting('api_password') as string;
    const url = IthoCommandMapper.buildApiUrl(baseUrl, command, username, password);

    try {
      await this.httpGet(url);

      this.homey.flow.getDeviceTriggerCard('command_sent_success')
        .trigger(this, {
          command_name: command.type,
          command_value: JSON.stringify(command.value),
          transport: 'API'
        })
        .catch((e: Error) => this.error(e.message));

      // Re-poll after command
      await this.pollDevice();
    } catch (error) {
      this.error('Failed to send command:', error);

      this.homey.flow.getDeviceTriggerCard('command_failed')
        .trigger(this, {
          command_name: command.type,
          command_value: JSON.stringify(command.value),
          error_message: error instanceof Error ? error.message : 'Unknown error',
          transport: 'API'
        })
        .catch((e: Error) => this.error(e.message));

      throw error;
    }
  }

  private buildApiUrl(baseUrl: string, endpoint: string, username?: string, password?: string): string {
    const params = new URLSearchParams();
    if (username && username.trim() !== '') {
      params.append('username', username);
      params.append('password', password || '');
    }
    params.append('get', endpoint);
    return `${baseUrl}/api.html?${params.toString()}`;
  }

}



================================================
FILE: drivers/itho-api/driver.compose.json
================================================
{
  "name": {
    "en": "NRG.Watch Itho (API)",
    "nl": "NRG.Watch Itho (API)"
  },
  "class": "fan",
  "capabilities": [
    "itho_online",
    "itho_fan_preset",
    "itho_fan_speed_raw",
    "measure_temperature",
    "measure_humidity",
    "itho_absolute_humidity",
    "itho_supply_temperature",
    "itho_exhaust_temperature",
    "itho_fan_speed_rpm",
    "itho_fan_setpoint_rpm",
    "itho_ventilation_setpoint",
    "itho_error_code",
    "itho_total_operation",
    "itho_startup_counter"
  ],
  "capabilitiesOptions": {
    "measure_temperature": {
      "title": {
        "en": "Indoor Temperature",
        "nl": "Binnentemperatuur"
      }
    }
  },
  "platforms": [
    "local"
  ],
  "connectivity": [
    "lan"
  ],
  "images": {
    "small": "/drivers/itho-api/assets/images/small.png",
    "large": "/drivers/itho-api/assets/images/large.png",
    "xlarge": "/drivers/itho-api/assets/images/xlarge.png"
  },
  "pair": [
    {
      "id": "list_devices",
      "template": "list_devices",
      "navigation": {
        "next": "add_devices"
      }
    },
    {
      "id": "add_devices",
      "template": "add_devices"
    }
  ],
  "settings": [
    {
      "type": "group",
      "label": {
        "en": "Device Type",
        "nl": "Apparaat Type"
      },
      "children": [
        {
          "id": "device_type",
          "type": "dropdown",
          "label": {
            "en": "Itho device type",
            "nl": "Itho apparaat type"
          },
          "value": "default",
          "hint": {
            "en": "Select the type of Itho device connected. This determines which fan presets are available.",
            "nl": "Selecteer het type Itho apparaat dat is aangesloten. Dit bepaalt welke ventilator presets beschikbaar zijn."
          },
          "values": [
            {
              "id": "default",
              "label": {
                "en": "Default (HRU200 / CVE)",
                "nl": "Standaard (HRU200 / CVE)"
              }
            },
            {
              "id": "cc1101",
              "label": {
                "en": "CC1101 RF module (full preset support)",
                "nl": "CC1101 RF module (volledige preset ondersteuning)"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "group",
      "label": {
        "en": "API Connection",
        "nl": "API Verbinding"
      },
      "children": [
        {
          "id": "api_host",
          "type": "text",
          "label": {
            "en": "IP address or DNS",
            "nl": "IP-adres of DNS"
          },
          "value": "",
          "hint": {
            "en": "IP address or DNS name of the Itho add-on (e.g., 192.168.4.1 or itho.local)",
            "nl": "IP-adres of DNS-naam van de Itho add-on (bijv. 192.168.4.1 of itho.local)"
          }
        },
        {
          "id": "api_username",
          "type": "text",
          "label": {
            "en": "Username",
            "nl": "Gebruikersnaam"
          },
          "value": ""
        },
        {
          "id": "api_password",
          "type": "password",
          "label": {
            "en": "Password",
            "nl": "Wachtwoord"
          },
          "value": ""
        },
        {
          "id": "api_poll_interval",
          "type": "number",
          "label": {
            "en": "Poll interval (seconds)",
            "nl": "Poll interval (seconden)"
          },
          "value": 15,
          "min": 5,
          "max": 300,
          "hint": {
            "en": "How often to poll the device for status updates",
            "nl": "Hoe vaak het apparaat moet worden gepolld voor statusupdates"
          }
        }
      ]
    }
  ]
}



================================================
FILE: drivers/itho-api/driver.ts
================================================
'use strict';

import Homey from 'homey';

module.exports = class IthoApiDriver extends Homey.Driver {

  async onInit() {
    this.log('Itho API Driver has been initialized');
  }

  async onPair(session: any) {
    session.setHandler('list_devices', async () => {
      return [
        {
          name: 'NRG.Watch Itho (API)',
          data: {
            id: `itho-api-${Date.now()}`
          },
          settings: {
            api_host: '',
            api_username: '',
            api_password: '',
            api_poll_interval: 15
          }
        }
      ];
    });
  }

}



================================================
FILE: drivers/itho-mqtt/device.ts
================================================
'use strict';

import Homey from 'homey';
import IthoMqttClient from '../../lib/IthoMqttClient';
import IthoStateNormalizer, { IthoStatusPayload, NormalizedState } from '../../lib/IthoStateNormalizer';
import IthoCommandMapper, { IthoCommand } from '../../lib/IthoCommandMapper';
import { AppLogger } from '../../lib/AppLogger';

module.exports = class IthoMqttDevice extends Homey.Device {

  private mqttClient?: IthoMqttClient;
  private messageHandlers: Map<string, (topic: string, message: Buffer) => void> = new Map();
  private currentState: NormalizedState | null = null;
  private previousSpeed: number = 0;
  private previousPreset: string | null = null;
  private previousTemperature: number | null = null;
  private previousHumidity: number | null = null;
  private previousErrorCode: number = 0;

  private get appLogger(): AppLogger {
    return (this.homey.app as any).appLogger;
  }

  private appLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.appLogger) {
      this.appLogger[level]('MQTT', message);
    }
  }

  async onInit() {
    this.log('Itho MQTT device has been initialized');
    this.appLog('Device initialized');

    const settings = this.getSettings();
    this.log('Current settings:', JSON.stringify({
      host: settings.mqtt_host,
      port: settings.mqtt_port,
      tls: settings.mqtt_tls,
      baseTopic: settings.mqtt_base_topic,
      username: settings.mqtt_username ? '(set)' : '(empty)',
      useLWT: settings.mqtt_use_lwt
    }));
    this.appLog(`Settings loaded: host=${settings.mqtt_host}, port=${settings.mqtt_port}, topic=${settings.mqtt_base_topic}`);

    this.registerCapabilityListeners();

    try {
      await this.initializeMqttClient();
    } catch (error) {
      this.error('Failed during MQTT initialization:', error);
      this.appLog(`Initialization failed: ${error}`, 'error');
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('Settings changed:', changedKeys.join(', '));

    // Schedule reconnect after settings are persisted
    this.homey.setTimeout(async () => {
      this.log('Reconnecting MQTT after settings change...');
      try {
        await this.reconnectMqtt();
      } catch (error) {
        this.error('Failed to reconnect after settings change:', error);
      }
    }, 1000);
  }

  async onDeleted() {
    this.log('Itho MQTT device deleted');
    if (this.mqttClient) {
      await this.mqttClient.disconnect();
    }
  }

  private async initializeMqttClient() {
    const settings = this.getSettings();
    
    this.mqttClient = new IthoMqttClient(this, {
      host: settings.mqtt_host as string,
      port: settings.mqtt_port as number,
      useTLS: settings.mqtt_tls as boolean,
      tlsInsecure: settings.mqtt_tls_insecure as boolean,
      keepalive: settings.mqtt_keepalive as number,
      username: settings.mqtt_username as string,
      password: settings.mqtt_password as string,
      useCustomClientId: settings.mqtt_use_custom_client_id as boolean,
      clientId: settings.mqtt_client_id as string,
      baseTopic: settings.mqtt_base_topic as string,
      useLWT: settings.mqtt_use_lwt as boolean,
      lwtTopic: settings.mqtt_lwt_topic as string,
      lwtMessage: settings.mqtt_lwt_message as string
    });

    try {
      this.appLog(`Connecting to broker ${settings.mqtt_host}:${settings.mqtt_port}`);
      await this.mqttClient.connect();
      this.appLog('Connected to broker');
      this.subscribeToTopics();
    } catch (error) {
      this.error('Failed to initialize MQTT client:', error);
      this.appLog(`Connection failed: ${error}`, 'error');
      await this.setUnavailable('Failed to connect to MQTT broker');
    }
  }

  private async reconnectMqtt() {
    this.appLog('Reconnecting...');
    if (this.mqttClient) {
      this.unsubscribeFromAllTopics();
      await this.mqttClient.disconnect();
      this.appLog('Disconnected from broker');
    }
    await this.initializeMqttClient();
  }

  private subscribeToTopics() {
    if (!this.mqttClient) return;

    const baseTopic = this.getSetting('mqtt_base_topic') as string || 'itho';

    const statusTopic = `${baseTopic}/ithostatus`;
    const statusHandler = (topic: string, message: Buffer) => {
      this.handleStatusMessage(message);
    };
    this.messageHandlers.set(statusTopic, statusHandler);
    this.mqttClient.subscribe(statusTopic, statusHandler);
    this.appLog(`Subscription added ${statusTopic}`);

    const stateTopic = `${baseTopic}/state`;
    const stateHandler = (topic: string, message: Buffer) => {
      this.handleStateMessage(message);
    };
    this.messageHandlers.set(stateTopic, stateHandler);
    this.mqttClient.subscribe(stateTopic, stateHandler);
    this.appLog(`Subscription added ${stateTopic}`);

    const lwtTopic = `${baseTopic}/lwt`;
    const lwtHandler = (topic: string, message: Buffer) => {
      this.handleLWTMessage(message);
    };
    this.messageHandlers.set(lwtTopic, lwtHandler);
    this.mqttClient.subscribe(lwtTopic, lwtHandler);
    this.appLog(`Subscription added ${lwtTopic}`);

    const lastcmdTopic = `${baseTopic}/lastcmd`;
    const lastcmdHandler = (topic: string, message: Buffer) => {
      this.handleLastCommandMessage(message);
    };
    this.messageHandlers.set(lastcmdTopic, lastcmdHandler);
    this.mqttClient.subscribe(lastcmdTopic, lastcmdHandler);
    this.appLog(`Subscription added ${lastcmdTopic}`);
  }

  private unsubscribeFromAllTopics() {
    if (!this.mqttClient) return;

    for (const [topic, handler] of this.messageHandlers.entries()) {
      this.mqttClient.unsubscribe(topic, handler);
    }
    this.messageHandlers.clear();
  }

  private handleStatusMessage(message: Buffer) {
    try {
      const payload = message.toString();
      const data: IthoStatusPayload = JSON.parse(payload);

      const currentSpeed = this.currentState?.currentSpeed ?? 0;
      this.currentState = IthoStateNormalizer.normalize(data, currentSpeed, 'mqtt');

      this.updateCapabilitiesFromState();
    } catch (error) {
      this.error('Failed to parse status message:', error);
    }
  }

  private handleStateMessage(message: Buffer) {
    try {
      const payload = message.toString().trim();
      const speedState = parseInt(payload);

      if (!isNaN(speedState)) {
        const statusData = this.currentState?.rawStatus || null;
        this.currentState = IthoStateNormalizer.normalize(statusData, speedState, 'mqtt');
        
        this.updateCapabilitiesFromState();

        if (speedState !== this.previousSpeed) {
          this.homey.flow.getDeviceTriggerCard('fan_speed_changed')
            .trigger(this, {
              speed_raw: speedState,
              speed_percent: Math.round((speedState / 255) * 100),
              previous_speed_raw: this.previousSpeed
            })
            .catch(this.error);
          
          this.previousSpeed = speedState;
        }

        const preset = this.currentState.preset;
        if (preset && preset !== this.previousPreset) {
          this.homey.flow.getDeviceTriggerCard('fan_preset_changed')
            .trigger(this, {
              preset: preset,
              previous_preset: this.previousPreset || 'unknown'
            })
            .catch(this.error);
          
          this.previousPreset = preset;
        }
      }
    } catch (error) {
      this.error('Failed to parse state message:', error);
    }
  }

  private handleLWTMessage(message: Buffer) {
    try {
      const payload = message.toString().trim().toLowerCase();
      const isOnline = payload === 'online';

      if (isOnline) {
        this.setAvailable().catch(this.error);
        this.homey.flow.getDeviceTriggerCard('device_online')
          .trigger(this, {
            device_name: this.getName(),
            transport: 'MQTT'
          })
          .catch(this.error);
      } else {
        this.setUnavailable('Device offline').catch(this.error);
        this.homey.flow.getDeviceTriggerCard('device_offline')
          .trigger(this, {
            device_name: this.getName(),
            transport: 'MQTT'
          })
          .catch(this.error);
      }
    } catch (error) {
      this.error('Failed to parse LWT message:', error);
    }
  }

  private handleLastCommandMessage(message: Buffer) {
    try {
      const payload = message.toString();
      this.log('Last command received:', payload);
    } catch (error) {
      this.error('Failed to parse last command message:', error);
    }
  }

  private updateCapabilitiesFromState() {
    if (!this.currentState) return;

    if (this.currentState.currentSpeed !== null) {
      this.setCapabilityValue('itho_fan_speed_raw', this.currentState.currentSpeed).catch(this.error);
    }

    if (this.currentState.preset) {
      this.setCapabilityValue('itho_fan_preset', this.currentState.preset).catch(this.error);
    }

    if (this.currentState.temperature !== null) {
      this.setCapabilityValue('measure_temperature', this.currentState.temperature).catch(this.error);
      
      if (this.currentState.temperature !== this.previousTemperature) {
        this.homey.flow.getDeviceTriggerCard('temperature_changed')
          .trigger(this, {
            temperature: this.currentState.temperature,
            previous_temperature: this.previousTemperature ?? 0
          })
          .catch(this.error);
        this.previousTemperature = this.currentState.temperature;
      }
    }

    if (this.currentState.humidity !== null) {
      this.setCapabilityValue('measure_humidity', this.currentState.humidity).catch(this.error);
      
      if (this.currentState.humidity !== this.previousHumidity) {
        this.homey.flow.getDeviceTriggerCard('humidity_changed')
          .trigger(this, {
            humidity: this.currentState.humidity,
            previous_humidity: this.previousHumidity ?? 0
          })
          .catch(this.error);
        this.previousHumidity = this.currentState.humidity;
      }
    }

    if (this.currentState.fanSpeedRpm !== null) {
      this.setCapabilityValue('itho_fan_speed_rpm', this.currentState.fanSpeedRpm).catch(this.error);
    }

    if (this.currentState.fanSetpointRpm !== null) {
      this.setCapabilityValue('itho_fan_setpoint_rpm', this.currentState.fanSetpointRpm).catch(this.error);
    }

    if (this.currentState.ventilationSetpointPct !== null) {
      this.setCapabilityValue('itho_ventilation_setpoint', this.currentState.ventilationSetpointPct).catch(this.error);
    }

    if (this.currentState.errorCode !== null) {
      this.setCapabilityValue('itho_error_code', this.currentState.errorCode).catch(this.error);
      
      if (this.currentState.errorCode !== this.previousErrorCode) {
        this.homey.flow.getDeviceTriggerCard('error_state_changed')
          .trigger(this, {
            error_code: this.currentState.errorCode,
            previous_error_code: this.previousErrorCode
          })
          .catch(this.error);
        this.previousErrorCode = this.currentState.errorCode;
      }
    }

    if (this.currentState.totalOperationHours !== null) {
      this.setCapabilityValue('itho_total_operation', this.currentState.totalOperationHours).catch(this.error);
    }

    if (this.currentState.startupCounter !== null) {
      this.setCapabilityValue('itho_startup_counter', this.currentState.startupCounter).catch(this.error);
    }

    if (this.currentState.absoluteHumidity !== null) {
      this.setCapabilityValue('itho_absolute_humidity', this.currentState.absoluteHumidity).catch(this.error);
    }

    if (this.currentState.supplyTemperature !== null) {
      this.setCapabilityValue('itho_supply_temperature', this.currentState.supplyTemperature).catch(this.error);
    }

    if (this.currentState.exhaustTemperature !== null) {
      this.setCapabilityValue('itho_exhaust_temperature', this.currentState.exhaustTemperature).catch(this.error);
    }

    this.setCapabilityValue('itho_online', this.currentState.online).catch(this.error);
  }

  private registerCapabilityListeners() {
    this.registerCapabilityListener('itho_fan_preset', async (value: string) => {
      await this.setFanPreset(value);
    });
  }

  async setFanPreset(preset: string) {
    const command: IthoCommand = {
      type: 'preset',
      value: preset
    };

    await this.sendCommand(command);
  }

  async setFanSpeed(speed: number, timer?: number) {
    const command: IthoCommand = {
      type: 'speed',
      value: speed,
      timer: timer
    };

    await this.sendCommand(command);
  }

  async startTimer(seconds: number) {
    const command: IthoCommand = {
      type: 'timer',
      value: seconds
    };

    await this.sendCommand(command);
  }

  async clearQueue() {
    const command: IthoCommand = {
      type: 'clearqueue'
    };

    await this.sendCommand(command);
  }

  async sendVirtualRemote(remoteCommand: string) {
    const command: IthoCommand = {
      type: 'vremote',
      value: remoteCommand
    };

    await this.sendCommand(command);
  }

  private async sendCommand(command: IthoCommand) {
    if (!this.mqttClient || !this.mqttClient.isConnected()) {
      throw new Error('MQTT client not connected');
    }

    const baseTopic = this.getSetting('mqtt_base_topic') as string || 'itho';
    const cmdTopic = `${baseTopic}/cmd`;
    const payload = IthoCommandMapper.buildMqttPayload(command);

    try {
      await this.mqttClient.publish(cmdTopic, payload);
      
      this.homey.flow.getDeviceTriggerCard('command_sent_success')
        .trigger(this, {
          command_name: command.type,
          command_value: JSON.stringify(command.value),
          transport: 'MQTT'
        })
        .catch(this.error);
    } catch (error) {
      this.error('Failed to send command:', error);
      
      this.homey.flow.getDeviceTriggerCard('command_failed')
        .trigger(this, {
          command_name: command.type,
          command_value: JSON.stringify(command.value),
          error_message: error instanceof Error ? error.message : 'Unknown error',
          transport: 'MQTT'
        })
        .catch(this.error);
      
      throw error;
    }
  }

  async publishMqttMessage(topic: string, message: string, qos?: 0 | 1 | 2, retain?: boolean) {
    if (!this.mqttClient || !this.mqttClient.isConnected()) {
      throw new Error('MQTT client not connected');
    }

    await this.mqttClient.publish(topic, message, { qos: qos || 0, retain: retain || false });
  }

  isMqttConnected(): boolean {
    return this.mqttClient?.isConnected() || false;
  }

  getMqttLog(): string[] {
    return this.mqttClient?.getLog() || [];
  }

}



================================================
FILE: drivers/itho-mqtt/driver.compose.json
================================================
{
  "name": {
    "en": "NRG.Watch Itho (MQTT)",
    "nl": "NRG.Watch Itho (MQTT)"
  },
  "class": "fan",
  "capabilities": [
    "itho_online",
    "itho_fan_preset",
    "itho_fan_speed_raw",
    "measure_temperature",
    "measure_humidity",
    "itho_absolute_humidity",
    "itho_supply_temperature",
    "itho_exhaust_temperature",
    "itho_fan_speed_rpm",
    "itho_fan_setpoint_rpm",
    "itho_ventilation_setpoint",
    "itho_error_code",
    "itho_total_operation",
    "itho_startup_counter"
  ],
  "capabilitiesOptions": {
    "measure_temperature": {
      "title": {
        "en": "Indoor Temperature",
        "nl": "Binnentemperatuur"
      }
    }
  },
  "platforms": [
    "local"
  ],
  "connectivity": [
    "lan"
  ],
  "images": {
    "small": "/drivers/itho-mqtt/assets/images/small.png",
    "large": "/drivers/itho-mqtt/assets/images/large.png",
    "xlarge": "/drivers/itho-mqtt/assets/images/xlarge.png"
  },
  "pair": [
    {
      "id": "list_devices",
      "template": "list_devices",
      "navigation": {
        "next": "add_devices"
      }
    },
    {
      "id": "add_devices",
      "template": "add_devices"
    }
  ],
  "settings": [
    {
      "type": "group",
      "label": {
        "en": "Device Type",
        "nl": "Apparaat Type"
      },
      "children": [
        {
          "id": "device_type",
          "type": "dropdown",
          "label": {
            "en": "Itho device type",
            "nl": "Itho apparaat type"
          },
          "value": "default",
          "hint": {
            "en": "Select the type of Itho device connected. This determines which fan presets are available.",
            "nl": "Selecteer het type Itho apparaat dat is aangesloten. Dit bepaalt welke ventilator presets beschikbaar zijn."
          },
          "values": [
            {
              "id": "default",
              "label": {
                "en": "Default (HRU200 / CVE)",
                "nl": "Standaard (HRU200 / CVE)"
              }
            },
            {
              "id": "cc1101",
              "label": {
                "en": "CC1101 RF module (full preset support)",
                "nl": "CC1101 RF module (volledige preset ondersteuning)"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "group",
      "label": {
        "en": "MQTT Connectivity",
        "nl": "MQTT Connectiviteit"
      },
      "children": [
        {
          "id": "mqtt_host",
          "type": "text",
          "label": {
            "en": "MQTT broker (IP address or DNS)",
            "nl": "MQTT broker (IP-adres of DNS)"
          },
          "value": "localhost",
          "hint": {
            "en": "Hostname or IP address of the MQTT broker",
            "nl": "Hostnaam of IP-adres van de MQTT broker"
          }
        },
        {
          "id": "mqtt_port",
          "type": "number",
          "label": {
            "en": "Port number",
            "nl": "Poortnummer"
          },
          "value": 1883,
          "min": 1,
          "max": 65535,
          "hint": {
            "en": "Port used by the MQTT broker",
            "nl": "Poort gebruikt door de MQTT broker"
          }
        },
        {
          "id": "mqtt_tls",
          "type": "checkbox",
          "label": {
            "en": "Use a secure connection with the broker (TLS)",
            "nl": "Gebruik een beveiligde verbinding met de broker (TLS)"
          },
          "value": false,
          "hint": {
            "en": "Enable TLS when the broker requires a secure connection",
            "nl": "Schakel TLS in wanneer de broker een beveiligde verbinding vereist"
          }
        },
        {
          "id": "mqtt_tls_insecure",
          "type": "checkbox",
          "label": {
            "en": "Disable certificate validation (when using self-signed certificates)",
            "nl": "Schakel certificaatvalidatie uit (bij gebruik van zelfondertekende certificaten)"
          },
          "value": false,
          "hint": {
            "en": "Allows self-signed or otherwise untrusted certificates. Use only when needed.",
            "nl": "Staat zelfondertekende of anderszins niet-vertrouwde certificaten toe. Gebruik alleen indien nodig."
          }
        },
        {
          "id": "mqtt_keepalive",
          "type": "number",
          "label": {
            "en": "Keepalive time (seconds)",
            "nl": "Keepalive tijd (seconden)"
          },
          "value": 60,
          "min": 0,
          "max": 65535,
          "hint": {
            "en": "MQTT keepalive interval. Leave empty to use the recommended fallback.",
            "nl": "MQTT keepalive interval. Laat leeg om de aanbevolen standaardwaarde te gebruiken."
          }
        },
        {
          "id": "mqtt_username",
          "type": "text",
          "label": {
            "en": "Username",
            "nl": "Gebruikersnaam"
          },
          "value": ""
        },
        {
          "id": "mqtt_password",
          "type": "password",
          "label": {
            "en": "Password",
            "nl": "Wachtwoord"
          },
          "value": ""
        },
        {
          "id": "mqtt_use_custom_client_id",
          "type": "checkbox",
          "label": {
            "en": "Provide your own client id to be used when connecting to the broker",
            "nl": "Geef je eigen client-id op om te gebruiken bij het verbinden met de broker"
          },
          "value": false
        },
        {
          "id": "mqtt_client_id",
          "type": "text",
          "label": {
            "en": "Client id",
            "nl": "Client-id"
          },
          "value": "",
          "hint": {
            "en": "Leave disabled to let the app generate a stable client id automatically",
            "nl": "Laat uitgeschakeld om de app automatisch een stabiele client-id te laten genereren"
          }
        }
      ]
    },
    {
      "type": "group",
      "label": {
        "en": "MQTT Base Topic",
        "nl": "MQTT Basis Topic"
      },
      "children": [
        {
          "id": "mqtt_base_topic",
          "type": "text",
          "label": {
            "en": "MQTT base topic",
            "nl": "MQTT basis topic"
          },
          "value": "itho",
          "hint": {
            "en": "Base topic used by the Itho add-on. The app derives all internal topics automatically.",
            "nl": "Basis topic gebruikt door de Itho add-on. De app leidt alle interne topics automatisch af."
          }
        }
      ]
    },
    {
      "type": "group",
      "label": {
        "en": "LWT Configuration",
        "nl": "LWT Configuratie"
      },
      "children": [
        {
          "id": "mqtt_use_lwt",
          "type": "checkbox",
          "label": {
            "en": "Use LWT",
            "nl": "Gebruik LWT"
          },
          "value": false,
          "hint": {
            "en": "Publish a Last Will and Testament when connecting",
            "nl": "Publiceer een Last Will and Testament bij het verbinden"
          }
        },
        {
          "id": "mqtt_lwt_topic",
          "type": "text",
          "label": {
            "en": "Topic for LWT",
            "nl": "Topic voor LWT"
          },
          "value": ""
        },
        {
          "id": "mqtt_lwt_message",
          "type": "text",
          "label": {
            "en": "LWT message",
            "nl": "LWT bericht"
          },
          "value": ""
        }
      ]
    }
  ]
}



================================================
FILE: drivers/itho-mqtt/driver.ts
================================================
'use strict';

import Homey from 'homey';

module.exports = class IthoMqttDriver extends Homey.Driver {

  async onInit() {
    this.log('Itho MQTT Driver has been initialized');
  }

  async onPair(session: any) {
    session.setHandler('list_devices', async () => {
      return [
        {
          name: 'NRG.Watch Itho (MQTT)',
          data: {
            id: `itho-mqtt-${Date.now()}`
          },
          settings: {
            mqtt_host: 'localhost',
            mqtt_port: 1883,
            mqtt_tls: false,
            mqtt_tls_insecure: false,
            mqtt_keepalive: 60,
            mqtt_username: '',
            mqtt_password: '',
            mqtt_use_custom_client_id: false,
            mqtt_client_id: '',
            mqtt_base_topic: 'itho',
            mqtt_use_lwt: false,
            mqtt_lwt_topic: '',
            mqtt_lwt_message: ''
          }
        }
      ];
    });
  }

}



================================================
FILE: lib/AppLogger.ts
================================================
'use strict';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
}

export class AppLogger {
  private logs: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 500) {
    this.maxEntries = maxEntries;
  }

  info(source: string, message: string): void {
    this.addEntry('INFO', source, message);
  }

  warn(source: string, message: string): void {
    this.addEntry('WARN', source, message);
  }

  error(source: string, message: string): void {
    this.addEntry('ERROR', source, message);
  }

  private addEntry(level: LogEntry['level'], source: string, message: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      source,
      message
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxEntries) {
      this.logs.splice(0, this.logs.length - this.maxEntries);
    }
  }

  getLogs(source?: string): LogEntry[] {
    if (source) {
      return this.logs.filter(e => e.source === source);
    }
    return [...this.logs];
  }

  getLogsAsText(source?: string): string {
    const entries = this.getLogs(source);
    return entries
      .map(e => `${e.timestamp} [${e.level}] [${e.source}] ${e.message}`)
      .join('\n');
  }

  clear(source?: string): void {
    if (source) {
      this.logs = this.logs.filter(e => e.source !== source);
    } else {
      this.logs = [];
    }
  }
}



================================================
FILE: lib/IthoCommandMapper.ts
================================================
'use strict';

export interface IthoCommand {
  type: 'speed' | 'preset' | 'timer' | 'clearqueue' | 'vremote' | 'rfremote';
  value?: any;
  timer?: number;
}

export default class IthoCommandMapper {

  static buildMqttPayload(command: IthoCommand): string {
    let payload: any = {};

    switch (command.type) {
      case 'speed':
        payload.speed = command.value;
        if (command.timer !== undefined && command.timer > 0) {
          payload.timer = command.timer;
        }
        break;

      case 'preset':
        payload.command = command.value;
        break;

      case 'timer':
        payload.timer = command.value;
        break;

      case 'clearqueue':
        payload.clearqueue = 'true';
        break;

      case 'vremote':
        payload.vremotecmd = command.value;
        break;

      case 'rfremote':
        payload.rfremotecmd = command.value;
        break;

      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }

    return JSON.stringify(payload);
  }

  static buildApiUrl(baseUrl: string, command: IthoCommand, username?: string, password?: string): string {
    const params = new URLSearchParams();

    if (username) {
      params.append('username', username);
      params.append('password', password || '');
    }

    switch (command.type) {
      case 'speed':
        params.append('speed', command.value.toString());
        if (command.timer !== undefined && command.timer > 0) {
          params.append('timer', command.timer.toString());
        }
        break;

      case 'preset':
        params.append('command', command.value);
        break;

      case 'timer':
        params.append('timer', command.value.toString());
        break;

      case 'clearqueue':
        params.append('clearqueue', 'true');
        break;

      case 'vremote':
        params.append('vremotecmd', command.value);
        break;

      case 'rfremote':
        params.append('rfremotecmd', command.value);
        break;

      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }

    return `${baseUrl}/api.html?${params.toString()}`;
  }

}



================================================
FILE: lib/IthoMqttClient.ts
================================================
'use strict';

import Homey from 'homey';
import mqtt from 'mqtt';

interface MqttSettings {
  host: string;
  port: number;
  useTLS: boolean;
  tlsInsecure: boolean;
  keepalive: number;
  username: string;
  password: string;
  useCustomClientId: boolean;
  clientId: string;
  baseTopic: string;
  useLWT: boolean;
  lwtTopic: string;
  lwtMessage: string;
}

interface MessageHandler {
  (topic: string, message: Buffer): void;
}

export default class IthoMqttClient {
  
  private device: Homey.Device;
  private client: mqtt.MqttClient | null = null;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private logEntries: string[] = [];
  private maxLogEntries = 500;
  private settings: MqttSettings;

  constructor(device: Homey.Device, settings: MqttSettings) {
    this.device = device;
    this.settings = settings;
  }

  async connect() {
    if (this.client) {
      await this.disconnect();
    }

    if (!this.settings.host) {
      this.log('Cannot connect: no broker configured');
      return;
    }

    this.log(`Connecting to MQTT broker at ${this.settings.host}:${this.settings.port}`);

    const protocol = this.settings.useTLS ? 'mqtts' : 'mqtt';
    const url = `${protocol}://${this.settings.host}:${this.settings.port}`;

    const options: mqtt.IClientOptions = {
      keepalive: this.settings.keepalive || 60,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000
    };

    if (this.settings.username) {
      options.username = this.settings.username;
      options.password = this.settings.password;
    }

    if (this.settings.useCustomClientId && this.settings.clientId) {
      options.clientId = this.settings.clientId;
    } else {
      options.clientId = `homey_itho_${Math.random().toString(16).substr(2, 8)}`;
    }

    if (this.settings.useTLS) {
      options.rejectUnauthorized = !this.settings.tlsInsecure;
    }

    if (this.settings.useLWT && this.settings.lwtTopic && this.settings.lwtMessage) {
      options.will = {
        topic: this.settings.lwtTopic,
        payload: this.settings.lwtMessage,
        qos: 0,
        retain: false
      };
    }

    try {
      this.client = mqtt.connect(url, options);

      this.client.on('connect', () => {
        this.log('Connected to MQTT broker');
        this.resubscribeAll();
        this.device.setAvailable().catch(this.error.bind(this));
      });

      this.client.on('error', (error) => {
        this.error('MQTT error:', error.message);
      });

      this.client.on('offline', () => {
        this.log('MQTT client offline');
        this.device.setUnavailable('MQTT broker offline').catch(this.error.bind(this));
      });

      this.client.on('reconnect', () => {
        this.log('Reconnecting to MQTT broker');
      });

      this.client.on('close', () => {
        this.log('MQTT connection closed');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

    } catch (error) {
      this.error('Failed to connect to MQTT broker:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      this.log('Disconnecting from MQTT broker');
      await new Promise<void>((resolve) => {
        this.client!.end(false, {}, () => {
          this.client = null;
          resolve();
        });
      });
    }
  }

  subscribe(topic: string, handler: MessageHandler) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
      
      if (this.client && this.client.connected) {
        this.client.subscribe(topic, (err) => {
          if (err) {
            this.error(`Failed to subscribe to ${topic}:`, err);
          } else {
            this.log(`Subscribed to topic: ${topic}`);
          }
        });
      }
    }

    this.subscriptions.get(topic)!.add(handler);
  }

  unsubscribe(topic: string, handler: MessageHandler) {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscriptions.delete(topic);
        
        if (this.client && this.client.connected) {
          this.client.unsubscribe(topic, (err) => {
            if (err) {
              this.error(`Failed to unsubscribe from ${topic}:`, err);
            } else {
              this.log(`Unsubscribed from topic: ${topic}`);
            }
          });
        }
      }
    }
  }

  publish(topic: string, message: string, options?: mqtt.IClientPublishOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        this.error('Cannot publish: MQTT client not connected');
        reject(new Error('MQTT client not connected'));
        return;
      }

      this.client.publish(topic, message, options || {}, (err) => {
        if (err) {
          this.error(`Failed to publish to ${topic}:`, err);
          reject(err);
        } else {
          this.log(`Published to ${topic}: ${message}`);
          resolve();
        }
      });
    });
  }

  private resubscribeAll() {
    if (!this.client || !this.client.connected) {
      return;
    }

    for (const topic of this.subscriptions.keys()) {
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.error(`Failed to resubscribe to ${topic}:`, err);
        } else {
          this.log(`Resubscribed to topic: ${topic}`);
        }
      });
    }
  }

  private handleMessage(topic: string, message: Buffer) {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(topic, message);
        } catch (error) {
          this.error(`Error in message handler for ${topic}:`, error);
        }
      }
    }
  }

  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }

  getLog(): string[] {
    return [...this.logEntries];
  }

  updateSettings(settings: MqttSettings) {
    this.settings = settings;
  }

  private log(...args: any[]) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const message = `${timestamp} [INFO] ${args.join(' ')}`;
    this.device.log(message);
    this.addLogEntry(message);
  }

  private error(...args: any[]) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const message = `${timestamp} [ERROR] ${args.join(' ')}`;
    this.device.error(message);
    this.addLogEntry(message);
  }

  private addLogEntry(message: string) {
    this.logEntries.push(message);
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries.shift();
    }
  }

}



================================================
FILE: lib/IthoStateNormalizer.ts
================================================
'use strict';

export interface IthoStatusPayload {
  temp?: number;
  hum?: number;
  Temperature?: number;
  RelativeHumidity?: number;
  ppmw?: number;
  'Ventilation setpoint (%)'?: number;
  'Fan setpoint (rpm)'?: number;
  'Fan speed (rpm)'?: number;
  Error?: number;
  'Total operation (hours)'?: number;
  Selection?: number;
  'Startup counter'?: number;
  'Absence (min)'?: number;
  'Highest CO2 concentration (ppm)'?: number | string;
  'Highest RH concentration (%)'?: number;
  'Supply temp (°C)'?: number;
  'Exhaust temp (°C)'?: number;
  'Absolute humidity (g/m3)'?: number;
  [key: string]: any;
}

export interface NormalizedState {
  online: boolean;
  transport: string;
  currentSpeed: number;
  targetSpeed: number;
  preset: string | null;
  temperature: number | null;
  humidity: number | null;
  absoluteHumidity: number | null;
  supplyTemperature: number | null;
  exhaustTemperature: number | null;
  co2: number | null;
  fanSpeedRpm: number | null;
  fanSetpointRpm: number | null;
  ventilationSetpointPct: number | null;
  errorCode: number;
  selection: number | null;
  startupCounter: number | null;
  totalOperationHours: number | null;
  absenceMinutes: number | null;
  lastCommand: string | null;
  rawStatus: any;
}

export default class IthoStateNormalizer {

  static normalize(
    statusPayload: IthoStatusPayload | null,
    stateValue: number | null,
    transport: 'mqtt' | 'api'
  ): NormalizedState {
    const state: NormalizedState = {
      online: true,
      transport: transport.toUpperCase(),
      currentSpeed: stateValue ?? 0,
      targetSpeed: stateValue ?? 0,
      preset: null,
      temperature: null,
      humidity: null,
      absoluteHumidity: null,
      supplyTemperature: null,
      exhaustTemperature: null,
      co2: null,
      fanSpeedRpm: null,
      fanSetpointRpm: null,
      ventilationSetpointPct: null,
      errorCode: 0,
      selection: null,
      startupCounter: null,
      totalOperationHours: null,
      absenceMinutes: null,
      lastCommand: null,
      rawStatus: statusPayload || {}
    };

    if (statusPayload) {
      // Temperature - handle multiple field names
      if (statusPayload.temp !== undefined) {
        state.temperature = Number(statusPayload.temp.toFixed(1));
      } else if (statusPayload.Temperature !== undefined) {
        state.temperature = Number(statusPayload.Temperature.toFixed(1));
      }

      // Humidity - handle multiple field names
      if (statusPayload.hum !== undefined) {
        state.humidity = Number(statusPayload.hum.toFixed(1));
      } else if (statusPayload.RelativeHumidity !== undefined) {
        state.humidity = Number(statusPayload.RelativeHumidity.toFixed(1));
      }

      // Absolute humidity
      if (statusPayload['Absolute humidity (g/m3)'] !== undefined) {
        state.absoluteHumidity = Number(Number(statusPayload['Absolute humidity (g/m3)']).toFixed(1));
      }

      // Supply temperature
      if (statusPayload['Supply temp (°C)'] !== undefined) {
        state.supplyTemperature = Number(Number(statusPayload['Supply temp (°C)']).toFixed(1));
      }

      // Exhaust temperature
      if (statusPayload['Exhaust temp (°C)'] !== undefined) {
        state.exhaustTemperature = Number(Number(statusPayload['Exhaust temp (°C)']).toFixed(1));
      }

      // CO2 / Air quality metric
      if (statusPayload.ppmw !== undefined) {
        state.co2 = statusPayload.ppmw;
      }

      // Fan metrics
      if (statusPayload['Fan speed (rpm)'] !== undefined) {
        state.fanSpeedRpm = statusPayload['Fan speed (rpm)'];
      }

      if (statusPayload['Fan setpoint (rpm)'] !== undefined) {
        state.fanSetpointRpm = statusPayload['Fan setpoint (rpm)'];
      }

      if (statusPayload['Ventilation setpoint (%)'] !== undefined) {
        state.ventilationSetpointPct = statusPayload['Ventilation setpoint (%)'];
      }

      // Error code
      if (statusPayload.Error !== undefined) {
        state.errorCode = statusPayload.Error;
      }

      // Diagnostic fields
      if (statusPayload.Selection !== undefined) {
        state.selection = statusPayload.Selection;
      }

      if (statusPayload['Startup counter'] !== undefined) {
        state.startupCounter = statusPayload['Startup counter'];
      }

      if (statusPayload['Total operation (hours)'] !== undefined) {
        state.totalOperationHours = statusPayload['Total operation (hours)'];
      }

      if (statusPayload['Absence (min)'] !== undefined) {
        state.absenceMinutes = statusPayload['Absence (min)'];
      }
    }

    // Derive preset from speed state
    if (stateValue !== null) {
      state.preset = this.speedToPreset(stateValue);
    }

    return state;
  }

  static speedToPreset(speed: number): string | null {
    // Common Itho speed mappings
    if (speed === 0) return 'away';
    if (speed === 20) return 'low';
    if (speed === 120) return 'medium';
    if (speed === 220) return 'high';
    return null;
  }

  static presetToSpeed(preset: string): number | null {
    const presetMap: { [key: string]: number } = {
      'away': 0,
      'low': 20,
      'medium': 120,
      'high': 220
    };
    return presetMap[preset] ?? null;
  }

}



================================================
FILE: locales/en.json
================================================
{
  "settings": {
    "title": "Settings"
  }
}


================================================
FILE: locales/nl.json
================================================
{
  "settings": {
    "title": "Instellingen"
  }
}



================================================
FILE: settings/index.html
================================================
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 16px;
      background: transparent;
      color: #333;
    }
    h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .controls {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    select, button {
      font-family: inherit;
      font-size: 13px;
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
    }
    button {
      background: #FFA500;
      color: #fff;
      border-color: #FFA500;
      font-weight: 500;
    }
    button:hover {
      background: #e69500;
      border-color: #e69500;
    }
    button.secondary {
      background: #f5f5f5;
      color: #333;
      border-color: #ccc;
    }
    button.secondary:hover {
      background: #eee;
    }
    #log-area {
      width: 100%;
      min-height: 300px;
      max-height: 500px;
      overflow: auto;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Menlo', 'Consolas', 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.5;
      padding: 12px;
      border-radius: 8px;
      white-space: pre;
      box-sizing: border-box;
    }
    .status {
      font-size: 12px;
      color: #888;
      margin-top: 8px;
    }
  </style>
  <script type="text/javascript" src="/homey.js" data-origin="settings"></script>
</head>
<body>
  <h2>Device Logs</h2>
  <div class="controls">
    <select id="source-filter">
      <option value="">All sources</option>
      <option value="App">App</option>
      <option value="MQTT">MQTT Device</option>
      <option value="API">API Device</option>
    </select>
    <button id="btn-refresh" onclick="refreshLogs()">Retrieve Logs</button>
    <button id="btn-clear" class="secondary" onclick="clearLogs()">Clear Logs</button>
  </div>
  <div id="log-area">Click "Retrieve Logs" to load log entries.</div>
  <div class="status" id="status-text"></div>

  <script>
    var _homey = null;

    var sourceEndpoints = {
      '': '/getLogs',
      'App': '/getLogsApp',
      'MQTT': '/getLogsMqtt',
      'API': '/getLogsApi'
    };

    function onHomeyReady(Homey) {
      _homey = Homey;
      Homey.ready();
      setTimeout(function() { refreshLogs(); }, 200);
    }

    function refreshLogs() {
      if (!_homey) return;
      try {
        var source = document.getElementById('source-filter').value;
        var endpoint = sourceEndpoints[source] || '/getLogs';
        var statusEl = document.getElementById('status-text');
        statusEl.textContent = 'Loading...';

        _homey.api('GET', endpoint, function(err, result) {
          var logArea = document.getElementById('log-area');
          if (err) {
            logArea.textContent = 'Error: ' + (err.message || JSON.stringify(err));
            statusEl.textContent = 'Error loading logs.';
          } else {
            logArea.textContent = result || 'No log entries yet.';
            logArea.scrollTop = logArea.scrollHeight;
            var lines = (result || '').split('\n').filter(function(l) { return l.length > 0; });
            statusEl.textContent = lines.length + ' log entries loaded at ' + new Date().toLocaleTimeString();
          }
        });
      } catch (e) {
        document.getElementById('log-area').textContent = 'JS Error: ' + e.message;
      }
    }

    function clearLogs() {
      if (!_homey) return;
      try {
        _homey.api('GET', '/clearLogs', function(err) {
          if (!err) { refreshLogs(); }
        });
      } catch (e) {
        document.getElementById('log-area').textContent = 'JS Error: ' + e.message;
      }
    }
  </script>
</body>
</html>



================================================
FILE: .homeycompose/app.json
================================================
{
  "id": "nl.nrgwatch.itho",
  "version": "1.0.2",
  "compatibility": ">=5.0.0",
  "sdk": 3,
  "runtime": "nodejs",
  "platforms": [
    "local"
  ],
  "name": {
    "en": "NRG.Watch Itho add-on",
    "nl": "NRG.Watch Itho add-on"
  },
  "description": {
    "en": "Control and monitor your Itho ventilation system via MQTT or API in Homey (requires the NRG.Watch Itho add-on).",
    "nl": "Bedien en monitor je Itho ventilatiesysteem via MQTT of API in Homey (vereist de NRG.Watch Itho add-on)."
  },
  "category": [
    "climate"
  ],
  "brandColor": "#FFA500",
  "permissions": [],
  "images": {
    "small": "/assets/images/small.png",
    "large": "/assets/images/large.png",
    "xlarge": "/assets/images/xlarge.png"
  },
  "author": {
    "name": "Robert Coemans",
    "email": "r.coemans@hotmail.com"
  },
  "homepage": "https://github.com/rcoemans/nl.nrgwatch.itho",
  "support": "https://github.com/rcoemans/nl.nrgwatch.itho/issues",
  "source": "https://github.com/rcoemans/nl.nrgwatch.itho",
  "bugs": {
    "url": "https://github.com/rcoemans/nl.nrgwatch.itho/issues"
  },
  "api": {
    "getLogs": {
      "method": "GET",
      "path": "/getLogs"
    },
    "getLogsMqtt": {
      "method": "GET",
      "path": "/getLogsMqtt"
    },
    "getLogsApi": {
      "method": "GET",
      "path": "/getLogsApi"
    },
    "getLogsApp": {
      "method": "GET",
      "path": "/getLogsApp"
    },
    "clearLogs": {
      "method": "GET",
      "path": "/clearLogs"
    }
  }
}


================================================
FILE: .homeycompose/capabilities/itho_absolute_humidity.json
================================================
{
  "type": "number",
  "title": {
    "en": "Absolute Humidity",
    "nl": "Absolute Luchtvochtigheid"
  },
  "desc": {
    "en": "Absolute humidity",
    "nl": "Absolute luchtvochtigheid"
  },
  "units": {
    "en": "g/m³",
    "nl": "g/m³"
  },
  "icon": "/assets/icons/humidity.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "max": 100,
  "decimals": 1
}



================================================
FILE: .homeycompose/capabilities/itho_error_code.json
================================================
{
  "type": "number",
  "title": {
    "en": "Error Code",
    "nl": "Foutcode"
  },
  "desc": {
    "en": "Current error code (0 = no error)",
    "nl": "Huidige foutcode (0 = geen fout)"
  },
  "units": {
    "en": "",
    "nl": ""
  },
  "icon": "/assets/icons/alarm.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "max": 255,
  "decimals": 0
}



================================================
FILE: .homeycompose/capabilities/itho_exhaust_temperature.json
================================================
{
  "type": "number",
  "title": {
    "en": "Exhaust Temperature",
    "nl": "Afvoertemperatuur"
  },
  "desc": {
    "en": "Exhaust air temperature",
    "nl": "Afvoerlucht temperatuur"
  },
  "units": {
    "en": "°C",
    "nl": "°C"
  },
  "icon": "/assets/icons/thermometer.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "decimals": 1
}



================================================
FILE: .homeycompose/capabilities/itho_fan_preset.json
================================================
{
  "type": "enum",
  "title": {
    "en": "Fan Preset",
    "nl": "Ventilator Preset"
  },
  "desc": {
    "en": "Current fan preset mode",
    "nl": "Huidige ventilator preset modus"
  },
  "values": [
    {
      "id": "away",
      "title": {
        "en": "Away",
        "nl": "Afwezig"
      }
    },
    {
      "id": "low",
      "title": {
        "en": "Low",
        "nl": "Laag"
      }
    },
    {
      "id": "medium",
      "title": {
        "en": "Medium",
        "nl": "Middel"
      }
    },
    {
      "id": "high",
      "title": {
        "en": "High",
        "nl": "Hoog"
      }
    },
    {
      "id": "auto",
      "title": {
        "en": "Auto",
        "nl": "Auto"
      }
    },
    {
      "id": "autonight",
      "title": {
        "en": "Auto Night",
        "nl": "Auto Nacht"
      }
    },
    {
      "id": "cook30",
      "title": {
        "en": "Cook 30",
        "nl": "Koken 30"
      }
    },
    {
      "id": "cook60",
      "title": {
        "en": "Cook 60",
        "nl": "Koken 60"
      }
    },
    {
      "id": "timer1",
      "title": {
        "en": "Timer 1",
        "nl": "Timer 1"
      }
    },
    {
      "id": "timer2",
      "title": {
        "en": "Timer 2",
        "nl": "Timer 2"
      }
    },
    {
      "id": "timer3",
      "title": {
        "en": "Timer 3",
        "nl": "Timer 3"
      }
    }
  ],
  "getable": true,
  "setable": true,
  "uiComponent": "picker"
}



================================================
FILE: .homeycompose/capabilities/itho_fan_setpoint_rpm.json
================================================
{
  "type": "number",
  "title": {
    "en": "Fan Setpoint",
    "nl": "Ventilator Setpoint"
  },
  "desc": {
    "en": "Fan setpoint in RPM",
    "nl": "Ventilator setpoint in RPM"
  },
  "units": {
    "en": "rpm",
    "nl": "rpm"
  },
  "icon": "/assets/icons/performance.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "max": 3000,
  "decimals": 0
}



================================================
FILE: .homeycompose/capabilities/itho_fan_speed_raw.json
================================================
{
  "type": "number",
  "title": {
    "en": "Speed State (0-255)",
    "nl": "Snelheidsstatus (0-255)"
  },
  "desc": {
    "en": "Current speed state value (0-255)",
    "nl": "Huidige snelheidsstatuswaarde (0-255)"
  },
  "units": {
    "en": "",
    "nl": ""
  },
  "icon": "/assets/icons/performance.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "max": 255,
  "step": 1,
  "decimals": 0
}



================================================
FILE: .homeycompose/capabilities/itho_fan_speed_rpm.json
================================================
{
  "type": "number",
  "title": {
    "en": "Fan Speed",
    "nl": "Ventilatorsnelheid"
  },
  "desc": {
    "en": "Current fan speed in RPM",
    "nl": "Huidige ventilatorsnelheid in RPM"
  },
  "units": {
    "en": "rpm",
    "nl": "rpm"
  },
  "icon": "/assets/icons/performance.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "max": 3000,
  "decimals": 0
}



================================================
FILE: .homeycompose/capabilities/itho_online.json
================================================
{
  "type": "boolean",
  "title": {
    "en": "Online",
    "nl": "Online"
  },
  "desc": {
    "en": "Whether the device is online",
    "nl": "Of het apparaat online is"
  },
  "icon": "/assets/icons/on-off-button.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "insights": false
}



================================================
FILE: .homeycompose/capabilities/itho_startup_counter.json
================================================
{
  "type": "number",
  "title": {
    "en": "Startup Counter",
    "nl": "Opstart Teller"
  },
  "desc": {
    "en": "Number of startups",
    "nl": "Aantal keer opgestart"
  },
  "units": {
    "en": "",
    "nl": ""
  },
  "icon": "/assets/icons/counter.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "decimals": 0
}



================================================
FILE: .homeycompose/capabilities/itho_supply_temperature.json
================================================
{
  "type": "number",
  "title": {
    "en": "Supply Temperature",
    "nl": "Aanvoertemperatuur"
  },
  "desc": {
    "en": "Supply air temperature",
    "nl": "Aanvoerlucht temperatuur"
  },
  "units": {
    "en": "°C",
    "nl": "°C"
  },
  "icon": "/assets/icons/thermometer.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "decimals": 1
}



================================================
FILE: .homeycompose/capabilities/itho_total_operation.json
================================================
{
  "type": "number",
  "title": {
    "en": "Total Operation Hours",
    "nl": "Totaal Bedrijfsuren"
  },
  "desc": {
    "en": "Total operation hours",
    "nl": "Totaal aantal bedrijfsuren"
  },
  "units": {
    "en": "h",
    "nl": "u"
  },
  "icon": "/assets/icons/graph.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "decimals": 0
}



================================================
FILE: .homeycompose/capabilities/itho_ventilation_setpoint.json
================================================
{
  "type": "number",
  "title": {
    "en": "Ventilation Setpoint",
    "nl": "Ventilatie Setpoint"
  },
  "desc": {
    "en": "Ventilation setpoint percentage",
    "nl": "Ventilatie setpoint percentage"
  },
  "units": {
    "en": "%",
    "nl": "%"
  },
  "icon": "/assets/icons/performance.svg",
  "getable": true,
  "setable": false,
  "uiComponent": "sensor",
  "min": 0,
  "max": 100,
  "decimals": 0
}



================================================
FILE: .homeycompose/flow/actions/clear_queue.json
================================================
{
  "title": {
    "en": "Clear queued timers and commands",
    "nl": "Wis wachtrij met timers en commando's"
  },
  "hint": {
    "en": "Clears queued timers and returns to the fallback/base behavior",
    "nl": "Wist de wachtrij met timers en keert terug naar het standaard gedrag"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/mqtt_publish_advanced.json
================================================
{
  "title": {
    "en": "Send message with options",
    "nl": "Stuur bericht met opties"
  },
  "titleFormatted": {
    "en": "Send [[message]] on topic [[topic]] with QoS [[qos]] and retain [[retain]]",
    "nl": "Stuur [[message]] op topic [[topic]] met QoS [[qos]] en retain [[retain]]"
  },
  "hint": {
    "en": "Publishes a message to the specified MQTT topic with custom QoS and retain settings",
    "nl": "Publiceert een bericht naar het opgegeven MQTT topic met aangepaste QoS en retain instellingen"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt"
    },
    {
      "type": "text",
      "name": "message",
      "title": {
        "en": "Message",
        "nl": "Bericht"
      },
      "placeholder": {
        "en": "Message to send",
        "nl": "Te verzenden bericht"
      }
    },
    {
      "type": "text",
      "name": "topic",
      "title": {
        "en": "Topic",
        "nl": "Topic"
      },
      "placeholder": {
        "en": "mqtt/topic",
        "nl": "mqtt/topic"
      }
    },
    {
      "type": "dropdown",
      "name": "qos",
      "title": {
        "en": "Quality of Service",
        "nl": "Quality of Service"
      },
      "values": [
        {
          "id": "0",
          "label": {
            "en": "QoS 0 (At most once)",
            "nl": "QoS 0 (Hoogstens één keer)"
          }
        },
        {
          "id": "1",
          "label": {
            "en": "QoS 1 (At least once)",
            "nl": "QoS 1 (Minstens één keer)"
          }
        },
        {
          "id": "2",
          "label": {
            "en": "QoS 2 (Exactly once)",
            "nl": "QoS 2 (Precies één keer)"
          }
        }
      ]
    },
    {
      "type": "dropdown",
      "name": "retain",
      "title": {
        "en": "Retain",
        "nl": "Retain"
      },
      "values": [
        {
          "id": "false",
          "label": {
            "en": "False",
            "nl": "Nee"
          }
        },
        {
          "id": "true",
          "label": {
            "en": "True",
            "nl": "Ja"
          }
        }
      ]
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/mqtt_publish_simple.json
================================================
{
  "title": {
    "en": "Send message on topic",
    "nl": "Stuur bericht op topic"
  },
  "titleFormatted": {
    "en": "Send [[message]] on topic [[topic]]",
    "nl": "Stuur [[message]] op topic [[topic]]"
  },
  "hint": {
    "en": "Publishes a message to the specified MQTT topic with default QoS 0 and no retain",
    "nl": "Publiceert een bericht naar het opgegeven MQTT topic met standaard QoS 0 en geen retain"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt"
    },
    {
      "type": "text",
      "name": "message",
      "title": {
        "en": "Message",
        "nl": "Bericht"
      },
      "placeholder": {
        "en": "Message to send",
        "nl": "Te verzenden bericht"
      }
    },
    {
      "type": "text",
      "name": "topic",
      "title": {
        "en": "Topic",
        "nl": "Topic"
      },
      "placeholder": {
        "en": "mqtt/topic",
        "nl": "mqtt/topic"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/send_virtual_remote.json
================================================
{
  "title": {
    "en": "Send virtual remote command",
    "nl": "Stuur virtuele afstandsbediening commando"
  },
  "titleFormatted": {
    "en": "Send virtual remote command [[command]]",
    "nl": "Stuur virtuele afstandsbediening commando [[command]]"
  },
  "hint": {
    "en": "Emulates a configured virtual remote",
    "nl": "Emuleert een geconfigureerde virtuele afstandsbediening"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "dropdown",
      "name": "command",
      "title": {
        "en": "Command",
        "nl": "Commando"
      },
      "values": [
        {
          "id": "away",
          "label": {
            "en": "Away",
            "nl": "Afwezig"
          }
        },
        {
          "id": "low",
          "label": {
            "en": "Low",
            "nl": "Laag"
          }
        },
        {
          "id": "medium",
          "label": {
            "en": "Medium",
            "nl": "Middel"
          }
        },
        {
          "id": "high",
          "label": {
            "en": "High",
            "nl": "Hoog"
          }
        },
        {
          "id": "timer1",
          "label": {
            "en": "Timer 1",
            "nl": "Timer 1"
          }
        },
        {
          "id": "timer2",
          "label": {
            "en": "Timer 2",
            "nl": "Timer 2"
          }
        },
        {
          "id": "timer3",
          "label": {
            "en": "Timer 3",
            "nl": "Timer 3"
          }
        }
      ]
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/set_fan_preset.json
================================================
{
  "title": {
    "en": "Set the fan preset",
    "nl": "Stel de ventilator preset in"
  },
  "titleFormatted": {
    "en": "Set the fan preset to [[preset]]",
    "nl": "Stel de ventilator preset in op [[preset]]"
  },
  "hint": {
    "en": "Sends a preset command such as low, medium, or high",
    "nl": "Stuurt een preset commando zoals laag, middel of hoog"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "dropdown",
      "name": "preset",
      "title": {
        "en": "Preset",
        "nl": "Preset"
      },
      "values": [
        {
          "id": "away",
          "label": {
            "en": "Away",
            "nl": "Afwezig"
          }
        },
        {
          "id": "low",
          "label": {
            "en": "Low",
            "nl": "Laag"
          }
        },
        {
          "id": "medium",
          "label": {
            "en": "Medium",
            "nl": "Middel"
          }
        },
        {
          "id": "high",
          "label": {
            "en": "High",
            "nl": "Hoog"
          }
        },
        {
          "id": "auto",
          "label": {
            "en": "Auto",
            "nl": "Auto"
          }
        },
        {
          "id": "autonight",
          "label": {
            "en": "Auto Night",
            "nl": "Auto Nacht"
          }
        },
        {
          "id": "cook30",
          "label": {
            "en": "Cook 30",
            "nl": "Koken 30"
          }
        },
        {
          "id": "cook60",
          "label": {
            "en": "Cook 60",
            "nl": "Koken 60"
          }
        },
        {
          "id": "timer1",
          "label": {
            "en": "Timer 1",
            "nl": "Timer 1"
          }
        },
        {
          "id": "timer2",
          "label": {
            "en": "Timer 2",
            "nl": "Timer 2"
          }
        },
        {
          "id": "timer3",
          "label": {
            "en": "Timer 3",
            "nl": "Timer 3"
          }
        }
      ]
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/set_fan_speed.json
================================================
{
  "title": {
    "en": "Set the fan speed",
    "nl": "Stel de ventilatorsnelheid in"
  },
  "titleFormatted": {
    "en": "Set the fan speed to [[speed]]",
    "nl": "Stel de ventilatorsnelheid in op [[speed]]"
  },
  "hint": {
    "en": "Sets the raw fan speed value in the supported range 0-255",
    "nl": "Stelt de ruwe ventilatorsnelheid in binnen het bereik 0-255"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "speed",
      "title": {
        "en": "Speed (0-255)",
        "nl": "Snelheid (0-255)"
      },
      "min": 0,
      "max": 255,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/set_speed_with_timer.json
================================================
{
  "title": {
    "en": "Set the fan speed with timer",
    "nl": "Stel de ventilatorsnelheid in met timer"
  },
  "titleFormatted": {
    "en": "Set the fan speed to [[speed]] for [[seconds]] seconds",
    "nl": "Stel de ventilatorsnelheid in op [[speed]] voor [[seconds]] seconden"
  },
  "hint": {
    "en": "Sets the fan speed with a timer",
    "nl": "Stelt de ventilatorsnelheid in met een timer"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "speed",
      "title": {
        "en": "Speed (0-255)",
        "nl": "Snelheid (0-255)"
      },
      "min": 0,
      "max": 255,
      "step": 1
    },
    {
      "type": "number",
      "name": "seconds",
      "title": {
        "en": "Seconds",
        "nl": "Seconden"
      },
      "min": 0,
      "max": 65535,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/actions/start_timer.json
================================================
{
  "title": {
    "en": "Start a timer",
    "nl": "Start een timer"
  },
  "titleFormatted": {
    "en": "Start a timer for [[seconds]] seconds",
    "nl": "Start een timer voor [[seconds]] seconden"
  },
  "hint": {
    "en": "Starts a timed fan action. The exact resulting speed depends on the linked preset or speed.",
    "nl": "Start een getimede ventilator actie. De exacte resulterende snelheid hangt af van de gekoppelde preset of snelheid."
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "seconds",
      "title": {
        "en": "Seconds",
        "nl": "Seconden"
      },
      "min": 0,
      "max": 65535,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/device_has_error.json
================================================
{
  "title": {
    "en": "The Itho device !{{has|does not have}} an error",
    "nl": "Het Itho apparaat !{{heeft|heeft geen}} fout"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/device_is_online.json
================================================
{
  "title": {
    "en": "The Itho device !{{is|is not}} online",
    "nl": "Het Itho apparaat !{{is|is niet}} online"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/fan_preset_is.json
================================================
{
  "title": {
    "en": "The fan preset is...",
    "nl": "De ventilator preset is..."
  },
  "titleFormatted": {
    "en": "The fan preset !{{is|is not}} [[preset]]",
    "nl": "De ventilator preset !{{is|is niet}} [[preset]]"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "dropdown",
      "name": "preset",
      "title": {
        "en": "Preset",
        "nl": "Preset"
      },
      "values": [
        {
          "id": "away",
          "label": {
            "en": "Away",
            "nl": "Afwezig"
          }
        },
        {
          "id": "low",
          "label": {
            "en": "Low",
            "nl": "Laag"
          }
        },
        {
          "id": "medium",
          "label": {
            "en": "Medium",
            "nl": "Middel"
          }
        },
        {
          "id": "high",
          "label": {
            "en": "High",
            "nl": "Hoog"
          }
        },
        {
          "id": "auto",
          "label": {
            "en": "Auto",
            "nl": "Auto"
          }
        },
        {
          "id": "autonight",
          "label": {
            "en": "Auto Night",
            "nl": "Auto Nacht"
          }
        }
      ]
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/fan_speed_above.json
================================================
{
  "title": {
    "en": "The fan speed is...",
    "nl": "De ventilatorsnelheid is..."
  },
  "titleFormatted": {
    "en": "The fan speed !{{is|is not}} above [[speed]]",
    "nl": "De ventilatorsnelheid !{{is|is niet}} boven [[speed]]"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "speed",
      "title": {
        "en": "Speed (0-255)",
        "nl": "Snelheid (0-255)"
      },
      "min": 0,
      "max": 255,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/fan_speed_below.json
================================================
{
  "title": {
    "en": "The fan speed is...",
    "nl": "De ventilatorsnelheid is..."
  },
  "titleFormatted": {
    "en": "The fan speed !{{is|is not}} below [[speed]]",
    "nl": "De ventilatorsnelheid !{{is|is niet}} onder [[speed]]"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "speed",
      "title": {
        "en": "Speed (0-255)",
        "nl": "Snelheid (0-255)"
      },
      "min": 0,
      "max": 255,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/fan_speed_equal.json
================================================
{
  "title": {
    "en": "The fan speed is...",
    "nl": "De ventilatorsnelheid is..."
  },
  "titleFormatted": {
    "en": "The fan speed !{{is|is not}} [[speed]]",
    "nl": "De ventilatorsnelheid !{{is|is niet}} [[speed]]"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "speed",
      "title": {
        "en": "Speed (0-255)",
        "nl": "Snelheid (0-255)"
      },
      "min": 0,
      "max": 255,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/humidity_above.json
================================================
{
  "title": {
    "en": "The humidity is...",
    "nl": "De luchtvochtigheid is..."
  },
  "titleFormatted": {
    "en": "The humidity !{{is|is not}} above [[humidity]] %",
    "nl": "De luchtvochtigheid !{{is|is niet}} boven [[humidity]] %"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "humidity",
      "title": {
        "en": "Humidity",
        "nl": "Luchtvochtigheid"
      },
      "min": 0,
      "max": 100,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/humidity_below.json
================================================
{
  "title": {
    "en": "The humidity is...",
    "nl": "De luchtvochtigheid is..."
  },
  "titleFormatted": {
    "en": "The humidity !{{is|is not}} below [[humidity]] %",
    "nl": "De luchtvochtigheid !{{is|is niet}} onder [[humidity]] %"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "humidity",
      "title": {
        "en": "Humidity",
        "nl": "Luchtvochtigheid"
      },
      "min": 0,
      "max": 100,
      "step": 1
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/mqtt_broker_connected.json
================================================
{
  "title": {
    "en": "MQTT broker !{{is|is not}} connected",
    "nl": "MQTT broker !{{is|is niet}} verbonden"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt"
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/temperature_above.json
================================================
{
  "title": {
    "en": "The temperature is...",
    "nl": "De temperatuur is..."
  },
  "titleFormatted": {
    "en": "The temperature !{{is|is not}} above [[temperature]] °C",
    "nl": "De temperatuur !{{is|is niet}} boven [[temperature]] °C"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "temperature",
      "title": {
        "en": "Temperature",
        "nl": "Temperatuur"
      },
      "min": -20,
      "max": 50,
      "step": 0.5
    }
  ]
}



================================================
FILE: .homeycompose/flow/conditions/temperature_below.json
================================================
{
  "title": {
    "en": "The temperature is...",
    "nl": "De temperatuur is..."
  },
  "titleFormatted": {
    "en": "The temperature !{{is|is not}} below [[temperature]] °C",
    "nl": "De temperatuur !{{is|is niet}} onder [[temperature]] °C"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    },
    {
      "type": "number",
      "name": "temperature",
      "title": {
        "en": "Temperature",
        "nl": "Temperatuur"
      },
      "min": -20,
      "max": 50,
      "step": 0.5
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/command_failed.json
================================================
{
  "title": {
    "en": "A command failed",
    "nl": "Een commando is mislukt"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "command_name",
      "type": "string",
      "title": {
        "en": "Command name",
        "nl": "Commando naam"
      }
    },
    {
      "name": "command_value",
      "type": "string",
      "title": {
        "en": "Command value",
        "nl": "Commando waarde"
      }
    },
    {
      "name": "error_message",
      "type": "string",
      "title": {
        "en": "Error message",
        "nl": "Foutmelding"
      }
    },
    {
      "name": "transport",
      "type": "string",
      "title": {
        "en": "Transport",
        "nl": "Transport"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/command_sent_success.json
================================================
{
  "title": {
    "en": "A command was sent successfully",
    "nl": "Een commando is succesvol verzonden"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "command_name",
      "type": "string",
      "title": {
        "en": "Command name",
        "nl": "Commando naam"
      }
    },
    {
      "name": "command_value",
      "type": "string",
      "title": {
        "en": "Command value",
        "nl": "Commando waarde"
      }
    },
    {
      "name": "transport",
      "type": "string",
      "title": {
        "en": "Transport",
        "nl": "Transport"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/device_offline.json
================================================
{
  "title": {
    "en": "The Itho device went offline",
    "nl": "Het Itho apparaat is offline gegaan"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "device_name",
      "type": "string",
      "title": {
        "en": "Device name",
        "nl": "Apparaatnaam"
      }
    },
    {
      "name": "transport",
      "type": "string",
      "title": {
        "en": "Transport",
        "nl": "Transport"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/device_online.json
================================================
{
  "title": {
    "en": "The Itho device came online",
    "nl": "Het Itho apparaat is online gekomen"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "device_name",
      "type": "string",
      "title": {
        "en": "Device name",
        "nl": "Apparaatnaam"
      }
    },
    {
      "name": "transport",
      "type": "string",
      "title": {
        "en": "Transport",
        "nl": "Transport"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/error_state_changed.json
================================================
{
  "title": {
    "en": "The error state changed",
    "nl": "De foutstatus is veranderd"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "error_code",
      "type": "number",
      "title": {
        "en": "Error code",
        "nl": "Foutcode"
      }
    },
    {
      "name": "previous_error_code",
      "type": "number",
      "title": {
        "en": "Previous error code",
        "nl": "Vorige foutcode"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/fan_preset_changed.json
================================================
{
  "title": {
    "en": "The fan preset changed",
    "nl": "De ventilator preset is veranderd"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "preset",
      "type": "string",
      "title": {
        "en": "Preset",
        "nl": "Preset"
      }
    },
    {
      "name": "previous_preset",
      "type": "string",
      "title": {
        "en": "Previous preset",
        "nl": "Vorige preset"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/fan_speed_changed.json
================================================
{
  "title": {
    "en": "The fan speed changed",
    "nl": "De ventilatorsnelheid is veranderd"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "speed_raw",
      "type": "number",
      "title": {
        "en": "Speed (raw)",
        "nl": "Snelheid (raw)"
      }
    },
    {
      "name": "speed_percent",
      "type": "number",
      "title": {
        "en": "Speed (%)",
        "nl": "Snelheid (%)"
      }
    },
    {
      "name": "previous_speed_raw",
      "type": "number",
      "title": {
        "en": "Previous speed (raw)",
        "nl": "Vorige snelheid (raw)"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/humidity_changed.json
================================================
{
  "title": {
    "en": "The humidity changed",
    "nl": "De luchtvochtigheid is veranderd"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "humidity",
      "type": "number",
      "title": {
        "en": "Humidity",
        "nl": "Luchtvochtigheid"
      }
    },
    {
      "name": "previous_humidity",
      "type": "number",
      "title": {
        "en": "Previous humidity",
        "nl": "Vorige luchtvochtigheid"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/mqtt_broker_connected.json
================================================
{
  "title": {
    "en": "MQTT broker connected",
    "nl": "MQTT broker verbonden"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt"
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/mqtt_broker_disconnected.json
================================================
{
  "title": {
    "en": "MQTT broker disconnected",
    "nl": "MQTT broker verbinding verbroken"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt"
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/mqtt_message_received.json
================================================
{
  "title": {
    "en": "Message received on topic",
    "nl": "Bericht ontvangen op topic"
  },
  "titleFormatted": {
    "en": "Message received on topic [[topic]]",
    "nl": "Bericht ontvangen op topic [[topic]]"
  },
  "hint": {
    "en": "Triggers when a message is received on the specified MQTT topic. Supports wildcards: + (single level) and # (multi level).",
    "nl": "Triggert wanneer een bericht wordt ontvangen op het opgegeven MQTT topic. Ondersteunt wildcards: + (enkel niveau) en # (meerdere niveaus)."
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt"
    },
    {
      "type": "text",
      "name": "topic",
      "title": {
        "en": "Topic",
        "nl": "Topic"
      },
      "placeholder": {
        "en": "broker/+/something/#",
        "nl": "broker/+/iets/#"
      }
    }
  ],
  "tokens": [
    {
      "name": "message",
      "type": "string",
      "title": {
        "en": "Message received",
        "nl": "Ontvangen bericht"
      }
    },
    {
      "name": "topic",
      "type": "string",
      "title": {
        "en": "Topic",
        "nl": "Topic"
      }
    }
  ]
}



================================================
FILE: .homeycompose/flow/triggers/temperature_changed.json
================================================
{
  "title": {
    "en": "The temperature changed",
    "nl": "De temperatuur is veranderd"
  },
  "args": [
    {
      "type": "device",
      "name": "device",
      "filter": "driver_id=itho-mqtt|itho-api"
    }
  ],
  "tokens": [
    {
      "name": "temperature",
      "type": "number",
      "title": {
        "en": "Temperature",
        "nl": "Temperatuur"
      }
    },
    {
      "name": "previous_temperature",
      "type": "number",
      "title": {
        "en": "Previous temperature",
        "nl": "Vorige temperatuur"
      }
    }
  ]
}


