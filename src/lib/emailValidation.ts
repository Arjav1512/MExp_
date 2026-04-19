const EMAIL_REGEX =
  /^[a-zA-Z0-9]([a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  if (email.length > 320) return false;

  const atIndex = email.indexOf('@');
  if (atIndex < 1 || atIndex > 64) return false;

  const local = email.slice(0, atIndex);
  if (/\.\./.test(local)) return false;

  const domain = email.slice(atIndex + 1);
  if (/\.\./.test(domain)) return false;

  return EMAIL_REGEX.test(email);
}
