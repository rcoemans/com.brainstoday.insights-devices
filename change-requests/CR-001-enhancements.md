---
id: CR-001
type: change-request
status: new
date: 2026-03-18
source: user input
---

# CR-001: Enhancements

## Questions

- I have installed the 'NRG-Watch Itho CVE' device on two Homey's both having a Itho CVE connected, on one Homey when looking at the Itho CVE device I see the options which I can set: Low, Medium, High, Timer 1, Timer 2 and Timer 3. On the other Homey when looking at the Itho CVE device I don't have these options. So it seems there is nothing wrong with the app but likely related to what is received via the various MQTT topics. Can you check and let me know?

## Change requests

### Common

- As we already build a full MQTT client in this app, I want to add some MQTT generic flow cards so this app can also act as a generic MQTT client:
  - Trigger card(s):
    - 'Trigger when a message is received on {Topic}':
	  - {Topic} = String
	  - Available TAGs:
		- Informational text: "Wanneer deze kaart start worden de volgende tags beschikbaar om te gebruiken."
	    - 'Message received', informational text for tag: "Received message"
		- 'Name Topic', informational text for tag: "broker/+/something/#"
  - Action cards:
    - 'Send {Message} on topic {Topic}':
	  - {Message} = String
	  - {Topic} = String
	- 'Send {Message} on topic {Topic} with QoS {Quality of Service} and retain {retain value}':
	  - {Message} = String
	  - {Topic} = String
	  - {Quality of Service} options are: 'QoS 0', 'QoS 1' and 'QoS 2'
	  - {{retain value}} options are: 'True' and 'False'

- Remove Flow cards, Homey App title etc. from /README.txt and /README.nl.txt files in order to cope with Homey SDK requirements. Note: leave README.md untouched!

### Awtrix 3 device

- On the 'Awtrix 3' device in settings we have added the 'Information' section which says: 'For more information about Awtrix 3, visit: https://blueforcer.github.io/awtrix3/#/'. I want a similar 'Information section for the 'Itho CVE' device but there it should say: 'For more information about NRG.Watch, visit: https://www.nrgwatch.nl/'.

- For most capabilities for the 'Awtrix 3' device, such as: 'Online', 'IP Address', 'Firmware Version', 'Current App', 'Messages', 'Uptime', 'Wifi Signal' and 'Brightness', the icon.svg from the 'Insights Devices' app is being used where I want to use the icon.svg file from the 'Awtrix 3' device.

### Itho CVE device

- The table below shows some more details on itho/ithostatus topic, please analyze and see if it makes sense to update anything, like for capabilities or informational text on Trigger, Condition and/or Action flow cards:

| Label                           | Value         |
|---------------------------------|---------------|
| temp                            | 22.1          |
| hum                             | 40.4          |
| ppmw                            | 6790          |
| Ventilation setpoint (%)        | 44            |
| Fan setpoint (rpm)              | 1134          |
| Fan speed (rpm)                 | 1134          |
| Error                           | 0             |
| Selection                       | 7             |
| Startup counter                 | 700           |
| Total operation (hours)         | 27025         |
| Absence (min)                   | 0             |
| Highest CO2 concentration (ppm) | 20            |
| Highest RH concentration (%)    | 40            |
| RelativeHumidity                | 40.42         |
| Temperature                     | 22.14         |

- The table below shows some more details on the available topics, please analyze and see if it makes sense to update anything, like for capabilities or informational text on Trigger, Condition and/or Action flow cards. Also add the missing MQTT topic `itho/remotesinfo` to the device settings. Note that remotesinfo mostly returns `{}` only, so for now just add so it is there for future enhancements, such as perhaps new capabilities to be added based on whatever is returned by remotesinfo:

| Topic type:       | Topic name:      | Use:                                                                             |
|-------------------|------------------|----------------------------------------------------------------------------------|
| State             | itho/state       | Contains a 0-255 value representing the PWM2I2C speed setting                    |
| Itho status       | itho/ithostatus  | Contains JSON with info from Itho firmware (same info as under menu Itho status) |
| Remotes info      | itho/remotesinfo | Contains JSON with info from RF devices paired to the add-on                     |
| Last command info | itho/lastcmd     | Contains the last command received on the API                                    |
| Command           | itho/cmd         | Commands posted to this topic will be processed by the MQTTAPI                   |
| Last will         | itho/lwt         | Last will online/offline info topic                                              |

- This is the description for `remotesinfo`: "Returns JSON with all configured remotes where key=remote name, value is JSON with all received capabilities of the remote. Depending on make and model this can be the last command, temperature, humidity, battery and/or co2 levels."

- Also here: https://community.homey.app/t/tutorial-pro-basic-mqtt-setup-connect-itho-daalderop-nrg-watch-interface/139521?page=2 some more details can be found, please analyze and see if it makes sense to update anything, like for capabilities or informational text on Trigger, Condition and/or Action flow cards. Note that I don't want to make use of the API, I want to stick with MQTT.

## Tasks

- Apply the changes.
- Update README files:
  - /README.md
  - /README.txt
  - /README.nl.txt



---



Some more changes:

## Changes

### Common

- As we already build a full MQTT client in this app, I want to add some MQTT generic flow cards so this app can also act as a generic MQTT client:
  - Trigger card(s):
    - 'Trigger when a message is received on {Topic}':
	  - {Topic} = String
	  - Available TAGs:
		- Informational text: "Wanneer deze kaart start worden de volgende tags beschikbaar om te gebruiken."
	    - 'Message received', informational text for tag: "Received message"
		- 'Name Topic', informational text for tag: "broker/+/something/#"

### Awtrix 3 device

- The capability for the 'Awtrix 3' device: 'Uptime' is in seconds, I want to have this calculated into hours.

## Tasks

- Apply the changes.
- Update README files to reflect the changes:
  - /README.md
  - /README.txt
  - /README.nl.txt