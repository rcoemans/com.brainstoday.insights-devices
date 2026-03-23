'use strict';

import Homey from 'homey';
import MQTTManager from './lib/MQTTManager';

module.exports = class InsightsDevicesApp extends Homey.App {

  mqttManager!: MQTTManager;

  async onInit() {
    this.log('Insights Devices app has been initialized');

    this.mqttManager = new MQTTManager(this);
    await this.mqttManager.init();

    this.registerFlowCards();
  }

  registerFlowCards() {
    const brokerConnectedCondition = this.homey.flow.getConditionCard('broker_connected');
    brokerConnectedCondition.registerRunListener(async () => {
      return this.mqttManager.isConnected();
    });

    const brokerDisconnectedCondition = this.homey.flow.getConditionCard('broker_disconnected');
    brokerDisconnectedCondition.registerRunListener(async () => {
      return !this.mqttManager.isConnected();
    });

    // Generic MQTT trigger card
    const mqttMessageReceivedTrigger = this.homey.flow.getTriggerCard('mqtt_message_received');
    mqttMessageReceivedTrigger.registerRunListener(async (args, state) => {
      // Match topic pattern with wildcards
      return this.mqttManager.matchTopic(args.topic, state.topic);
    });

    // Generic MQTT action cards
    const mqttPublishSimple = this.homey.flow.getActionCard('mqtt_publish_simple');
    mqttPublishSimple.registerRunListener(async (args) => {
      await this.mqttManager.publish(args.topic, args.message);
    });

    const mqttPublishAdvanced = this.homey.flow.getActionCard('mqtt_publish_advanced');
    mqttPublishAdvanced.registerRunListener(async (args) => {
      const qos = parseInt(args.qos) as 0 | 1 | 2;
      const retain = args.retain === 'true';
      await this.mqttManager.publish(args.topic, args.message, { qos, retain });
    });
  }

  async onUninit() {
    this.log('Insights Devices app is shutting down');
    if (this.mqttManager) {
      await this.mqttManager.disconnect();
    }
  }

}
