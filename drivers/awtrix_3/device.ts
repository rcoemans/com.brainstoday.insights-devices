'use strict';

import Homey from 'homey';

interface AwtrixStatsPayload {
  bat?: number;
  bat_raw?: number;
  type?: number;
  lux?: number;
  ldr_raw?: number;
  ram?: number;
  bri?: number;
  temp?: number;
  hum?: number;
  uptime?: number;
  wifi_signal?: number;
  messages?: number;
  version?: string;
  indicator1?: boolean;
  indicator2?: boolean;
  indicator3?: boolean;
  app?: string;
  uid?: string;
  matrix?: boolean;
  ip_address?: string;
}

module.exports = class Awtrix3Device extends Homey.Device {

  private messageHandler?: (topic: string, message: Buffer) => void;
  private statsTopicFull?: string;

  async onInit() {
    this.log('Awtrix 3 device initialized');

    // Register capability listeners for flow triggers
    this.registerCapabilityListener('measure_temperature', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_temperature_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('measure_humidity', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_humidity_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('awtrix_brightness', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_brightness_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('measure_luminance', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_luminance_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('awtrix_wifi_signal', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_signal_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('measure_battery', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_battery_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('awtrix_messages', async () => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_messages_changed')
        .trigger(this)
        .catch(this.error);
    });

    this.registerCapabilityListener('awtrix_app', async (value) => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_app_changed')
        .trigger(this, { app: value })
        .catch(this.error);
    });

    this.registerCapabilityListener('awtrix_online', async (value) => {
      await this.homey.flow.getDeviceTriggerCard('awtrix_online_changed')
        .trigger(this, { online: value })
        .catch(this.error);
    });

    const baseTopic = this.getSetting('base_topic');
    const statsTopic = this.getSetting('stats_topic');
    
    if (baseTopic && statsTopic) {
      this.statsTopicFull = `${baseTopic}/${statsTopic}`;
      this.subscribeToTopic(this.statsTopicFull);
    }

    this.setCapabilityValue('awtrix_online', false).catch(this.error);
  }

  async onSettings({ oldSettings, newSettings, changedKeys }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    const topicChanged = changedKeys.some(key => 
      ['base_topic', 'stats_topic'].includes(key)
    );

    if (topicChanged) {
      if (this.statsTopicFull && this.messageHandler) {
        this.unsubscribeFromTopic(this.statsTopicFull);
      }

      const baseTopic = newSettings.base_topic as string;
      const statsTopic = newSettings.stats_topic as string;
      
      if (baseTopic && statsTopic) {
        this.statsTopicFull = `${baseTopic}/${statsTopic}`;
        this.subscribeToTopic(this.statsTopicFull);
      }
    }
  }

  async onDeleted() {
    this.log('Awtrix 3 device deleted');
    if (this.statsTopicFull && this.messageHandler) {
      this.unsubscribeFromTopic(this.statsTopicFull);
    }
  }

  private subscribeToTopic(topic: string) {
    const app = this.homey.app as any;

    this.messageHandler = (receivedTopic: string, message: Buffer) => {
      if (receivedTopic === topic) {
        this.handleStatsMessage(message);
      }
    };

    app.mqttManager.subscribe(topic, this.messageHandler);
    this.log(`Subscribed to stats topic: ${topic}`);
  }

  private unsubscribeFromTopic(topic: string) {
    if (!this.messageHandler) return;

    const app = this.homey.app as any;
    app.mqttManager.unsubscribe(topic, this.messageHandler);
    this.log(`Unsubscribed from topic: ${topic}`);
  }

  private handleStatsMessage(message: Buffer) {
    try {
      const payload = message.toString();
      const data: AwtrixStatsPayload = JSON.parse(payload);

      this.setCapabilityValue('awtrix_online', true).catch(this.error);

      if (typeof data.temp === 'number' && !isNaN(data.temp)) {
        this.setCapabilityValue('measure_temperature', data.temp).catch(this.error);
      }

      if (typeof data.hum === 'number' && !isNaN(data.hum)) {
        this.setCapabilityValue('measure_humidity', data.hum).catch(this.error);
      }

      if (typeof data.bri === 'number' && !isNaN(data.bri)) {
        this.setCapabilityValue('awtrix_brightness', data.bri).catch(this.error);
      }

      if (typeof data.lux === 'number' && !isNaN(data.lux)) {
        this.setCapabilityValue('measure_luminance', data.lux).catch(this.error);
      }

      if (typeof data.wifi_signal === 'number' && !isNaN(data.wifi_signal)) {
        this.setCapabilityValue('awtrix_wifi_signal', data.wifi_signal).catch(this.error);
      }

      if (typeof data.bat === 'number' && !isNaN(data.bat)) {
        this.setCapabilityValue('measure_battery', data.bat).catch(this.error);
      }

      if (typeof data.uptime === 'number' && !isNaN(data.uptime)) {
        // Convert seconds to hours
        const uptimeHours = Number((data.uptime / 3600).toFixed(2));
        this.setCapabilityValue('awtrix_uptime', uptimeHours).catch(this.error);
      }

      if (typeof data.messages === 'number' && !isNaN(data.messages)) {
        this.setCapabilityValue('awtrix_messages', data.messages).catch(this.error);
      }

      if (typeof data.app === 'string') {
        this.setCapabilityValue('awtrix_app', data.app).catch(this.error);
      }

      if (typeof data.version === 'string') {
        this.setCapabilityValue('awtrix_version', data.version).catch(this.error);
      }

      if (typeof data.ip_address === 'string') {
        this.setCapabilityValue('awtrix_ip', data.ip_address).catch(this.error);
      }

      this.log('Awtrix stats updated from MQTT');
    } catch (error) {
      this.error('Failed to parse Awtrix stats message:', error);
    }
  }

  async publishToTopic(topic: string, payload: any) {
    try {
      const app = this.homey.app as any;
      const baseTopic = this.getSetting('base_topic');
      const fullTopic = `${baseTopic}/${topic}`;
      
      const message = JSON.stringify(payload);
      app.mqttManager.publish(fullTopic, message);
      this.log(`Published to ${fullTopic}:`, message);
    } catch (error) {
      this.error('Failed to publish MQTT message:', error);
      throw error;
    }
  }

  async sendNotification(text: string, color?: string, duration?: number, icon?: string) {
    const notifyTopic = this.getSetting('notify_topic');
    const payload: any = { text };
    
    if (color) payload.color = color;
    if (duration) payload.duration = duration;
    if (icon) payload.icon = icon;
    
    await this.publishToTopic(notifyTopic, payload);
  }

  async sendCustomApp(name: string, text: string, color?: string, icon?: string, lifetime?: number) {
    const customTopic = this.getSetting('custom_topic');
    const payload: any = { name, text };
    
    if (color) payload.color = color;
    if (icon) payload.icon = icon;
    if (lifetime) payload.lifetime = lifetime;
    
    await this.publishToTopic(customTopic, payload);
  }

  async removeCustomApp(name: string) {
    const customTopic = this.getSetting('custom_topic');
    await this.publishToTopic(customTopic, { name });
  }

  async clearScreen() {
    const customTopic = this.getSetting('custom_topic');
    await this.publishToTopic(customTopic, { name: 'clear' });
  }

  async setBrightness(brightness: number) {
    const customTopic = this.getSetting('custom_topic');
    await this.publishToTopic(customTopic, { bri: brightness });
  }

};
