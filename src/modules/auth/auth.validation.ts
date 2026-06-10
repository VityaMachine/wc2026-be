export function validateUsername(username: string): void {
  if (username.length < 5) {
    const error = new Error('Username must be at least 5 characters long');
    (error as any).status = 400;
    throw error;
  }

  if (username.length > 20) {
    const error = new Error('Username must be at most 20 characters long');
    (error as any).status = 400;
    throw error;
  }

  if (!/^[A-Za-z0-9]+$/.test(username)) {
    const error = new Error(
      'Username may contain only latin letters and numbers',
    );
    (error as any).status = 400;
    throw error;
  }

  const lettersCount = (username.match(/[A-Za-z]/g) || []).length;
  if (lettersCount < 3) {
    const error = new Error('Username must contain at least 3 letters');
    (error as any).status = 400;
    throw error;
  }
}
