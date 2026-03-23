'use strict';

import Homey from 'homey';
import mqtt from 'mqtt';

interface MQTTSettings {
  broker: string;
  port: number;
  useTLS: boolean;
  rejectUnauthorized: boolean;
  keepalive: number;
  username: string;
  password: string;
  useCustomClientId: boolean;
  clientId: string;
  useLWT: boolean;
  lwtTopic: string;
  lwtMessage: string;
}

interface MessageHandler {
  (topic: string, message: Buffer): void;
}

export default class MQTTManager {
  
  private app: Homey.App;
  private client: mqtt.MqttClient | null = null;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private logEntries: string[] = [];
  private maxLogEntries = 500;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(app: Homey.App) {
    this.app = app;
  }

  async init() {
    this.log('MQTT Manager initializing');
    const settings = this.getSettings();
    
    if (settings.broker) {
      await this.connect();
    } else {
      this.log('No broker configured, waiting for settings');
    }
  }

  getSettings(): MQTTSettings {
    return {
      broker: this.app.homey.settings.get('mqtt_broker') || 'localhost',
      port: this.app.homey.settings.get('mqtt_port') || 1883,
      useTLS: this.app.homey.settings.get('mqtt_use_tls') || false,
      rejectUnauthorized: !this.app.homey.settings.get('mqtt_disable_cert_validation') || true,
      keepalive: this.app.homey.settings.get('mqtt_keepalive') || 60,
      username: this.app.homey.settings.get('mqtt_username') || '',
      password: this.app.homey.settings.get('mqtt_password') || '',
      useCustomClientId: this.app.homey.settings.get('mqtt_use_custom_client_id') || false,
      clientId: this.app.homey.settings.get('mqtt_client_id') || '',
      useLWT: this.app.homey.settings.get('mqtt_use_lwt') || false,
      lwtTopic: this.app.homey.settings.get('mqtt_lwt_topic') || '',
      lwtMessage: this.app.homey.settings.get('mqtt_lwt_message') || ''
    };
  }

  async connect() {
    if (this.client) {
      await this.disconnect();
    }

    const settings = this.getSettings();
    
    if (!settings.broker) {
      this.log('Cannot connect: no broker configured');
      return;
    }

    this.log(`Connecting to MQTT broker at ${settings.broker}:${settings.port}`);

    const protocol = settings.useTLS ? 'mqtts' : 'mqtt';
    const url = `${protocol}://${settings.broker}:${settings.port}`;

    const options: mqtt.IClientOptions = {
      keepalive: settings.keepalive,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000
    };

    if (settings.username) {
      options.username = settings.username;
      options.password = settings.password;
    }

    if (settings.useCustomClientId && settings.clientId) {
      options.clientId = settings.clientId;
    } else {
      options.clientId = `homey_insights_${Math.random().toString(16).substr(2, 8)}`;
    }

    if (settings.useTLS) {
      options.rejectUnauthorized = settings.rejectUnauthorized;
    }

    if (settings.useLWT && settings.lwtTopic && settings.lwtMessage) {
      options.will = {
        topic: settings.lwtTopic,
        payload: settings.lwtMessage,
        qos: 0,
        retain: false
      };
    }

    try {
      this.client = mqtt.connect(url, options);

      this.client.on('connect', () => {
        this.log('Connected to MQTT broker');
        this.app.homey.flow.getTriggerCard('broker_connected').trigger().catch(this.error);
        this.resubscribeAll();
      });

      this.client.on('error', (error) => {
        this.error('MQTT error:', error.message);
      });

      this.client.on('offline', () => {
        this.log('MQTT client offline');
      });

      this.client.on('reconnect', () => {
        this.log('Reconnecting to MQTT broker');
      });

      this.client.on('close', () => {
        this.log('MQTT connection closed');
        this.app.homey.flow.getTriggerCard('broker_disconnected').trigger().catch(this.error);
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

    } catch (error) {
      this.error('Failed to connect to MQTT broker:', error);
    }
  }

  async disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      this.log('Disconnecting from MQTT broker');
      await new Promise<void>((resolve) => {
        this.client!.end(false, {}, () => {
          this.client = null;
          resolve();
        });
      });
    }
  }

  subscribe(topic: string, handler: MessageHandler) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
      
      if (this.client && this.client.connected) {
        this.client.subscribe(topic, (err) => {
          if (err) {
            this.error(`Failed to subscribe to ${topic}:`, err);
          } else {
            this.log(`Subscribed to topic: ${topic}`);
          }
        });
      }
    }

    this.subscriptions.get(topic)!.add(handler);
  }

  unsubscribe(topic: string, handler: MessageHandler) {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscriptions.delete(topic);
        
        if (this.client && this.client.connected) {
          this.client.unsubscribe(topic, (err) => {
            if (err) {
              this.error(`Failed to unsubscribe from ${topic}:`, err);
            } else {
              this.log(`Unsubscribed from topic: ${topic}`);
            }
          });
        }
      }
    }
  }

  publish(topic: string, message: string, options?: mqtt.IClientPublishOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        this.error('Cannot publish: MQTT client not connected');
        reject(new Error('MQTT client not connected'));
        return;
      }

      this.client.publish(topic, message, options || {}, (err) => {
        if (err) {
          this.error(`Failed to publish to ${topic}:`, err);
          reject(err);
        } else {
          this.log(`Published to ${topic}: ${message}`);
          resolve();
        }
      });
    });
  }

  private resubscribeAll() {
    if (!this.client || !this.client.connected) {
      return;
    }

    for (const topic of this.subscriptions.keys()) {
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.error(`Failed to resubscribe to ${topic}:`, err);
        } else {
          this.log(`Resubscribed to topic: ${topic}`);
        }
      });
    }
  }

  private handleMessage(topic: string, message: Buffer) {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(topic, message);
        } catch (error) {
          this.error(`Error in message handler for ${topic}:`, error);
        }
      }
    }

    // Trigger generic MQTT flow card
    this.app.homey.flow.getTriggerCard('mqtt_message_received')
      .trigger({
        message: message.toString(),
        topic: topic
      }, {
        topic: topic
      })
      .catch((error) => {
        this.error('Error triggering mqtt_message_received:', error);
      });
  }

  matchTopic(pattern: string, topic: string): boolean {
    // Convert MQTT topic pattern to regex
    // + matches a single level
    // # matches multiple levels (must be at end)
    const regexPattern = pattern
      .replace(/\+/g, '[^/]+')
      .replace(/#$/, '.*')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }

  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }

  getLog(): string[] {
    return [...this.logEntries];
  }

  private log(...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${args.join(' ')}`;
    this.app.log(message);
    this.addLogEntry(message);
  }

  private error(...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ERROR: ${args.join(' ')}`;
    this.app.error(message);
    this.addLogEntry(message);
  }

  private addLogEntry(message: string) {
    this.logEntries.push(message);
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries.shift();
    }
  }

}
