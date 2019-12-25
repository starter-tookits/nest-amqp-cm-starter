import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {MessageService} from "../message.service";
import {MessageTopicProducer} from "./message.topic.producer";
import {MessageTopicConsumer} from "./message.topic.consumer";


const EXAMPLE_AMQP_URL = 'amqp://devuser:devuser@localhost:5673';
const EXAMPLE_AMQP_EXCHANGE = 'EXCHANGE_LOGS';
@(Injectable())
export class MessageTopicService implements OnModuleInit{
    private readonly logger = new Logger(MessageService.name);

    private dev1ErrorProducer: MessageTopicProducer;
    private dev2ErrorProducer: MessageTopicProducer;
    private dev1InfoProducer: MessageTopicProducer;
    private dev2InfoProducer: MessageTopicProducer;
    private errorConsumer: MessageTopicConsumer;
    private infoConsumer: MessageTopicConsumer;
    private dev1Consumer: MessageTopicConsumer;
    private dev2Consumer: MessageTopicConsumer;

    onModuleInit(){
        this.dev1ErrorProducer = new MessageTopicProducer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, "DEV1.ERROR");
        this.dev2ErrorProducer = new MessageTopicProducer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, "DEV2.ERROR");
        this.dev1InfoProducer = new MessageTopicProducer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, "DEV1.INFO");
        this.dev2InfoProducer = new MessageTopicProducer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, "DEV2.INFO");
        this.logger.log(`Producer inited`);

        const handler = async data => {
            this.logger.log(`Consume message: ${data.content.toString()}`);
        };

        this.errorConsumer = new MessageTopicConsumer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, ["*.ERROR"], handler);
        this.infoConsumer = new MessageTopicConsumer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, ["*.INFO"], handler);
        this.dev1Consumer = new MessageTopicConsumer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, ["DEV1.*"], handler);
        this.dev2Consumer = new MessageTopicConsumer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, ["DEV2.*"], handler);
        this.logger.log(`Consumer inited`);

        setInterval(async () => {
            this.logger.log(`Try to send messages`);
            await this.dev1ErrorProducer.sendMessage({'log': 'error in dev1'});
            await this.dev2ErrorProducer.sendMessage({'log': 'error in dev2'});
            await this.dev1InfoProducer.sendMessage({'log': 'info in dev1'});
            await this.dev2ErrorProducer.sendMessage({'log': 'info in dev2'});
        }, 60 * 1000);
    }
}