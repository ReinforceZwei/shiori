import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { TextInput, Button, Box, ColorInput, Stack } from '@mantine/core';

// Predefined color swatches for collections
const COLOR_SWATCHES = [
  '#FF6B6B', // Red
  '#FFA94D', // Orange
  '#FFD43B', // Yellow
  '#8CE99A', // Green
  '#63E6BE', // Teal
  '#74C0FC', // Blue
  '#748FFC', // Indigo
  '#B197FC', // Violet
  '#F783AC', // Pink
  '#FFC9C9', // Light Red
  '#FFE066', // Light Yellow
  '#94D82D', // Lime
  '#66D9E8', // Cyan
  '#91A7FF', // Light Blue
  '#CC5DE8', // Purple
  '#E599F7', // Light Purple
  '#ADB5BD', // Gray
  '#495057', // Dark Gray
];

// Zod schema for form validation
const collectionFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
  color: z.string().optional(),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;

interface CollectionFormProps {
  onSubmit: (values: CollectionFormValues) => void;
  initialValues?: Partial<CollectionFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function CollectionForm({
  onSubmit,
  initialValues,
  submitLabel = 'Create Collection',
  isSubmitting = false,
}: CollectionFormProps) {
  const form = useForm<CollectionFormValues>({
    initialValues: {
      name: '',
      description: '',
      color: '',
      ...initialValues,
    },
    validate: zodResolver(collectionFormSchema),
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
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

          <ColorInput
            label="Color"
            placeholder="Pick a color (optional)"
            {...form.getInputProps('color')}
            swatches={COLOR_SWATCHES}
            swatchesPerRow={9}
          />

          <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

