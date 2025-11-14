import { useForm } from '@mantine/form';
import { TextInput, Button, Box } from '@mantine/core';

export interface NewCollectionFormValues {
  name: string;
  description: string;
}

interface NewCollectionFormProps {
  onSubmit: (values: NewCollectionFormValues) => void;
}

export default function NewCollectionForm({ onSubmit }: NewCollectionFormProps) {
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

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Create Collection
        </Button>
      </form>
    </Box>
  );
}