'use strict';

import Homey from 'homey';

module.exports = class GroundLevelMonitorDriver extends Homey.Driver {

  async onInit() {
    this.log('Ground Level Monitor driver initialized');
    
    this.homey.flow.getDeviceTriggerCard('ground_level_changed');
    
    const levelCondition = this.homey.flow.getConditionCard('ground_level_compare');
    levelCondition.registerRunListener(async (args, state) => {
      const value = args.device.getCapabilityValue('measure_level.ground');
      return this.compareValues(value, args.operator, args.value);
    });
  }

  private compareValues(actual: number, operator: string, target: number): boolean {
    switch (operator) {
      case 'lt': return actual < target;
      case 'lte': return actual <= target;
      case 'gt': return actual > target;
      case 'gte': return actual >= target;
      default: return false;
    }
  }

  async onPair(session: any) {
    session.setHandler('showView', async (viewId: string) => {
      this.log('Pair view:', viewId);
    });

    session.setHandler('device_settings', async (data: any) => {
      return {
        name: data.name || 'Ground Level Monitor',
        data: {
          id: `ground_level_${Date.now()}`
        },
        settings: {
          mqtt_topic: data.mqtt_topic || 'sensor/crawlSpaceHeight',
          unit: data.unit || 'cm',
          alarm_threshold: data.alarm_threshold || 0
        }
      };
    });
  }

};
