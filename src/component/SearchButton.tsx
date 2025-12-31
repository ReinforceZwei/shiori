import {
  Button,
  Group,
  Kbd,
  Text,
  ElementProps,
  ActionIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

export function SearchButton({
  label = "Search",
  shortcut = "⌘ + K",
  ...props
}: ElementProps<"button"> & { label?: string; shortcut?: string }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <ActionIcon variant="light" size="lg" {...props}>
        <IconSearch size={20} />
      </ActionIcon>
    );
  }

  return (
    <Button leftSection={<IconSearch size={16} />} {...props} variant="light">
      <Group>
        <Text fz="sm">{label}</Text>
        <Kbd>{shortcut}</Kbd>
      </Group>
    </Button>
  );
}
