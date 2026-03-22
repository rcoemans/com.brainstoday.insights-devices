'use strict';

import Homey from 'homey';

interface IthoStatusPayload {
  temp?: number;
  hum?: number;
  Temperature?: number;
  RelativeHumidity?: number;
  'Fan speed (rpm)'?: number;
  supplyTemp?: number;
  exhaustTemp?: number;
  RoomTemp?: number;
  OutdoorTemp?: number;
  Air_Quality?: number;
  Highest_received_CO2_value?: number;
  Highest_received_RH_value?: number;
}

module.exports = class NRGWatchIthoCVEDevice extends Homey.Device {

  private messageHandlers: Map<string, (topic: string, message: Buffer) => void> = new Map();
  private currentSpeed: number = 0;
  private currentPreset: string = 'low';

  async onInit() {
    this.log('NRG-Watch Itho CVE device initialized');
    
    this.subscribeToTopics();
    this.registerCapabilityListeners();
  }

  async onSettings({ oldSettings, newSettings, changedKeys }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    const topicKeys = ['topic_status', 'topic_lastcmd', 'topic_state', 'topic_lwt', 'topic_cmd'];
    const topicsChanged = changedKeys.some(key => topicKeys.includes(key));
    
    if (topicsChanged) {
      this.unsubscribeFromAllTopics();
      this.subscribeToTopics();
    }
  }

  async onDeleted() {
    this.log('NRG-Watch Itho CVE device deleted');
    this.unsubscribeFromAllTopics();
  }

  private registerCapabilityListeners() {
    this.registerCapabilityListener('itho_fan_preset', async (value: string) => {
      await this.setFanPreset(value);
    });
  }

  private subscribeToTopics() {
    const app = this.homey.app as any;
    
    const statusTopic = this.getSetting('topic_status') || 'itho/ithostatus';
    const statusHandler = (topic: string, message: Buffer) => {
      if (topic === statusTopic) {
        this.handleStatusMessage(message);
      }
    };
    this.messageHandlers.set(statusTopic, statusHandler);
    app.mqttManager.subscribe(statusTopic, statusHandler);
    this.log(`Subscribed to status topic: ${statusTopic}`);

    const stateTopic = this.getSetting('topic_state') || 'itho/state';
    const stateHandler = (topic: string, message: Buffer) => {
      if (topic === stateTopic) {
        this.handleStateMessage(message);
      }
    };
    this.messageHandlers.set(stateTopic, stateHandler);
    app.mqttManager.subscribe(stateTopic, stateHandler);
    this.log(`Subscribed to state topic: ${stateTopic}`);

    const lwtTopic = this.getSetting('topic_lwt') || 'itho/LWT';
    const lwtHandler = (topic: string, message: Buffer) => {
      if (topic === lwtTopic) {
        this.handleLWTMessage(message);
      }
    };
    this.messageHandlers.set(lwtTopic, lwtHandler);
    app.mqttManager.subscribe(lwtTopic, lwtHandler);
    this.log(`Subscribed to LWT topic: ${lwtTopic}`);
  }

  private unsubscribeFromAllTopics() {
    const app = this.homey.app as any;
    
    for (const [topic, handler] of this.messageHandlers.entries()) {
      app.mqttManager.unsubscribe(topic, handler);
      this.log(`Unsubscribed from topic: ${topic}`);
    }
    
    this.messageHandlers.clear();
  }

  private handleStatusMessage(message: Buffer) {
    try {
      const payload = message.toString();
      const data: IthoStatusPayload = JSON.parse(payload);

      if (data.temp !== undefined || data.Temperature !== undefined) {
        const temp = data.temp ?? data.Temperature ?? 0;
        this.setCapabilityValue('measure_temperature.indoor', Number(temp.toFixed(1))).catch(this.error);
      }

      if (data.hum !== undefined || data.RelativeHumidity !== undefined) {
        const hum = data.hum ?? data.RelativeHumidity ?? 0;
        this.setCapabilityValue('measure_humidity.indoor', Number(hum.toFixed(1))).catch(this.error);
      }

      if (data['Fan speed (rpm)'] !== undefined) {
        const speed = data['Fan speed (rpm)'];
        this.currentSpeed = speed;
        this.setCapabilityValue('itho_fan_speed', speed).catch(this.error);
        
        this.homey.flow.getDeviceTriggerCard('itho_fan_speed_changed')
          .trigger(this, { value: speed })
          .catch(this.error);
      }

      if (data.supplyTemp !== undefined) {
        this.setCapabilityValue('measure_temperature.supply', Number(data.supplyTemp.toFixed(2))).catch(this.error);
      }

      if (data.exhaustTemp !== undefined) {
        this.setCapabilityValue('measure_temperature.exhaust', Number(data.exhaustTemp.toFixed(2))).catch(this.error);
      }

      this.log('Status updated from MQTT');
    } catch (error) {
      this.error('Failed to parse status message:', error);
    }
  }

  private handleStateMessage(message: Buffer) {
    try {
      const payload = message.toString().trim();
      const speed = parseInt(payload);
      
      if (!isNaN(speed)) {
        this.currentSpeed = speed;
        this.setCapabilityValue('itho_fan_speed', speed).catch(this.error);
        this.log(`State updated: speed=${speed}`);
      }
    } catch (error) {
      this.error('Failed to parse state message:', error);
    }
  }

  private handleLWTMessage(message: Buffer) {
    try {
      const payload = message.toString().trim().toLowerCase();
      const isOnline = payload === 'online';
      
      this.setCapabilityValue('itho_online', isOnline).catch(this.error);
      this.log(`LWT updated: ${isOnline ? 'online' : 'offline'}`);
      
      this.homey.flow.getDeviceTriggerCard('itho_online_changed')
        .trigger(this, { online: isOnline })
        .catch(this.error);
    } catch (error) {
      this.error('Failed to parse LWT message:', error);
    }
  }

  private async setFanPreset(preset: string) {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    let command: any;
    
    switch (preset) {
      case 'low':
      case 'medium':
      case 'high':
        command = { command: preset };
        break;
      case 'timer1':
      case 'timer2':
      case 'timer3':
        command = { command: preset };
        break;
      default:
        this.error(`Unknown preset: ${preset}`);
        return;
    }

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(command));
      this.currentPreset = preset;
      this.log(`Set fan preset to: ${preset}`);
      
      this.homey.flow.getDeviceTriggerCard('itho_preset_changed')
        .trigger(this, { preset: preset })
        .catch(this.error);
    } catch (error) {
      this.error('Failed to set fan preset:', error);
      throw error;
    }
  }

  async setFanSpeed(speed: number, timer?: number) {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    const command: any = { speed: speed };
    if (timer !== undefined && timer > 0) {
      command.timer = timer;
    }

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(command));
      this.log(`Set fan speed to: ${speed}${timer ? ` for ${timer} minutes` : ''}`);
    } catch (error) {
      this.error('Failed to set fan speed:', error);
      throw error;
    }
  }

  async sendVirtualRemote(command: string) {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    const payload = { vremote: command };

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(payload));
      this.log(`Sent virtual remote command: ${command}`);
    } catch (error) {
      this.error('Failed to send virtual remote command:', error);
      throw error;
    }
  }

  async clearQueue() {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    const payload = { clearqueue: true };

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(payload));
      this.log('Cleared command queue');
    } catch (error) {
      this.error('Failed to clear queue:', error);
      throw error;
    }
  }

};
