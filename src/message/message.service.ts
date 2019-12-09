import * as _ from 'lodash';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessageProducer } from './message.producer';
import { MessageConsumer } from './message.comsumer';

const EXAMPLE_AMQP_URL = 'amqp://devuser:devuser@localhost:5673';
const EXAMPLE_AMQP_QUEUE = 'QUEUE.STUDY';

@Injectable()
export class MessageService implements OnModuleInit {
  private readonly logger = new Logger(MessageService.name);

  private exampleProducer;
  private exampleConsumer;

  onModuleInit() {
    this.exampleProducer = new MessageProducer(
      EXAMPLE_AMQP_URL,
      EXAMPLE_AMQP_QUEUE,
    );
    this.logger.log(`Producer inited`);

    const handler = async data => {
      this.logger.log(`Consume message: ${data.content.toString()}`);
    };

    this.exampleConsumer = new MessageConsumer(
      EXAMPLE_AMQP_URL,
      EXAMPLE_AMQP_QUEUE,
      handler,
    );

    setInterval(() => {
      this.logger.log(`Try to send 1000 messages to queue`);
      _.map(_.range(1000), i => {
        return this.exampleProducer.sendMessage({ i, ts: Date.now() });
      });
    }, 60 * 1000);
  }
}
