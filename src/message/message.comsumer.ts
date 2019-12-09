import * as amqp from 'amqp-connection-manager';
import { Logger } from '@nestjs/common';

export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);

  private connection = null;
  private channel = null;

  constructor(
    private readonly url,
    private readonly queue,
    private readonly handler,
  ) {
    this.createConsumerConnection(url, queue, handler);
  }

  private createConsumerConnection(
    url,
    queue,
    handler: (data) => Promise<any>,
  ) {
    this.connection = amqp.connect([url]);

    this.connection.on('connected', () => {
      this.logger.debug(`[AMQP-CM]: Connected ${queue}`);
    });

    this.connection.on('disconnected', () => {
      this.logger.error(`[AMQP-CM]: Disconnected ${queue}`);
    });

    const autoAckHandler = data => {
      handler(data)
        .then(() => {
          this.channel.ack(data);
        })
        .catch(error => {
          // TODO: set retry field
          this.logger.error(
            `[AMQP-CM]: Consume error for message ${JSON.stringify(data)}`,
          );
          this.channel.ack(data);
        });
    };

    this.channel = this.connection.createChannel({
      json: true,
      setup: channel => {
        return Promise.all([
          channel.assertQueue(queue, {
            durable: true,
          }),
          channel.prefetch(1),
          channel.consume(queue, autoAckHandler),
        ]);
      },
    });

    this.channel.waitForConnect().then(() => {
      this.logger.log(`[AMQP-CM]: Connection Created`);
    });
  }
}
