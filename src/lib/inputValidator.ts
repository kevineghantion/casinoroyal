// Input validation and sanitization utilities
export const validateAndSanitize = {
  // Validate UUID format
  uuid: (input: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input);
  },

  // Sanitize string input
  string: (input: string, maxLength = 255): string => {
    return String(input)
      .replace(/[<>\"'&]/g, '') // Remove potential injection chars
      .trim()
      .substring(0, maxLength);
  },

  // Validate email format
  email: (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) && input.length <= 255;
  },

  // Validate username (alphanumeric only)
  username: (input: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9]{1,16}$/;
    return usernameRegex.test(input);
  },

  // Validate numeric input
  number: (input: any): number | null => {
    const num = parseFloat(input);
    return isNaN(num) ? null : num;
  }
};