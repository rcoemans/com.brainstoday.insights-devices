'use strict';

import Homey from 'homey';

module.exports = class CustomMQTTSensorDriver extends Homey.Driver {

  async onInit() {
    this.log('Custom MQTT Sensor driver initialized');
    
    this.homey.flow.getDeviceTriggerCard('custom_sensor_value_changed');
    this.homey.flow.getDeviceTriggerCard('custom_sensor_calculated_changed');
  }

  async onPair(session: any) {
    let deviceConfig: any = {
      name: 'Custom MQTT Sensor',
      topic: '',
      payloadType: 'number',
      sourceMappings: [],
      calculatedFields: []
    };

    session.setHandler('list_devices', async () => {
      return [{
        name: deviceConfig.name || 'Custom MQTT Sensor',
        data: {
          id: `custom_mqtt_${Date.now()}`,
          sourceMappings: deviceConfig.sourceMappings || [],
          calculatedFields: deviceConfig.calculatedFields || []
        },
        settings: {
          mqtt_topic: deviceConfig.topic || '',
          payload_type: deviceConfig.payloadType || 'number'
        }
      }];
    });

    session.setHandler('configure_device', async (data: any) => {
      deviceConfig = {
        ...deviceConfig,
        ...data
      };
      return true;
    });
  }

};
