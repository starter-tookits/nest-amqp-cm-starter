import { Module } from '@nestjs/common';
import {MessageTopicService} from "./topic/message.topic.service";

@Module({
  providers: [MessageTopicService],
})
export class MessageModule {}
