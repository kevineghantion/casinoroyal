// Secure logging utility to prevent log injection
export const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Remove newlines, carriage returns, and other control characters
  return input
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .substring(0, 200); // Limit length
};

export const logger = {
  info: (message: string, data?: any) => {
    console.log(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  },
  error: (message: string, data?: any) => {
    console.error(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  }
};

export const secureLog = logger;