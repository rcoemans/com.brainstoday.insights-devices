'use strict';

import Homey from 'homey';
import FormulaParser from '../../lib/FormulaParser';

const NUMBER_SLOTS = [1, 2, 3, 4];
const TEXT_SLOTS = [1, 2];
const CALC_SLOTS = [1, 2];

module.exports = class CustomMQTTSensorDevice extends Homey.Device {

  private messageHandler?: (topic: string, message: Buffer) => void;
  private formulaParser!: FormulaParser;

  async onInit() {
    this.log('Custom MQTT Sensor device initialized');

    this.formulaParser = new FormulaParser();
    await this.setupCapabilities();

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

    await this.setupCapabilities(newSettings);
    this.log('Settings updated, capabilities reconfigured');
  }

  async onDeleted() {
    this.log('Custom MQTT Sensor device deleted');
    const topic = this.getSetting('mqtt_topic');
    if (topic && this.messageHandler) {
      this.unsubscribeFromTopic(topic);
    }
  }

  private getSett(key: string, overrides?: { [key: string]: any }): any {
    if (overrides && key in overrides) return overrides[key];
    return this.getSetting(key);
  }

  private async setupCapabilities(settings?: { [key: string]: any }) {
    for (const i of NUMBER_SLOTS) {
      const label = this.getSett(`number_${i}_label`, settings) || '';
      const capId = `custom_number_${i}`;
      if (label) {
        if (!this.hasCapability(capId)) {
          await this.addCapability(capId).catch(e => this.error(`Failed to add ${capId}:`, e));
        }
        
        const unit = this.getSett(`number_${i}_unit`, settings) || '';
        const decimals = this.getSett(`number_${i}_decimals`, settings) ?? 1;
        
        this.setCapabilityOptions(capId, {
          title: label,
          units: unit || undefined,
          decimals: decimals
        }).catch(e => this.error(`Failed to set options for ${capId}:`, e));
      } else {
        if (this.hasCapability(capId)) {
          await this.removeCapability(capId).catch(e => this.error(`Failed to remove ${capId}:`, e));
        }
      }
    }

    for (const i of TEXT_SLOTS) {
      const path = this.getSett(`text_${i}_path`, settings) || '';
      const capId = `custom_text_${i}`;
      if (path) {
        if (!this.hasCapability(capId)) {
          await this.addCapability(capId).catch(e => this.error(`Failed to add ${capId}:`, e));
        }
        
        const label = this.getSett(`text_${i}_label`, settings) || `Text Value ${i}`;
        
        this.setCapabilityOptions(capId, {
          title: label
        }).catch(e => this.error(`Failed to set options for ${capId}:`, e));
      } else {
        if (this.hasCapability(capId)) {
          await this.removeCapability(capId).catch(e => this.error(`Failed to remove ${capId}:`, e));
        }
      }
    }

    for (const i of CALC_SLOTS) {
      const formula = this.getSett(`calc_${i}_formula`, settings) || '';
      const capId = `custom_calc_${i}`;
      if (formula) {
        if (!this.hasCapability(capId)) {
          await this.addCapability(capId).catch(e => this.error(`Failed to add ${capId}:`, e));
        }
        
        const label = this.getSett(`calc_${i}_label`, settings) || `Calculated Value ${i}`;
        const unit = this.getSett(`calc_${i}_unit`, settings) || '';
        const decimals = this.getSett(`calc_${i}_decimals`, settings) ?? 1;
        
        this.setCapabilityOptions(capId, {
          title: label,
          units: unit || undefined,
          decimals: decimals
        }).catch(e => this.error(`Failed to set options for ${capId}:`, e));
      } else {
        if (this.hasCapability(capId)) {
          await this.removeCapability(capId).catch(e => this.error(`Failed to remove ${capId}:`, e));
        }
      }
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
      const payloadType = this.getSetting('payload_type') || 'number';

      let data: any;
      if (payloadType === 'number') {
        data = payload.trim();
      } else {
        data = JSON.parse(payload);
      }

      const numberValues: { [key: string]: number } = {};

      for (const i of NUMBER_SLOTS) {
        const capId = `custom_number_${i}`;
        if (!this.hasCapability(capId)) continue;

        const path = this.getSetting(`number_${i}_path`) || '';
        
        // For Single Number payload type, use empty path to get the whole value
        const value = this.formulaParser.extractValue(data, path, payloadType);
        if (value !== null) {
          const decimals = this.getSetting(`number_${i}_decimals`) ?? 1;
          const roundedValue = Number(value.toFixed(decimals));
          numberValues[`n${i}`] = roundedValue;

          this.setCapabilityValue(capId, roundedValue).catch(this.error);

          const label = this.getSetting(`number_${i}_label`) || `Number ${i}`;
          this.homey.flow.getDeviceTriggerCard('custom_sensor_value_changed')
            .trigger(this, { field: label, value: roundedValue })
            .catch(this.error);
        }
      }

      for (const i of TEXT_SLOTS) {
        const path = this.getSetting(`text_${i}_path`) || '';
        if (!path) continue;

        const capId = `custom_text_${i}`;
        if (!this.hasCapability(capId)) continue;

        const textValue = this.extractStringValue(data, path);
        if (textValue !== null) {
          this.setCapabilityValue(capId, String(textValue)).catch(this.error);
        }
      }

      for (const i of CALC_SLOTS) {
        const formula = this.getSetting(`calc_${i}_formula`) || '';
        if (!formula) continue;

        const capId = `custom_calc_${i}`;
        if (!this.hasCapability(capId)) continue;

        try {
          const result = this.formulaParser.evaluateFormula(formula, numberValues);
          const decimals = this.getSetting(`calc_${i}_decimals`) ?? 1;
          const roundedResult = Number(result.toFixed(decimals));

          this.setCapabilityValue(capId, roundedResult).catch(this.error);

          const label = this.getSetting(`calc_${i}_label`) || `Calculated ${i}`;
          this.homey.flow.getDeviceTriggerCard('custom_sensor_calculated_changed')
            .trigger(this, { field: label, value: roundedResult })
            .catch(this.error);
        } catch (error) {
          this.error(`Failed to calculate calc_${i}:`, error);
        }
      }

      this.log('Custom sensor values updated from MQTT');
    } catch (error) {
      this.error('Failed to parse MQTT message:', error);
    }
  }

  private extractStringValue(data: any, path: string): string | null {
    try {
      const keys = path.split('.');
      let current = data;

      for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
          return null;
        }
        current = current[key];
      }

      if (current === null || current === undefined) return null;
      return String(current);
    } catch (error) {
      return null;
    }
  }

};
