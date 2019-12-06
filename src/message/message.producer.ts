import * as amqp from 'amqp-connection-manager';
import { Logger } from '@nestjs/common';

export class MessageProducer {
  private readonly logger = new Logger(MessageProducer.name);

  private connection = null;
  private channel = null;

  constructor(private readonly url, private readonly queue) {
    this.createConnection(url, queue);
  }

  private createConnection(url, queue) {
    this.connection = amqp.connect([url]);

    this.connection.on('connected', () => {
      this.logger.debug(`[AMQP-CM]: Connected ${queue}`);
    });

    this.connection.on('disconnected', () => {
      this.logger.error(`[AMQP-CM]: Disconnected ${queue}`);
    });

    this.channel = this.connection.createChannel({
      json: true,
      setup: channel => {
        return channel.assertQueue(queue, {
          durable: true,
        });
      },
    });
  }

  async sendMessage(data) {
    await this.channel.sendToQueue(this.queue, data);
    this.logger.debug(`[AMQP-CM]: Sent message`);
  }
}
