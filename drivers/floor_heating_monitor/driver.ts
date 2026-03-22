'use strict';

import Homey from 'homey';

module.exports = class FloorHeatingMonitorDriver extends Homey.Driver {

  async onInit() {
    this.log('Floor Heating Monitor driver initialized');
    
    this.homey.flow.getDeviceTriggerCard('flow_temperature_changed');
    this.homey.flow.getDeviceTriggerCard('return_temperature_changed');
    this.homey.flow.getDeviceTriggerCard('delta_t_changed');
    
    const flowTempCondition = this.homey.flow.getConditionCard('floor_heating_flow_temp_compare');
    flowTempCondition.registerRunListener(async (args, state) => {
      const value = args.device.getCapabilityValue('measure_temperature.flow');
      return this.compareValues(value, args.operator, args.value);
    });

    const returnTempCondition = this.homey.flow.getConditionCard('floor_heating_return_temp_compare');
    returnTempCondition.registerRunListener(async (args, state) => {
      const value = args.device.getCapabilityValue('measure_temperature.return');
      return this.compareValues(value, args.operator, args.value);
    });

    const deltaTCondition = this.homey.flow.getConditionCard('floor_heating_delta_t_compare');
    deltaTCondition.registerRunListener(async (args, state) => {
      const value = args.device.getCapabilityValue('measure_temperature.delta');
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

  async onPairListDevices() {
    return [
      {
        name: 'Floor Heating Monitor',
        data: {
          id: `floor_heating_${Date.now()}`
        },
        settings: {
          mqtt_topic: 'heating/floor1/status'
        }
      }
    ];
  }

};
