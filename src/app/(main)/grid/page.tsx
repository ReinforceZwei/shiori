"use client";

import { ResponsiveGrid } from "@/component/layout/ResponsiveGrid";
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Badge, 
  Group,
  Box,
  Code,
  Divider,
  Card,
  SimpleGrid,
  Switch,
} from "@mantine/core";
import { useState } from "react";
import { IconBox } from "@tabler/icons-react";

export default function GridDemoPage() {
  const [useResponsiveGrid, setUseResponsiveGrid] = useState(true);
  const [minWidth, setMinWidth] = useState(100);
  const [maxWidth, setMaxWidth] = useState(140);

  // Generate demo items
  const demoItems = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    color: [
      "blue", "red", "green", "yellow", "orange", "purple", "pink", "teal"
    ][i % 8],
  }));

  const GridComponent = useResponsiveGrid ? ResponsiveGrid : SimpleGrid;

  return (
    <Container fluid py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={1} mb="sm">
            ResponsiveGrid Component Demo
          </Title>
          <Text c="dimmed">
            A truly responsive grid that automatically adjusts columns based on screen width
          </Text>
        </Box>

        <Divider />

        {/* Controls */}
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Configuration</Title>
            
            <Group>
              <Switch
                label="Use ResponsiveGrid"
                description="Toggle to compare with SimpleGrid"
                checked={useResponsiveGrid}
                onChange={(event) => setUseResponsiveGrid(event.currentTarget.checked)}
              />
            </Group>

            {useResponsiveGrid && (
              <Box>
                <Text size="sm" fw={500} mb="xs">Current Settings:</Text>
                <Group gap="xs">
                  <Badge variant="light">minItemWidth: {minWidth}px</Badge>
                  <Badge variant="light">maxItemWidth: {maxWidth}px</Badge>
                  <Badge variant="light">spacing: md</Badge>
                </Group>
              </Box>
            )}

            <Box>
              <Text size="sm" c="dimmed">
                {useResponsiveGrid 
                  ? "ResponsiveGrid automatically calculates columns based on available width"
                  : "SimpleGrid uses fixed breakpoints (base: 4, xs: 5, sm: 6, md: 7, lg: 9, xl: 11)"
                }
              </Text>
            </Box>
          </Stack>
        </Card>

        <Divider />

        {/* Example 1: Default Configuration */}
        <Box>
          <Title order={3} mb="md">
            Example 1: Default Configuration
          </Title>
          <Text c="dimmed" mb="md">
            Min width: 100px, Max width: 140px, Spacing: md
          </Text>
          
          {useResponsiveGrid ? (
            <ResponsiveGrid
              minItemWidth={100}
              maxItemWidth={140}
              spacing="md"
            >
              {demoItems.slice(0, 20).map((item) => (
                <Paper
                  key={item.id}
                  p="md"
                  withBorder
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    height: "120px",
                    justifyContent: "center",
                  }}
                >
                  <IconBox size={32} stroke={1.5} />
                  <Text size="sm" fw={500}>
                    {item.title}
                  </Text>
                  <Badge size="xs" variant="light" color={item.color}>
                    {item.color}
                  </Badge>
                </Paper>
              ))}
            </ResponsiveGrid>
          ) : (
            <SimpleGrid
              cols={{ base: 4, xs: 5, sm: 6, md: 7, lg: 9, xl: 11 }}
              spacing="md"
            >
              {demoItems.slice(0, 20).map((item) => (
                <Paper
                  key={item.id}
                  p="md"
                  withBorder
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    height: "120px",
                    justifyContent: "center",
                  }}
                >
                  <IconBox size={32} stroke={1.5} />
                  <Text size="sm" fw={500}>
                    {item.title}
                  </Text>
                  <Badge size="xs" variant="light" color={item.color}>
                    {item.color}
                  </Badge>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Box>

        <Divider />

        {/* Example 2: Compact Configuration */}
        <Box>
          <Title order={3} mb="md">
            Example 2: Compact Configuration
          </Title>
          <Text c="dimmed" mb="md">
            Min width: 80px, Max width: 110px, Spacing: sm
          </Text>
          
          <ResponsiveGrid
            minItemWidth={80}
            maxItemWidth={110}
            spacing="sm"
          >
            {demoItems.slice(0, 30).map((item) => (
              <Paper
                key={item.id}
                p="xs"
                withBorder
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  height: "80px",
                  justifyContent: "center",
                }}
              >
                <IconBox size={24} stroke={1.5} />
                <Text size="xs" fw={500}>
                  {item.title}
                </Text>
              </Paper>
            ))}
          </ResponsiveGrid>
        </Box>

        <Divider />

        {/* Example 3: Flexible Width (No Max) */}
        <Box>
          <Title order={3} mb="md">
            Example 3: Flexible Width
          </Title>
          <Text c="dimmed" mb="md">
            Min width: 150px, No max width (items grow to fill space), Spacing: lg
          </Text>
          
          <ResponsiveGrid
            minItemWidth={150}
            spacing="lg"
          >
            {demoItems.slice(0, 12).map((item) => (
              <Card
                key={item.id}
                withBorder
                p="lg"
                style={{
                  height: "150px",
                }}
              >
                <Stack gap="xs" align="center" justify="center" h="100%">
                  <IconBox size={40} stroke={1.5} />
                  <Text size="lg" fw={600}>
                    {item.title}
                  </Text>
                  <Badge variant="filled" color={item.color}>
                    {item.color}
                  </Badge>
                </Stack>
              </Card>
            ))}
          </ResponsiveGrid>
        </Box>

        <Divider />

        {/* Code Example */}
        <Box>
          <Title order={3} mb="md">
            Usage Example
          </Title>
          <Paper p="md" withBorder bg="gray.0">
            <Code block>
{`import { ResponsiveGrid } from "@/component/layout/ResponsiveGrid";

// Basic usage
<ResponsiveGrid 
  minItemWidth={100} 
  maxItemWidth={140} 
  spacing="md"
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveGrid>

// Compact configuration
<ResponsiveGrid 
  minItemWidth={80} 
  maxItemWidth={110} 
  spacing="sm"
>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</ResponsiveGrid>

// Flexible width (no max)
<ResponsiveGrid 
  minItemWidth={150} 
  spacing="lg"
>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</ResponsiveGrid>`}
            </Code>
          </Paper>
        </Box>

        {/* Benefits */}
        <Box>
          <Title order={3} mb="md">
            Benefits
          </Title>
          <Stack gap="sm">
            <Group gap="xs">
              <Badge color="green">✓</Badge>
              <Text>Automatically adapts to any screen width (including ultrawide monitors)</Text>
            </Group>
            <Group gap="xs">
              <Badge color="green">✓</Badge>
              <Text>No need to define breakpoints manually</Text>
            </Group>
            <Group gap="xs">
              <Badge color="green">✓</Badge>
              <Text>Drop-in replacement for SimpleGrid</Text>
            </Group>
            <Group gap="xs">
              <Badge color="green">✓</Badge>
              <Text>Control item sizes with min/max widths</Text>
            </Group>
            <Group gap="xs">
              <Badge color="green">✓</Badge>
              <Text>Type-safe with full TypeScript support</Text>
            </Group>
          </Stack>
        </Box>

        {/* Resize Instructions */}
        <Paper p="lg" withBorder bg="blue.0">
          <Title order={4} c="blue.9" mb="sm">
            💡 Try This
          </Title>
          <Text c="blue.9">
            Resize your browser window to see how the grid automatically adjusts the number of columns. 
            On ultrawide monitors (21:9 or wider), you&apos;ll see more columns compared to SimpleGrid&apos;s 
            fixed breakpoint approach.
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}

