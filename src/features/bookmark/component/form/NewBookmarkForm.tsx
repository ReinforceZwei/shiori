import { useForm } from '@mantine/form';
import { TextInput, Button, Box } from '@mantine/core';

interface NewBookmarkFormValues {
  title: string;
  url: string;
}

export default function NewBookmarkForm({ onSubmit }: { onSubmit: (values: NewBookmarkFormValues) => void }) {
  const form = useForm<NewBookmarkFormValues>({
    initialValues: {
      title: '',
      url: '',
    },

    validate: {
      title: (value) => (value ? null : 'Title is required'),
      url: (value) => (/^https?:\/\/.+/.test(value) ? null : 'Invalid URL'),
    },
    validateInputOnBlur: true,
  });

  console.log('Error of form', form.errors)

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="URL"
          placeholder="Enter bookmark URL"
          {...form.getInputProps('url')}
          required
        />
        
        <TextInput
          label="Title"
          placeholder="Enter bookmark title"
          {...form.getInputProps('title')}
          required
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Create Bookmark
        </Button>
      </form>
    </Box>
  );
}