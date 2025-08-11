import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { EventParserFactory } from '../parsers/event-parser-factory';
import { ParsedEvent } from '../parsers/types';

@Injectable()
export class EventParsingService {
  private readonly logger = new Logger(EventParsingService.name);

  parseEvents(events: ethers.EventLog[]): ParsedEvent[] {
    const parsedEvents: ParsedEvent[] = [];

    for (const event of events) {
      const parsedEvent = this.parseSingleEvent(event);
      if (parsedEvent) {
        parsedEvents.push(parsedEvent);
      }
    }

    this.logger.log(
      `Parsed ${parsedEvents.length} events from ${events.length} raw events`,
    );

    return parsedEvents;
  }

  private parseSingleEvent(event: ethers.EventLog): ParsedEvent | null {
    try {
      const parser = EventParserFactory.getParser(event);
      if (!parser) {
        this.logger.warn(`No parser found for event: ${event.eventName}`);
        return null;
      }

      const parsedData = parser.parse(event);
      if (!parsedData) {
        this.logger.warn(`Failed to parse event: ${event.eventName}`);
        return null;
      }

      return parsedData;
    } catch (error) {
      this.logger.error(`Error parsing event ${event.eventName}:`, error);
      return null;
    }
  }

  getSupportedEventTypes(): string[] {
    return EventParserFactory.getSupportedEventNames();
  }
}
