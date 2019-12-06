import * as _ from 'lodash';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessageProducer } from './message.producer';

const EXAMPLE_AMQP_URL = 'amqp://devuser:devuser@localhost:5672';
const EXAMPLE_AMQP_QUEUE = 'QUEUE.STUDY';

@Injectable()
export class MessageService implements OnModuleInit {
  private readonly logger = new Logger(MessageService.name);

  private exampleProducer;

  onModuleInit() {
    this.exampleProducer = new MessageProducer(
      EXAMPLE_AMQP_URL,
      EXAMPLE_AMQP_QUEUE,
    );

    this.logger.log(`Producer inited`);

    _.map(_.range(100000), i => {
      return this.exampleProducer.sendMessage({ i });
    });
  }
}
