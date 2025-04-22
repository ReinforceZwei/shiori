import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Select } from '@mantine/core';
import { Prisma } from '@/generated/prisma';

export interface NewCollectionFormValues {
  name: string;
  description: string;
  parentId?: string;
}

interface NewCollectionFormProps {
  onSubmit: (values: NewCollectionFormValues) => void;
  collections: Prisma.CollectionGetPayload<{ include: { parent: true }}>[];
}

export default function NewCollectionForm({ onSubmit, collections }: NewCollectionFormProps) {
  const form = useForm<NewCollectionFormValues>({
    initialValues: {
      name: '',
      description: '',
    },

    validate: {
      name: (value) => (value ? null : 'Name is required'),
      description: (value) => (value.length <= 200 ? null : 'Description must be 200 characters or less'),
    },
    validateInputOnBlur: true,
  });

  console.log(collections)

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

        <Select
          label="Parent Collection"
          placeholder="Select a parent collection (optional)"
          data={collections.map((collection) => ({ value: collection.id, label: collection.name }))}
          {...form.getInputProps('parentId')}
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Create Collection
        </Button>
      </form>
    </Box>
  );
}