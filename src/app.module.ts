import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './message/message.module';
import {MessageTopicModule} from "./message/topic/message.topic.module";
import {MessageDLXModule} from "./message/dlx/message.dlx.module";

@Module({
  // imports: [MessageModule, MessageTopicModule,MessageDLXModule],
  imports: [MessageDLXModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
