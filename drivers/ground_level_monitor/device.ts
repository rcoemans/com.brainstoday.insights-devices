'use strict';

import Homey from 'homey';

module.exports = class GroundLevelMonitorDevice extends Homey.Device {

  private messageHandler?: (topic: string, message: Buffer) => void;

  async onInit() {
    this.log('Ground Level Monitor device initialized');
    
    const topic = this.getSetting('mqtt_topic');
    if (topic) {
      this.subscribeToTopic(topic);
    }
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
    this.log('Ground Level Monitor device deleted');
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
      const payload = message.toString().trim();
      const level = parseFloat(payload);

      if (isNaN(level)) {
        this.error('Invalid payload: not a valid number');
        return;
      }

      const roundedLevel = Number(level.toFixed(1));
      const oldLevel = this.getCapabilityValue('ground_level');

      this.setCapabilityValue('ground_level', roundedLevel).catch(this.error);

      if (oldLevel !== roundedLevel) {
        this.homey.flow.getDeviceTriggerCard('ground_level_changed')
          .trigger(this, { value: roundedLevel })
          .catch(this.error);
      }

      const threshold = this.getSetting('alarm_threshold') as number;
      if (threshold > 0 && roundedLevel > threshold) {
        this.log(`Ground level ${roundedLevel} exceeds threshold ${threshold}`);
      }

      this.log(`Updated: Ground Level=${roundedLevel} ${this.getSetting('unit')}`);
    } catch (error) {
      this.error('Failed to parse MQTT message:', error);
    }
  }

};
