"use client";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { getMessageFallback, onError } from "./fallback";

export const IntlClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const locale = useLocale();
  return (
    <NextIntlClientProvider
      locale={locale}
      getMessageFallback={getMessageFallback}
      onError={onError}
    >
      {children}
    </NextIntlClientProvider>
  );
};
