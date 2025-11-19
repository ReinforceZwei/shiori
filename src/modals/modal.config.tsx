import NewBookmarkModal from '@/modals/component/NewBookmarkModal';
import NewCollectionModal from '@/modals/component/NewCollectionModal';
import EditCollectionModal from '@/modals/component/EditCollectionModal';
import EditBookmarkModal from '@/modals/component/EditBookmarkModal';

const modalConfig = {
  newBookmark: NewBookmarkModal,
  newCollection: NewCollectionModal,
  editCollection: EditCollectionModal,
  editBookmark: EditBookmarkModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modalConfig;
  }
}

export default modalConfig;