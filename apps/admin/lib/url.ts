export function isAbsoluteUrl(path: string): boolean {
  try {
    const url = new URL(path);
    return Boolean(url.protocol && url.host);
  } catch (error) {
    return false;
  }
}
