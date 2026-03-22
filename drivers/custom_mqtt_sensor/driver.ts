'use strict';

import Homey from 'homey';

module.exports = class CustomMQTTSensorDriver extends Homey.Driver {

  async onInit() {
    this.log('Custom MQTT Sensor driver initialized');
    
    this.homey.flow.getDeviceTriggerCard('custom_sensor_value_changed');
    this.homey.flow.getDeviceTriggerCard('custom_sensor_calculated_changed');
  }

  async onPairListDevices() {
    return [
      {
        name: 'Custom MQTT Sensor',
        data: {
          id: `custom_mqtt_${Date.now()}`,
          sourceMappings: [],
          calculatedFields: []
        },
        settings: {
          mqtt_topic: '',
          payload_type: 'number'
        }
      }
    ];
  }

};
