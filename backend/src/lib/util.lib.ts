export type TLogLevel = 'info' | 'error' | 'warn' | 'debug';

export function createLogger(...identifiers: string[]) {
  const header = '[' + identifiers.join(':') + ']';

  return function (level: TLogLevel, ...data: unknown[]) {
    let logFn: null | ((...data: any[]) => void) = null;

    switch (level) {
      case 'debug':
        logFn = console.debug;
        break;
      case 'error':
        logFn = console.error;
        break;
      case 'info':
        logFn = console.info;
        break;
      case 'warn':
        logFn = console.warn;
        break;
      default:
        throw new Error('Unknown log level');
    }

    if (!logFn) throw new Error('Unknown log level');

    logFn(header, ...data);
  };
}
