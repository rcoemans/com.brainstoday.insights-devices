'use strict';

module.exports = {

  async getLogs({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText() || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async getLogsMqtt({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText('MQTT') || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async getLogsIthoCve({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText('Itho CVE') || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async getLogsApp({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      return app.appLogger.getLogsAsText('App') || 'No log entries yet.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async clearLogs({ homey }: { homey: any }) {
    try {
      const app = homey.app;
      if (!app || !app.appLogger) {
        return 'App logger not yet initialized.';
      }
      app.appLogger.clear();
      return 'Logs cleared.';
    } catch (e: any) {
      return 'Error: ' + (e.message || String(e));
    }
  },

  async postReconnect({ homey }: { homey: any }) {
    const app = homey.app;
    await app.mqttManager.connect();
    return { success: true };
  }

};
