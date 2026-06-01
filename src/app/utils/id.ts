// Utility function to generate unique IDs
export const id = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};
