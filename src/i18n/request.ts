import { getRequestConfig } from 'next-intl/server';
import { getMessageFallback, onError } from './fallback';
 
export default getRequestConfig(async () => {
  // Static for now, we'll change this later
  const locale = 'zh-tw';
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    getMessageFallback,
    onError,
  };
});