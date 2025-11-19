'use client';
import { ModalsProvider } from '@mantine/modals';
import modalConfig from './modal.config';

/**
 * Holds all modals for Shiori. Register modals here to make them available throughout the app.
 */
export default function ShioriModalProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ModalsProvider modals={modalConfig}>{children}</ModalsProvider>;
}