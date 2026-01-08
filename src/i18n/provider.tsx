"use client";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";
import { getMessageFallback, onError } from "./fallback";
import { useEffect, useMemo, useState } from "react";
import { getLocaleAction } from "@/app/actions/settings";
import { locales } from "./locale";
import { authClient } from "@/lib/auth-client";

export const IntlClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const initialLocale = useLocale();
  const initialMessages = useMessages();
  const [localeState, setLocaleState] = useState(initialLocale);
  const [messages, setMessages] = useState<Record<string, any>>(initialMessages);
  // useSession will refetch on tab visibility change
  const { data } = authClient.useSession();
  // data.user contains Date object, cause reference change
  // use stable user ID instead
  const userId = useMemo(() => data?.user?.id, [data]);

  // Update locale and messages when user signs in or locale changes on the server
  useEffect(() => {
    const fetchLocale = async () => {
      try {
        const userLocale = await getLocaleAction();
        console.log('userLocale', userLocale);
        if (userLocale && locales.includes(userLocale as (typeof locales)[number])) {
          // Only update if locale actually changed
          if (userLocale !== localeState) {
            // Load messages for the new locale
            const newMessages = (await import(`../../messages/${userLocale}.json`)).default;
            setMessages(newMessages);
            setLocaleState(userLocale as (typeof locales)[number]);
          }
        }
      } catch (error) {
        console.error('Error getting locale:', error);
      }
    };
    if (userId) {
      fetchLocale();
    }
  }, [userId, localeState]);

  // Sync with server-side locale changes (e.g., after router.refresh())
  useEffect(() => {
    if (initialLocale !== localeState) {
      setLocaleState(initialLocale);
      setMessages(initialMessages);
    }
  }, [initialLocale, initialMessages]);

  return (
    <NextIntlClientProvider
      locale={localeState}
      messages={messages}
      getMessageFallback={getMessageFallback}
      onError={onError}
    >
      {children}
    </NextIntlClientProvider>
  );
};
