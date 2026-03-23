'use strict';

import Homey from 'homey';

module.exports = class NRGWatchIthoCVEDriver extends Homey.Driver {

  async onInit() {
    this.log('NRG-Watch Itho CVE driver initialized');
    
    this.registerFlowCards();
  }

  private registerFlowCards() {
    this.homey.flow.getDeviceTriggerCard('itho_fan_speed_changed');
    this.homey.flow.getDeviceTriggerCard('itho_preset_changed');
    this.homey.flow.getDeviceTriggerCard('itho_online_changed');
    
    const speedCondition = this.homey.flow.getConditionCard('itho_fan_speed_compare');
    speedCondition.registerRunListener(async (args, state) => {
      const value = args.device.getCapabilityValue('itho_fan_speed');
      return this.compareValues(value, args.operator, args.value);
    });

    const presetCondition = this.homey.flow.getConditionCard('itho_preset_equals');
    presetCondition.registerRunListener(async (args, state) => {
      const currentPreset = args.device.getCapabilityValue('itho_fan_preset');
      return currentPreset === args.preset;
    });

    const onlineCondition = this.homey.flow.getConditionCard('itho_is_online');
    onlineCondition.registerRunListener(async (args, state) => {
      return args.device.getCapabilityValue('itho_online') === true;
    });

    const setSpeedAction = this.homey.flow.getActionCard('itho_set_fan_speed');
    setSpeedAction.registerRunListener(async (args, state) => {
      await args.device.setFanSpeed(args.speed);
    });

    const setSpeedTimerAction = this.homey.flow.getActionCard('itho_set_fan_speed_timer');
    setSpeedTimerAction.registerRunListener(async (args, state) => {
      await args.device.setFanSpeed(args.speed, args.timer);
    });

    const setPresetAction = this.homey.flow.getActionCard('itho_set_preset');
    setPresetAction.registerRunListener(async (args, state) => {
      await args.device.setCapabilityValue('itho_fan_preset', args.preset);
    });

    const virtualRemoteAction = this.homey.flow.getActionCard('itho_virtual_remote');
    virtualRemoteAction.registerRunListener(async (args, state) => {
      await args.device.sendVirtualRemote(args.command);
    });

    const clearQueueAction = this.homey.flow.getActionCard('itho_clear_queue');
    clearQueueAction.registerRunListener(async (args, state) => {
      await args.device.clearQueue();
    });

    const setSpeedValueAction = this.homey.flow.getActionCard('itho_set_speed_value');
    setSpeedValueAction.registerRunListener(async (args, state) => {
      await args.device.setSpeedValue(args.value);
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
        name: 'Itho CVE',
        data: {
          id: `itho_cve_${Date.now()}`
        },
        settings: {
          topic_status: 'itho/ithostatus',
          topic_lastcmd: 'itho/lastcmd',
          topic_state: 'itho/state',
          topic_lwt: 'itho/LWT',
          topic_cmd: 'itho/cmd'
        }
      }
    ];
  }

};
