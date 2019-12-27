import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {MessageService} from "../message.service";
import {MessageTopicProducer} from "../topic/message.topic.producer";
import {MessageSimpleConsumer} from "./message.simple.consumer";
import {MessageDLXConsumer} from "./message.dlx.consumer";


const EXAMPLE_AMQP_URL = 'amqp://devuser:devuser@localhost:5673';
const EXAMPLE_AMQP_EXCHANGE = 'SIMPLE_EXCHANGE';
const DLX_EXCHANGE = 'DLX_EXCHANGE';
@(Injectable())
export class MessageDLXService implements OnModuleInit{
    private readonly logger = new Logger(MessageService.name);

    private simpleProducer: MessageTopicProducer;
    private simpleConsumer: MessageSimpleConsumer;
    private dlxConsumer: MessageDLXConsumer;

    onModuleInit(){

        const handler = async data => {
            this.logger.log(`Consume message: ${data.content.toString()}`);
            throw new Error("");
        };

        this.simpleProducer = new MessageTopicProducer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, "#");
        this.simpleConsumer = new MessageSimpleConsumer(EXAMPLE_AMQP_URL, EXAMPLE_AMQP_EXCHANGE, ['#'], handler, DLX_EXCHANGE);
        this.dlxConsumer = new MessageDLXConsumer(EXAMPLE_AMQP_URL, DLX_EXCHANGE, ['#'], 3);

        setTimeout(async function () {
            await sendData();
        }, 30000);

        const sendData = async () => {
            for (let i = 0; i < 10; i++) {
               await this.simpleProducer.sendMessage({data: i});
            }
        }
    }
}