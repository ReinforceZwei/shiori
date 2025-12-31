import { Grid, Text, Flex } from '@mantine/core';
import { ReactNode } from 'react';

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  labelSpan?: { base?: number; xs?: number; sm?: number; md?: number; lg?: number };
  inputSpan?: { base?: number; xs?: number; sm?: number; md?: number; lg?: number };
}

export function SettingRow({ 
  label, 
  description, 
  children,
  labelSpan = { base: 12, xs: 6, sm: 8 },
  inputSpan = { base: 12, xs: 6, sm: 4 }
}: SettingRowProps) {
  return (
    <>
      <Grid.Col span={labelSpan}>
        <Text size="sm" fw={500} mb={4}>
          {label}
        </Text>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </Grid.Col>
      <Grid.Col span={inputSpan}>
        <Flex justify="flex-end" align="center" h="100%">
          {children}
        </Flex>
      </Grid.Col>
    </>
  );
}

