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

    this.connection.on('error', () => {
      this.logger.log(`[AMQP-CM]: Found error at: ${queue}`);
    });

    this.connection.on('close', () => {
      this.logger.log(`[AMQP-CM]: Connection closed at: ${queue}`);
    });

    this.connection.on('connect', () => {
      this.logger.log(`[AMQP-CM]: Connected ${queue}`);
    });

    this.connection.on('disconnect', () => {
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

    this.channel.waitForConnect().then(() => {
      this.logger.log(`[AMQP-CM]: Connection Created`);
    });
  }

  async sendMessage(data) {
    await this.channel.sendToQueue(this.queue, data, {
      // use delivery-mode:2 or persistence:true as message options to make message persistence
      // @see https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html
      deliveryMode: 2,
    });
    // this.logger.debug(`[AMQP-CM]: Sent message`);
  }
}
