import * as amqp from 'amqp-connection-manager';
import { Logger } from '@nestjs/common';

export class MessageDLXConsumer {
    private readonly logger = new Logger(MessageDLXConsumer.name);

    private connection = null;
    private channel = null;

    constructor(
        private readonly url,
        private readonly DLXExchange,
        private readonly DLXKeys: string[],
        private readonly retryThreshold
    ) {
        this.createConsumerConnection(url, DLXExchange, DLXKeys, retryThreshold);
    }

    private createConsumerConnection(
        url: string,
        DLXExchange: string,
        DLXKeys:string[],
        retryThreshold: number
    ) {
        this.connection = amqp.connect([url]);

        this.connection.on('connect', () => {
            this.logger.debug(`[AMQP-CM]: Connected ${DLXExchange} - key: ${DLXKeys}`);
        });

        this.connection.on('disconnect', () => {
            this.logger.error(`[AMQP-CM]: Disconnected ${DLXExchange} - key: ${DLXKeys}`);
        });

        const DLXHandler = async (message) => {
            const xDeath = message.properties.headers["x-death"];
            for (const deathInfo of xDeath) {
                if (deathInfo.count < retryThreshold) {
                    for (const originalKey of deathInfo["routing-keys"]) {
                       await this.channel.publish(deathInfo.exchange, originalKey, JSON.parse(message.content.toString()), message.properties);
                       this.logger.log(`[AMQP-CM]: dlx retry data ${message.content.toString()}, count: ${deathInfo.count}`);
                    }
                }
            }
            this.channel.ack(message);
        };

        this.logger.log(`[AMQP-CM]: Try to createChannel ${DLXExchange} - key: ${DLXKeys}`);
        let queue = DLXExchange;
        DLXKeys.forEach(key => queue = queue + '-' + key);
        this.channel = this.connection.createChannel({
            json: true,
            setup: channel => {
                return Promise.all([
                    channel.assertExchange(DLXExchange, 'topic', {durable: true}),
                    channel.prefetch(1),
                    channel.assertQueue(queue, {durable:true}),
                    DLXKeys.forEach(key => channel.bindQueue(queue, DLXExchange, key)),
                    channel.consume(queue, DLXHandler)
                ]);
            },
        });

        this.channel.waitForConnect().then(() => {
            this.logger.log(`[AMQP-CM]: Connection Created`);
        });
    }
}

