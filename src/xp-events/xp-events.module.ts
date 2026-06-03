import { Module } from '@nestjs/common';
import { XpEventsController } from './xp-events.controller';
import { XpEventsService } from './xp-events.service';

@Module({ controllers: [XpEventsController], providers: [XpEventsService] })
export class XpEventsModule {}
