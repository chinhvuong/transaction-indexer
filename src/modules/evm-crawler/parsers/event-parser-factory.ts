import { ethers } from 'ethers';
import { DepositEventParser } from './events/deposit-event-parser';
import { WithdrawEventParser } from './events/withdraw-event-parser';
import { IEventParser } from './base-event-parser';

export class EventParserFactory {
  private static parsers: Map<string, IEventParser> = new Map();

  static {
    const depositParser = new DepositEventParser();
    const withdrawParser = new WithdrawEventParser();

    EventParserFactory.parsers.set(depositParser.getEventName(), depositParser);
    EventParserFactory.parsers.set(
      withdrawParser.getEventName(),
      withdrawParser,
    );
  }

  static getParser(event: ethers.EventLog): IEventParser | null {
    const eventName = event.eventName;
    if (!eventName) {
      return null;
    }

    return EventParserFactory.parsers.get(eventName) || null;
  }

  static getAllParsers(): IEventParser[] {
    return Array.from(EventParserFactory.parsers.values());
  }

  static registerParser(parser: IEventParser): void {
    EventParserFactory.parsers.set(parser.getEventName(), parser);
  }

  static getSupportedEventNames(): string[] {
    return Array.from(EventParserFactory.parsers.keys());
  }
}
