import dns from 'dns/promises';
import { isIP, isPrivateIP } from './utils';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
}

export async function fetchUrl(url: string, init?: RequestInit){
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const requestOptions: RequestInit = {
    ...init,
    headers: {
      ...headers,
      ...init?.headers,
    },
    redirect: 'manual',
  }

  let ipAddress;

  if (isIP(hostname)) {
    // If hostname is an IP address, validate it
    ipAddress = hostname;
    if (isPrivateIP(ipAddress)) {
      throw new Error('Access to private IP ranges is not allowed.');
    }
  } else {
    // If hostname is a domain name, resolve it to an IP address
    const addresses = await dns.resolve(hostname);
    if (addresses.some((address) => isPrivateIP(address))) {
      throw new Error('Access to private IP ranges is not allowed.');
    }
  }

  // Manually handle HTTP redirection
  let response = await fetch(url, requestOptions);
  while (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
    const redirectUrl = response.headers.get('location')!;
    const redirectParsedUrl = new URL(redirectUrl);
    const redirectHostname = redirectParsedUrl.hostname;

    if (isIP(redirectHostname)) {
      ipAddress = redirectHostname;
      if (isPrivateIP(ipAddress)) {
        throw new Error('Redirect to private IP ranges is not allowed.');
      }
    } else {
      const redirectAddresses = await dns.resolve(redirectHostname);
      ipAddress = redirectAddresses[0];
      if (isPrivateIP(ipAddress)) {
        throw new Error('Redirect to private IP ranges is not allowed.');
      }
    }
    response = await fetch(redirectUrl, requestOptions);
  }

  return response;
}