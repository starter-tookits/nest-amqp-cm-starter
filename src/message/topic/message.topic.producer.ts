import * as amqp from 'amqp-connection-manager';
import { Logger } from '@nestjs/common';

export class MessageTopicProducer {
    private readonly logger = new Logger(MessageTopicProducer.name);

    private connection = null;
    private channel = null;

    constructor(private readonly url, private readonly exchange, private readonly key) {
        this.createConnection(url, exchange, key);
    }

    private createConnection(url, exchange, key) {
        this.connection = amqp.connect([url]);

        this.connection.on('error', () => {
            this.logger.log(`[AMQP-CM]: Found error at: ${exchange} - ${key}`);
        });

        this.connection.on('close', () => {
            this.logger.log(`[AMQP-CM]: Connection closed at: ${exchange} - ${key}`);
        });

        this.connection.on('connect', () => {
            this.logger.log(`[AMQP-CM]: Connected ${exchange} - ${key}`);
        });

        this.connection.on('disconnect', () => {
            this.logger.error(`[AMQP-CM]: Disconnected ${exchange} - ${key}`);
        });

        this.logger.log(`[AMQP-CM]: Try to createChannel ${exchange} - ${key}`);

        this.channel = this.connection.createChannel({
            json: true,
            setup: channel => {
                this.logger.log(`[AMQP-CM] Connection created for exchange: ${exchange} - key: ${key}`);
                // return channel.assertQueue(queue, {
                //     durable: true,
                // });
                return channel.assertExchange(exchange, 'topic', {
                    durable: true
                })
            },
        });

        this.channel
            .waitForConnect()
            .then(() => {
                this.logger.log(`[AMQP-CM]: Connection Created`);
            })
            .catch(() => {
                this.logger.error(
                    `[AMQP-CM]: Connection Created failed for exchange: ${exchange} - key: ${key}`,
                );
            });
    }

    async sendMessage(data) {
        // await this.channel.sendToQueue(this.queue, data, {
        //     // use delivery-mode:2 or persistence:true as message options to make message persistence
        //     // @see https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html
        //     deliveryMode: 2,
        // });
        await this.channel.publish(this.exchange, this.key, data, {
            deliveryMode: 2
        });
        this.logger.debug(`[AMQP-CM]: Sent message`);
    }
}
