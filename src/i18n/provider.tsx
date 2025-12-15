"use client";
import { NextIntlClientProvider } from "next-intl";
import { getMessageFallback, onError } from "./fallback";

export const IntlClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const locale = "zh-tw";
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
