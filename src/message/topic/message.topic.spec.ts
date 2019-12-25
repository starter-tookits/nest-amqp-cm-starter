import { Test, TestingModule } from '@nestjs/testing';
import { MessageTopicService } from '../topic/message.topic.service';

describe('MessageService', () => {
    let service: MessageTopicService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageTopicService],
        }).compile();

        service = module.get<MessageTopicService>(MessageTopicService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
