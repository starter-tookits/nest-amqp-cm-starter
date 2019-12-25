import * as amqp from 'amqp-connection-manager';
import { Logger } from '@nestjs/common';

export class MessageTopicConsumer {
    private readonly logger = new Logger(MessageTopicConsumer.name);

    private connection = null;
    private channel = null;

    constructor(
        private readonly url,
        private readonly exchange,
        private readonly keys,
        private readonly handler,
    ) {
        this.createConsumerConnection(url, exchange, keys, handler);
    }

    private createConsumerConnection(
        url: string,
        exchange: string,
        keys:[],
        handler: (data) => Promise<any>,
    ) {
        this.connection = amqp.connect([url]);

        this.connection.on('connect', () => {
            this.logger.debug(`[AMQP-CM]: Connected ${exchange} - key: ${keys}`);
        });

        this.connection.on('disconnect', () => {
            this.logger.error(`[AMQP-CM]: Disconnected ${exchange} - key: ${keys}`);
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

        this.logger.log(`[AMQP-CM]: Try to createChannel ${exchange} - key: ${keys}`);
        let queue = exchange;
        keys.forEach(key => queue = queue + '-' + key);
        this.channel = this.connection.createChannel({
            json: true,
            setup: channel => {
                return Promise.all([
                    channel.assertExchange(exchange, 'topic', {durable: true}),
                    channel.prefetch(1),
                    channel.assertQueue(queue, {durable:true}),
                    keys.forEach(key => channel.bindQueue(queue, exchange, key)),
                    channel.consume(queue, autoAckHandler)
                ]);
            },
        });

        this.channel.waitForConnect().then(() => {
            this.logger.log(`[AMQP-CM]: Connection Created`);
        });
    }
}
