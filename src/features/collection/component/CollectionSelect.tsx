'use client';

import { Select, Group, Box } from '@mantine/core';
import { forwardRef } from 'react';
import type { Collection } from '@/generated/prisma/browser';

interface ItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  label: string;
  color?: string | null;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, color, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group gap="sm">
        {color && (
          <Box
            w={12}
            h={12}
            style={{ borderRadius: '50%', backgroundColor: color }}
          />
        )}
        <span>{label}</span>
      </Group>
    </div>
  )
);

SelectItem.displayName = 'SelectItem';

interface CollectionSelectProps {
  data: Collection[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: React.ReactNode;
  required?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

const CollectionSelect = forwardRef<HTMLInputElement, CollectionSelectProps>(
  (
    {
      data,
      value,
      defaultValue,
      onChange,
      label,
      placeholder,
      error,
      required,
      onBlur,
      onFocus,
    },
    ref
  ) => {
    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder}
        data={data.map((c) => ({
          value: c.id,
          label: c.name,
          color: c.color,
        }))}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        clearable
        searchable
        error={error}
        required={required}
        onBlur={onBlur}
        onFocus={onFocus}
        renderOption={(item) => <SelectItem {...item.option} />}
      />
    );
  }
);

CollectionSelect.displayName = 'CollectionSelect';

export default CollectionSelect;
