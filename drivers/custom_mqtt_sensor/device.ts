'use strict';

import Homey from 'homey';
import FormulaParser, { SourceMapping, CalculatedField } from '../../lib/FormulaParser';

module.exports = class CustomMQTTSensorDevice extends Homey.Device {

  private messageHandler?: (topic: string, message: Buffer) => void;
  private formulaParser!: FormulaParser;
  private sourceMappings: SourceMapping[] = [];
  private calculatedFields: CalculatedField[] = [];

  async onInit() {
    this.log('Custom MQTT Sensor device initialized');
    
    this.formulaParser = new FormulaParser();
    
    const deviceData = this.getData();
    if (deviceData.sourceMappings) {
      this.sourceMappings = deviceData.sourceMappings;
    }
    if (deviceData.calculatedFields) {
      this.calculatedFields = deviceData.calculatedFields;
    }
    
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
  }

  async onDeleted() {
    this.log('Custom MQTT Sensor device deleted');
    const topic = this.getSetting('mqtt_topic');
    if (topic && this.messageHandler) {
      this.unsubscribeFromTopic(topic);
    }
  }

  private async setupCapabilities() {
    const allMappings = [...this.sourceMappings, ...this.calculatedFields];
    
    for (const mapping of allMappings) {
      const capabilityId = `${mapping.capabilityType}.${mapping.key}`;
      
      if (!this.hasCapability(capabilityId)) {
        try {
          await this.addCapability(capabilityId);
          this.log(`Added capability: ${capabilityId}`);
        } catch (error) {
          this.error(`Failed to add capability ${capabilityId}:`, error);
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

      const sourceValues: { [key: string]: number } = {};
      
      for (const mapping of this.sourceMappings) {
        const value = this.formulaParser.extractValue(data, mapping.path, payloadType);
        
        if (value !== null) {
          sourceValues[mapping.key] = value;
          
          const capabilityId = `${mapping.capabilityType}.${mapping.key}`;
          const roundedValue = Number(value.toFixed(2));
          
          if (this.hasCapability(capabilityId)) {
            this.setCapabilityValue(capabilityId, roundedValue).catch(this.error);
            
            this.homey.flow.getDeviceTriggerCard('custom_sensor_value_changed')
              .trigger(this, { 
                field: mapping.label,
                value: roundedValue 
              })
              .catch(this.error);
          }
        }
      }

      for (const field of this.calculatedFields) {
        try {
          const result = this.formulaParser.evaluateFormula(field.formula, sourceValues);
          const roundedResult = Number(result.toFixed(2));
          
          const capabilityId = `${field.capabilityType}.${field.key}`;
          
          if (this.hasCapability(capabilityId)) {
            this.setCapabilityValue(capabilityId, roundedResult).catch(this.error);
            
            this.homey.flow.getDeviceTriggerCard('custom_sensor_calculated_changed')
              .trigger(this, { 
                field: field.label,
                value: roundedResult 
              })
              .catch(this.error);
          }
        } catch (error) {
          this.error(`Failed to calculate ${field.key}:`, error);
        }
      }

      this.log('Custom sensor values updated from MQTT');
    } catch (error) {
      this.error('Failed to parse MQTT message:', error);
    }
  }

};
