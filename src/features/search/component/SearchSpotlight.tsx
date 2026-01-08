'use client';

import { createSpotlight, Spotlight, SpotlightActionData } from "@mantine/spotlight";
import { IconSearch, IconExternalLink, IconWorld } from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useSearchQuery } from "@/features/search/query";
import { useDebouncedValue } from "@mantine/hooks";
import { selectAction } from "./store";
import { Box, Image } from "@mantine/core";

const [store, storeActions] = createSpotlight();

export function SearchSpotlight() {
  const t = useTranslations('SearchSpotlight');
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  
  const { data: searchResults, isLoading } = useSearchQuery(debouncedQuery);

  // Transform search results into Spotlight actions
  const actions: SpotlightActionData[] = useMemo(() => {
    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    return searchResults.map((bookmark) => {
      const iconId = bookmark.websiteIcon?.id;
      
      return {
        id: bookmark.id,
        label: bookmark.title,
        description: bookmark.url,
        onClick: () => {
          window.open(bookmark.url, '_blank', 'noopener,noreferrer');
        },
        leftSection: !iconId ? (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
            }}
          >
            <IconWorld size={32} opacity={0.3} />
          </Box>
        ) : (
          <Image
            src={`/api/icon/${iconId}`}
            w={32}
            h={32}
            fit="contain"
          />
        ),
        rightSection: <IconExternalLink size={16} />,
      };
    });
  }, [searchResults]);

  useEffect(() => {
    // Spotlight should highlight the first action by default
    // but it doesnt work for dynamic actions
    // so we need to manually select the first action
    selectAction(0, store);
  }, [actions]);
  
  return (
    <Spotlight
      store={store}
      actions={actions}
      searchProps={{
        leftSection: <IconSearch size={16} />,
      }}
      query={searchQuery}
      onQueryChange={(query) => setSearchQuery(query)}
      limit={10}
      nothingFound={
        isLoading 
          ? t('searching') 
          : searchQuery 
            ? t('no_bookmarks_found') 
            : t('type_to_search')
      }
      highlightQuery
      filter={() => actions}
    />
  );
}

export { storeActions };