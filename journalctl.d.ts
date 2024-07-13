declare module 'journalctl' {
  import { EventEmitter } from 'events';

  interface JournalctlOptions {
    since?: string;
    until?: string;
    unit?: string;
    identifier?: string;
    output?: string;
  }

  class Journalctl extends EventEmitter {
    constructor(options?: JournalctlOptions);
  }

  export = Journalctl;
}

