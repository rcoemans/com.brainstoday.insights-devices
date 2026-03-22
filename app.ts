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
  }

  async onUninit() {
    this.log('Insights Devices app is shutting down');
    if (this.mqttManager) {
      await this.mqttManager.disconnect();
    }
  }

}
