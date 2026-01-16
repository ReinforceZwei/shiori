/**
 * Masks an email address by replacing the middle characters of the local part with asterisks
 * @param email - The email address to mask
 * @returns Masked email address (e.g., "r******e@gmail.com")
 * @example
 * maskEmail("reinforce@gmail.com") // returns "r******e@gmail.com"
 * maskEmail("ab@gmail.com") // returns "a*b@gmail.com"
 * maskEmail("a@gmail.com") // returns "a@gmail.com"
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) {
    // Invalid email format, return as is
    return email;
  }
  
  // If local part has 1 character, don't mask
  if (localPart.length === 1) {
    return email;
  }
  
  // If local part has 2 characters, mask the middle
  if (localPart.length === 2) {
    return `${localPart[0]}*${localPart[1]}@${domain}`;
  }
  
  // For 3+ characters, show first and last, mask the middle with 6 asterisks
  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const maskedMiddle = '*'.repeat(6);
  
  return `${firstChar}${maskedMiddle}${lastChar}@${domain}`;
}

