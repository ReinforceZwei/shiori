import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Select } from '@mantine/core';
import { Prisma } from '@/generated/prisma';
import CollectionSelect from '../component/CollectionSelect/CollectionSelect';
import { useMemo } from 'react';

export interface EditCollectionFormValues {
  name: string;
  description: string;
  parentId?: string;
}

interface EditCollectionFormProps {
  onSubmit: (values: EditCollectionFormValues) => void;
  collections: Prisma.CollectionGetPayload<{}>[];
  collectionId: string;
  initialValues: EditCollectionFormValues;
}

export default function EditCollectionForm({ onSubmit, collections, collectionId, initialValues }: EditCollectionFormProps) {
  const form = useForm<EditCollectionFormValues>({
    initialValues,

    validate: {
      name: (value) => (value ? null : 'Name is required'),
      description: (value) => (value.length <= 200 ? null : 'Description must be 200 characters or less'),
      parentId: (value) => {
        console.log('validating parentId', value);
        console.log('collectionId', collectionId);
        console.log(value === collectionId)
        if (value === collectionId) {
          return 'Parent collection cannot be the same as the current collection';
        }
      }
    },
    validateInputOnBlur: true,
  });
  const collection = useMemo(() => collections.find((collection) => collection.id === collectionId), [collections, collectionId]);

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="Name"
          placeholder="Enter collection name"
          {...form.getInputProps('name')}
          required
        />

        <TextInput
          label="Description"
          placeholder="Enter collection description (optional)"
          {...form.getInputProps('description')}
        />

        {/* <Select
          label="Parent Collection"
          placeholder="Select a parent collection (optional)"
          data={collections.map((collection) => ({ value: collection.id, label: collection.name }))}
          {...form.getInputProps('parentId')}
        /> */}

        <CollectionSelect
          label="Parent Collection"
          placeholder="Select a parent collection (optional)"
          data={collections}
          disableOptions={[collection!]}
          {...form.getInputProps('parentId')}
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Save Changes
        </Button>
      </form>
    </Box>
  );
}