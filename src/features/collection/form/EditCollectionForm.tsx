import { useForm } from '@mantine/form';
import { TextInput, Button, Box } from '@mantine/core';

export interface EditCollectionFormValues {
  name: string;
  description: string;
}

interface EditCollectionFormProps {
  onSubmit: (values: EditCollectionFormValues) => void;
  initialValues: EditCollectionFormValues;
}

export default function EditCollectionForm({ onSubmit, initialValues }: EditCollectionFormProps) {
  const form = useForm<EditCollectionFormValues>({
    initialValues,

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
          Save Changes
        </Button>
      </form>
    </Box>
  );
}