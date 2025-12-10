import { Affix, Transition, Alert, Group, Text, Button } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";

interface ImportFloatingPanelProps {
  show: boolean;
  onClick: () => void;
}

export function ImportFloatingPanel({
  show,
  onClick,
}: ImportFloatingPanelProps) {
  const [scroll, scrollTo] = useWindowScroll();
  return (
    <Affix
      position={{ bottom: 20, left: "50%" }}
      style={{ transform: "translateX(-50%)" }}
    >
      <Transition transition="slide-up" mounted={scroll.y > 0 && show}>
        {(styles) => (
          <Alert
            color="blue"
            variant="light"
            style={{
              ...styles,
              backdropFilter: "blur(5px)",
              borderRadius: "50px",
            }}
          >
            <Group gap="md" justify="center">
              <Text size="sm">Confirm Import</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconCheck size={16} />}
                onClick={onClick}
              >
                Import
              </Button>
            </Group>
          </Alert>
        )}
      </Transition>
    </Affix>
  );
}
