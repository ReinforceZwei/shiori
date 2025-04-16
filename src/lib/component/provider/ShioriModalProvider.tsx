'use client';
import { ModalsProvider } from '@mantine/modals';
import NewBookmarkModal from '@/features/bookmark/component/modal/NewBookmarkModal';

const shioriModals = {
  newBookmark: NewBookmarkModal,
}

/**
 * Holds all modals for Shiori. Register modals here to make them available throughout the app.
 */
export default function ShioriModalProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ModalsProvider modals={shioriModals}>{children}</ModalsProvider>;
}