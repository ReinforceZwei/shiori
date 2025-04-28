'use client';
import { CloseButton, Combobox, Input, ScrollArea, useCombobox, UseTreeReturnType } from "@mantine/core";
import { Prisma } from "@/generated/prisma";
import CollectionTree, { TreeNodeEventHandler } from "../CollectionTree/CollectionTree";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface CollectionSelectProps {
  data: Prisma.CollectionGetPayload<{}>[];
  value?: string;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: ReactNode;
  required?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  disableOptions?: Prisma.CollectionGetPayload<{}>[];
}

export default function CollectionSelect(props: CollectionSelectProps) {
  const {
    data: collections,
    value: initialValue,
    onChange,
    placeholder,
    disabled,
    label,
    error,
    required,
    onBlur,
    onFocus,
    disableOptions,
    ...rest
  } = props;

  const combobox = useCombobox({
    onDropdownOpen: () => onFocus?.(),
    onDropdownClose: () => onBlur?.(),
  });
  const [value, setValue] = useState<Prisma.CollectionGetPayload<{}> | null>(
    initialValue ? collections.find((collection) => collection.id === initialValue) || null : null
  );
  const treeRef = useRef<UseTreeReturnType>(null);

  useEffect(() => {
    if (treeRef.current) {
      treeRef.current.expandAllNodes();
    }
  }, [treeRef.current]);

  const nodeOnClick: TreeNodeEventHandler = (collectionId, tree) => {
    if (collectionId === value?.id) {
      setValue(null);
      onChange?.(null);
    } else {
      setValue(collections.find((collection) => collection.id === collectionId) || null);
      onChange?.(collectionId);
    }
    combobox.closeDropdown();
  }

  const clearSelection = () => {
    setValue(null);
    onChange?.(null);
    treeRef.current?.clearSelected();
  }

  const shouldDisable = useCallback((collectionId: string, tree: UseTreeReturnType) => {
    return disableOptions?.some((collection) => collection.id === collectionId) || false;
  }, [disableOptions]);

  return (
    <Combobox
      store={combobox}
    >
      {label && <Input.Label>{label}</Input.Label>}
      <Combobox.Target>
        <Input
          component="button"
          type="button"
          pointer
          rightSection={
            value !== null ? (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => clearSelection()}
                aria-label="Clear value"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={value === null ? 'none' : 'all'}
          onClick={() => combobox.toggleDropdown()}
          disabled={disabled}
          error={error}
          required={required}
          {...rest}
        >
          {value?.name || (placeholder && <Input.Placeholder>{placeholder}</Input.Placeholder>)}
        </Input>
      </Combobox.Target>
      {error && <Input.Error>{error}</Input.Error>}
      <Combobox.Dropdown>
        <ScrollArea.Autosize mah={250} type="scroll">
          <CollectionTree
            collections={collections}
            nodeConfig={{
              selectCheckmark: true,
              onClick: nodeOnClick,
              shouldDisable: shouldDisable,
            }}
            treeRef={treeRef}
            initialSelected={value ? [value.id] : []}
          />
        </ScrollArea.Autosize>
      </Combobox.Dropdown>
    </Combobox>
  );
}