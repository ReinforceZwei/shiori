'use client';
import { ModalsProvider } from '@mantine/modals';
import NewBookmarkModal from '@/features/bookmark/modal/NewBookmarkModal';
import NewCollectionModal from '@/features/collection/modal/NewCollectionModal';

const shioriModals = {
  newBookmark: NewBookmarkModal,
  newCollection: NewCollectionModal,
};

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