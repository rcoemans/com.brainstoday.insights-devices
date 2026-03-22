'use strict';

import Homey from 'homey';

module.exports = class Awtrix3Driver extends Homey.Driver {

  async onInit() {
    this.log('Awtrix 3 driver initialized');
    
    // Register condition card handlers
    this.homey.flow.getConditionCard('awtrix_temperature_compare')
      .registerRunListener(async (args) => {
        const value = args.device.getCapabilityValue('measure_temperature');
        return this.compareValues(value, args.operator, args.value);
      });

    this.homey.flow.getConditionCard('awtrix_humidity_compare')
      .registerRunListener(async (args) => {
        const value = args.device.getCapabilityValue('measure_humidity');
        return this.compareValues(value, args.operator, args.value);
      });

    this.homey.flow.getConditionCard('awtrix_is_online')
      .registerRunListener(async (args) => {
        return args.device.getCapabilityValue('awtrix_online') === true;
      });

    // Register action card handlers
    this.homey.flow.getActionCard('awtrix_send_notification')
      .registerRunListener(async (args) => {
        await args.device.sendNotification(
          args.text,
          args.color || undefined,
          args.duration || undefined,
          args.icon || undefined
        );
      });

    this.homey.flow.getActionCard('awtrix_send_custom_app')
      .registerRunListener(async (args) => {
        await args.device.sendCustomApp(
          args.name,
          args.text,
          args.color || undefined,
          args.icon || undefined,
          args.lifetime || undefined
        );
      });

    this.homey.flow.getActionCard('awtrix_remove_app')
      .registerRunListener(async (args) => {
        await args.device.removeCustomApp(args.name);
      });

    this.homey.flow.getActionCard('awtrix_clear_screen')
      .registerRunListener(async (args) => {
        await args.device.clearScreen();
      });

    this.homey.flow.getActionCard('awtrix_set_brightness')
      .registerRunListener(async (args) => {
        await args.device.setBrightness(args.brightness);
      });
  }

  compareValues(current: number, operator: string, target: number): boolean {
    switch (operator) {
      case 'lt': return current < target;
      case 'lte': return current <= target;
      case 'gt': return current > target;
      case 'gte': return current >= target;
      default: return false;
    }
  }

  async onPairListDevices() {
    return [
      {
        name: 'Awtrix 3',
        data: {
          id: `awtrix_${Date.now()}`
        },
        settings: {
          base_topic: 'awtrix',
          stats_topic: 'stats',
          custom_topic: 'custom',
          notify_topic: 'notify'
        }
      }
    ];
  }

};
