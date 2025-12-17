import { IntlErrorCode } from "next-intl";
import type { RequestConfig } from "next-intl/server"
import enMessages from '../../messages/en-US.json';

export const getMessageFallback: NonNullable<RequestConfig['getMessageFallback']> = ({ namespace, key, error }) => {
  const messages = enMessages;
  
  // If namespace is provided, try to access nested message
  if (namespace && messages[namespace as keyof typeof messages]) {
    const namespaceMessages = messages[namespace as keyof typeof messages] as Record<string, string>;
    if (namespaceMessages && typeof namespaceMessages === 'object' && key in namespaceMessages) {
      return namespaceMessages[key] as string;
    }
  }
  
  // Fallback to top-level key if namespace lookup failed or no namespace provided
  if (key && key in messages) {
    return messages[key as keyof typeof messages] as string;
  }
  
  // Return raw key if message not found
  return `[${namespace}.${key}]`;
};

export const onError: NonNullable<RequestConfig['onError']> = (error) => {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // ignore and use the fallback
    return;
  }
  console.error(error);
};