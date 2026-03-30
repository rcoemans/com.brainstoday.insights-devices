'use strict';

import Homey from 'homey';
import { AppLogger } from '../../lib/AppLogger';

interface IthoStatusPayload {
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
  supplyTemp?: number;
  exhaustTemp?: number;
  [key: string]: any;
}

module.exports = class NRGWatchIthoCVEDevice extends Homey.Device {

  private messageHandlers: Map<string, (topic: string, message: Buffer) => void> = new Map();
  private currentSpeed: number = 0;
  private currentPreset: string = 'low';
  private previousSpeed: number = 0;
  private previousPreset: string | null = null;
  private previousTemperature: number | null = null;
  private previousHumidity: number | null = null;
  private previousErrorCode: number = 0;
  private statusReceived: boolean = false;

  private get appLogger(): AppLogger | null {
    return (this.homey.app as any).appLogger || null;
  }

  private appLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.appLogger) {
      this.appLogger[level]('Itho CVE', message);
    }
  }

  async onInit() {
    this.log('NRG-Watch Itho CVE device initialized');
    this.appLog('Device initialized');

    // Migrate settings for devices paired before new settings were added
    await this.migrateSettings();

    const settings = this.getSettings();
    this.appLog(`Topics: status=${settings.topic_status || 'itho/ithostatus'}, state=${settings.topic_state || 'itho/state'}, cmd=${settings.topic_cmd || 'itho/cmd'}`);
    
    this.registerCapabilityListeners();
    this.subscribeToTopics();
  }

  private async migrateSettings() {
    const defaults: Record<string, string> = {
      topic_status: 'itho/ithostatus',
      topic_lastcmd: 'itho/lastcmd',
      topic_state: 'itho/state',
      topic_lwt: 'itho/LWT',
      topic_cmd: 'itho/cmd',
      topic_remotesinfo: 'itho/remotesinfo',
    };

    const current = this.getSettings();
    const updates: Record<string, string | null> = {};

    // Add missing settings with defaults
    for (const [key, defaultValue] of Object.entries(defaults)) {
      if (current[key] === undefined || current[key] === null || current[key] === '') {
        updates[key] = defaultValue;
      }
    }

    if (Object.keys(updates).length > 0) {
      this.log('Migrating settings:', Object.keys(updates).join(', '));
      this.appLog(`Migrating settings: ${Object.keys(updates).join(', ')}`);
      try {
        await this.setSettings(updates);
      } catch (err) {
        this.error('Settings migration error:', err);
        this.appLog(`Settings migration error: ${err}`, 'warn');
      }
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('Settings changed:', changedKeys.join(', '));
    this.appLog(`Settings changed: ${changedKeys.join(', ')}`);

    const topicKeys = ['topic_status', 'topic_lastcmd', 'topic_state', 'topic_lwt', 'topic_cmd'];
    const topicsChanged = changedKeys.some(key => topicKeys.includes(key));
    
    if (topicsChanged) {
      // Schedule resubscription after settings are persisted
      this.homey.setTimeout(async () => {
        this.log('Resubscribing after settings change...');
        this.appLog('Resubscribing to topics after settings change');
        this.unsubscribeFromAllTopics();
        this.subscribeToTopics();
      }, 1000);
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
    if (!app.mqttManager) {
      this.error('MQTT Manager not available yet, deferring subscription');
      this.appLog('MQTT Manager not available yet, deferring subscription', 'warn');
      return;
    }
    
    const statusTopic = this.getSetting('topic_status') || 'itho/ithostatus';
    const statusHandler = (topic: string, message: Buffer) => {
      if (topic === statusTopic) {
        this.handleStatusMessage(message);
      }
    };
    this.messageHandlers.set(statusTopic, statusHandler);
    app.mqttManager.subscribe(statusTopic, statusHandler);
    this.log(`Subscribed to status topic: ${statusTopic}`);
    this.appLog(`Subscribed to ${statusTopic}`);

    const stateTopic = this.getSetting('topic_state') || 'itho/state';
    const stateHandler = (topic: string, message: Buffer) => {
      if (topic === stateTopic) {
        this.handleStateMessage(message);
      }
    };
    this.messageHandlers.set(stateTopic, stateHandler);
    app.mqttManager.subscribe(stateTopic, stateHandler);
    this.log(`Subscribed to state topic: ${stateTopic}`);
    this.appLog(`Subscribed to ${stateTopic}`);

    const lwtTopic = this.getSetting('topic_lwt') || 'itho/LWT';
    const lwtHandler = (topic: string, message: Buffer) => {
      if (topic === lwtTopic) {
        this.handleLWTMessage(message);
      }
    };
    this.messageHandlers.set(lwtTopic, lwtHandler);
    app.mqttManager.subscribe(lwtTopic, lwtHandler);
    this.log(`Subscribed to LWT topic: ${lwtTopic}`);
    this.appLog(`Subscribed to ${lwtTopic}`);

    const lastcmdTopic = this.getSetting('topic_lastcmd') || 'itho/lastcmd';
    const lastcmdHandler = (topic: string, message: Buffer) => {
      if (topic === lastcmdTopic) {
        this.handleLastCommandMessage(message);
      }
    };
    this.messageHandlers.set(lastcmdTopic, lastcmdHandler);
    app.mqttManager.subscribe(lastcmdTopic, lastcmdHandler);
    this.log(`Subscribed to lastcmd topic: ${lastcmdTopic}`);
    this.appLog(`Subscribed to ${lastcmdTopic}`);
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

      // Mark that we have received status data - device is communicating
      if (!this.statusReceived) {
        this.statusReceived = true;
        this.setAvailable().catch(this.error);
        this.appLog('First status message received, device marked available');
      }

      // Temperature - handle multiple field names
      if (data.temp !== undefined || data.Temperature !== undefined) {
        const temp = Number((data.temp ?? data.Temperature ?? 0).toFixed(1));
        this.setCapabilityValue('measure_temperature.indoor', temp).catch(this.error);

        if (temp !== this.previousTemperature) {
          this.previousTemperature = temp;
        }
      }

      // Humidity - handle multiple field names
      if (data.hum !== undefined || data.RelativeHumidity !== undefined) {
        const hum = Number((data.hum ?? data.RelativeHumidity ?? 0).toFixed(1));
        this.setCapabilityValue('measure_humidity.indoor', hum).catch(this.error);

        if (hum !== this.previousHumidity) {
          this.previousHumidity = hum;
        }
      }

      if (data.ppmw !== undefined) {
        this.setCapabilityValue('itho_ppmw', data.ppmw).catch(this.error);
      }

      if (data['Ventilation setpoint (%)'] !== undefined) {
        this.setCapabilityValue('itho_ventilation_setpoint', data['Ventilation setpoint (%)']).catch(this.error);
      }

      if (data['Fan setpoint (rpm)'] !== undefined) {
        this.setCapabilityValue('itho_fan_setpoint', data['Fan setpoint (rpm)']).catch(this.error);
      }

      if (data['Fan speed (rpm)'] !== undefined) {
        const speed = data['Fan speed (rpm)'];
        this.currentSpeed = speed;
        this.setCapabilityValue('itho_fan_speed', speed).catch(this.error);
        
        if (speed !== this.previousSpeed) {
          this.homey.flow.getDeviceTriggerCard('itho_fan_speed_changed')
            .trigger(this, { value: speed })
            .catch(this.error);
          this.previousSpeed = speed;
        }
      }

      if (data.Error !== undefined) {
        this.setCapabilityValue('itho_error', data.Error).catch(this.error);

        if (data.Error !== this.previousErrorCode) {
          this.previousErrorCode = data.Error;
        }
      }

      if (data['Total operation (hours)'] !== undefined) {
        this.setCapabilityValue('itho_total_operation', data['Total operation (hours)']).catch(this.error);
      }

      // Supply temperature - handle multiple field names
      const supplyTemp = data['Supply temp (°C)'] ?? data.supplyTemp;
      if (supplyTemp !== undefined) {
        this.setCapabilityValue('measure_temperature.supply', Number(Number(supplyTemp).toFixed(1))).catch(this.error);
      }

      // Exhaust temperature - handle multiple field names
      const exhaustTemp = data['Exhaust temp (°C)'] ?? data.exhaustTemp;
      if (exhaustTemp !== undefined) {
        this.setCapabilityValue('measure_temperature.exhaust', Number(Number(exhaustTemp).toFixed(1))).catch(this.error);
      }

      if (data.Selection !== undefined) {
        this.setCapabilityValue('itho_selection', data.Selection).catch(this.error);
      }

      if (data['Startup counter'] !== undefined) {
        this.setCapabilityValue('itho_startup_counter', data['Startup counter']).catch(this.error);
      }

      if (data['Absence (min)'] !== undefined) {
        this.setCapabilityValue('itho_absence', data['Absence (min)']).catch(this.error);
      }

      if (data['Highest CO2 concentration (ppm)'] !== undefined) {
        const co2Value = typeof data['Highest CO2 concentration (ppm)'] === 'string'
          ? parseInt(data['Highest CO2 concentration (ppm)'])
          : data['Highest CO2 concentration (ppm)'];
        if (!isNaN(co2Value as number)) {
          this.setCapabilityValue('itho_highest_co2', co2Value).catch(this.error);
        }
      }

      if (data['Highest RH concentration (%)'] !== undefined) {
        this.setCapabilityValue('itho_highest_rh', data['Highest RH concentration (%)']).catch(this.error);
      }

      this.log('Status updated from MQTT');
    } catch (error) {
      this.error('Failed to parse status message:', error);
      this.appLog(`Failed to parse status message: ${error}`, 'error');
    }
  }

  private handleStateMessage(message: Buffer) {
    try {
      const payload = message.toString().trim();
      const speedState = parseInt(payload);
      
      if (!isNaN(speedState)) {
        this.setCapabilityValue('itho_speed_state', speedState).catch(this.error);

        const preset = this.speedStateToPreset(speedState);
        if (preset) {
          this.currentPreset = preset;
          this.setCapabilityValue('itho_fan_preset', preset).catch(this.error);
          
          if (preset !== this.previousPreset) {
            this.homey.flow.getDeviceTriggerCard('itho_preset_changed')
              .trigger(this, { preset: preset })
              .catch(this.error);
            this.previousPreset = preset;
          }
        }

        this.log(`State updated: speed_state=${speedState}, preset=${preset || 'none'}`);
      }
    } catch (error) {
      this.error('Failed to parse state message:', error);
      this.appLog(`Failed to parse state message: ${error}`, 'error');
    }
  }

  private speedStateToPreset(speedState: number): string | null {
    if (speedState === 20) return 'low';
    if (speedState === 120) return 'medium';
    if (speedState === 220) return 'high';
    return null;
  }

  private handleLWTMessage(message: Buffer) {
    try {
      const payload = message.toString().trim().toLowerCase();
      const isOnline = payload === 'online';
      
      this.setCapabilityValue('itho_online', isOnline).catch(this.error);
      this.log(`LWT updated: ${isOnline ? 'online' : 'offline'}`);
      this.appLog(`Device ${isOnline ? 'online' : 'offline'} (LWT)`);

      if (isOnline) {
        this.setAvailable().catch(this.error);
      } else {
        this.setUnavailable('Device offline').catch(this.error);
      }
      
      this.homey.flow.getDeviceTriggerCard('itho_online_changed')
        .trigger(this, { online: isOnline })
        .catch(this.error);
    } catch (error) {
      this.error('Failed to parse LWT message:', error);
      this.appLog(`Failed to parse LWT message: ${error}`, 'error');
    }
  }

  private handleLastCommandMessage(message: Buffer) {
    try {
      const payload = message.toString();
      this.log('Last command received:', payload);
      this.appLog(`Last command: ${payload}`);
    } catch (error) {
      this.error('Failed to parse last command message:', error);
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
      this.appLog(`Set fan speed to: ${speed}${timer ? ` for ${timer} minutes` : ''}`);
    } catch (error) {
      this.error('Failed to set fan speed:', error);
      this.appLog(`Failed to set fan speed: ${error}`, 'error');
      throw error;
    }
  }

  async sendVirtualRemote(command: string) {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    const payload = { vremotecmd: command };

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(payload));
      this.log(`Sent virtual remote command: ${command}`);
      this.appLog(`Sent virtual remote command: ${command}`);
    } catch (error) {
      this.error('Failed to send virtual remote command:', error);
      this.appLog(`Failed to send virtual remote command: ${error}`, 'error');
      throw error;
    }
  }

  async clearQueue() {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    const payload = { clearqueue: 'true' };

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(payload));
      this.log('Cleared command queue');
      this.appLog('Cleared command queue');
    } catch (error) {
      this.error('Failed to clear queue:', error);
      this.appLog(`Failed to clear queue: ${error}`, 'error');
      throw error;
    }
  }

  async setSpeedValue(value: number) {
    const app = this.homey.app as any;
    const cmdTopic = this.getSetting('topic_cmd') || 'itho/cmd';
    
    const payload = { speed: value };

    try {
      await app.mqttManager.publish(cmdTopic, JSON.stringify(payload));
      this.log(`Set fan speed value to: ${value}`);
      this.appLog(`Set fan speed value to: ${value}`);
    } catch (error) {
      this.error('Failed to set speed value:', error);
      this.appLog(`Failed to set speed value: ${error}`, 'error');
      throw error;
    }
  }

};
