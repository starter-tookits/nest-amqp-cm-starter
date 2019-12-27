import { Module } from '@nestjs/common';
import {MessageDLXService} from "./message.dlx.service";

@Module({
    providers: [MessageDLXService],
})
export class MessageDLXModule {}