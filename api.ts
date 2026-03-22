'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/log',
    fn: async (args: any, callback: any) => {
      const app = callback.homey.app as any;
      return {
        log: app.mqttManager.getLog()
      };
    }
  },
  {
    method: 'POST',
    path: '/reconnect',
    fn: async (args: any, callback: any) => {
      const app = callback.homey.app as any;
      await app.mqttManager.connect();
      return { success: true };
    }
  }
];
