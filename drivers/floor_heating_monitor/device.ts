'use strict';

import Homey from 'homey';

interface FloorHeatingData {
  flow?: number;
  return?: number;
}

module.exports = class FloorHeatingMonitorDevice extends Homey.Device {

  private messageHandler?: (topic: string, message: Buffer) => void;

  async onInit() {
    this.log('Floor Heating Monitor device initialized');
    
    const topic = this.getSetting('mqtt_topic');
    if (topic) {
      this.subscribeToTopic(topic);
    }

    this.registerCapabilityListener('measure_temperature.flow', async () => {
      return this.getCapabilityValue('measure_temperature.flow');
    });

    this.registerCapabilityListener('measure_temperature.return', async () => {
      return this.getCapabilityValue('measure_temperature.return');
    });

    this.registerCapabilityListener('measure_temperature.delta', async () => {
      return this.getCapabilityValue('measure_temperature.delta');
    });
  }

  async onSettings({ oldSettings, newSettings, changedKeys }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    if (changedKeys.includes('mqtt_topic')) {
      const oldTopic = oldSettings.mqtt_topic as string;
      const newTopic = newSettings.mqtt_topic as string;
      
      if (oldTopic && this.messageHandler) {
        this.unsubscribeFromTopic(oldTopic);
      }
      
      if (newTopic) {
        this.subscribeToTopic(newTopic);
      }
    }
  }

  async onDeleted() {
    this.log('Floor Heating Monitor device deleted');
    const topic = this.getSetting('mqtt_topic');
    if (topic && this.messageHandler) {
      this.unsubscribeFromTopic(topic);
    }
  }

  private subscribeToTopic(topic: string) {
    const app = this.homey.app as any;
    
    this.messageHandler = (receivedTopic: string, message: Buffer) => {
      if (receivedTopic === topic) {
        this.handleMessage(message);
      }
    };

    app.mqttManager.subscribe(topic, this.messageHandler);
    this.log(`Subscribed to topic: ${topic}`);
  }

  private unsubscribeFromTopic(topic: string) {
    if (!this.messageHandler) return;
    
    const app = this.homey.app as any;
    app.mqttManager.unsubscribe(topic, this.messageHandler);
    this.log(`Unsubscribed from topic: ${topic}`);
  }

  private handleMessage(message: Buffer) {
    try {
      const payload = message.toString();
      const data: FloorHeatingData = JSON.parse(payload);

      if (typeof data.flow === 'number' && typeof data.return === 'number') {
        const flow = Number(data.flow.toFixed(1));
        const returnTemp = Number(data.return.toFixed(1));
        const delta = Number((flow - returnTemp).toFixed(1));

        const oldFlow = this.getCapabilityValue('measure_temperature.flow');
        const oldReturn = this.getCapabilityValue('measure_temperature.return');
        const oldDelta = this.getCapabilityValue('measure_temperature.delta');

        this.setCapabilityValue('measure_temperature.flow', flow).catch(this.error);
        this.setCapabilityValue('measure_temperature.return', returnTemp).catch(this.error);
        this.setCapabilityValue('measure_temperature.delta', delta).catch(this.error);

        if (oldFlow !== flow) {
          this.homey.flow.getDeviceTriggerCard('flow_temperature_changed')
            .trigger(this, { value: flow })
            .catch(this.error);
        }

        if (oldReturn !== returnTemp) {
          this.homey.flow.getDeviceTriggerCard('return_temperature_changed')
            .trigger(this, { value: returnTemp })
            .catch(this.error);
        }

        if (oldDelta !== delta) {
          this.homey.flow.getDeviceTriggerCard('delta_t_changed')
            .trigger(this, { value: delta })
            .catch(this.error);
        }

        this.log(`Updated: Flow=${flow}°C, Return=${returnTemp}°C, Delta=${delta}°C`);
      } else {
        this.error('Invalid payload: missing flow or return temperature');
      }
    } catch (error) {
      this.error('Failed to parse MQTT message:', error);
    }
  }

};
