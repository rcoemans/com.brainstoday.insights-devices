'use strict';

module.exports = {
  async getLog({ homey }: { homey: any }) {
    const app = homey.app;
    return {
      log: app.mqttManager.getLog()
    };
  },

  async postReconnect({ homey }: { homey: any }) {
    const app = homey.app;
    await app.mqttManager.connect();
    return { success: true };
  }
};
