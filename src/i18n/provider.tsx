"use client";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";
import { getMessageFallback, onError } from "./fallback";
import { useEffect, useState } from "react";
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
  const { data: session } = authClient.useSession();

  // Update locale and messages when user signs in
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
    if (session) {
      fetchLocale();
    }
  }, [session, localeState]);

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
