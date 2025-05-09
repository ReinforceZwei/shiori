import net from 'net';
import * as ip from 'ip-address';

/**
 * Checks if a given string is a valid IP address (IPv4 or IPv6).
 * @param {string} address - The string to check.
 * @returns {boolean} - True if the string is a valid IP address, false otherwise.
 */
export function isIP(address: string): boolean {
  return net.isIP(address) !== 0;
}

/**
 * Checks if a given IP address is within private IP ranges.
 * @param {string} ipAddress - The IP address to check.
 * @returns {boolean} - True if the IP address is private, false otherwise.
 */
export function isPrivateIP(ipAddress: string): boolean {
  const privateIPv4Ranges = [
    new ip.Address4('10.0.0.0/8'),
    new ip.Address4('172.16.0.0/12'),
    new ip.Address4('192.168.0.0/16'),
    new ip.Address4('127.0.0.0/8'),
  ];

  const privateIPv6Ranges = [
    new ip.Address6('::1/128'), // Loopback
    new ip.Address6('fc00::/7'), // Unique local address
    new ip.Address6('fe80::/10'), // Link-local address
  ];

  if (net.isIPv4(ipAddress)) {
    const addressV4 = new ip.Address4(ipAddress);
    return privateIPv4Ranges.some((range) => addressV4.isInSubnet(range));
  } else if (net.isIPv6(ipAddress)) {
    const addressV6 = new ip.Address6(ipAddress);
    return privateIPv6Ranges.some((range) => addressV6.isInSubnet(range));
  }

  return false;
}