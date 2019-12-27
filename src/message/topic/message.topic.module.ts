import { Module } from '@nestjs/common';
import {MessageTopicService} from "./message.topic.service";

@Module({
    providers: [MessageTopicService],
})
export class MessageTopicModule {}