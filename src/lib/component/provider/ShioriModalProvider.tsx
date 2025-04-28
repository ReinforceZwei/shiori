'use client';
import { ModalsProvider } from '@mantine/modals';
import NewBookmarkModal from '@/features/bookmark/modal/NewBookmarkModal';
import NewCollectionModal from '@/features/collection/modal/NewCollectionModal';
import EditCollectionModal from '@/features/collection/modal/EditCollectionModal';

const shioriModals = {
  newBookmark: NewBookmarkModal,
  newCollection: NewCollectionModal,
  editCollection: EditCollectionModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof shioriModals;
  }
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