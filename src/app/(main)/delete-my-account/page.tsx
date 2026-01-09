'use client';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { PasswordInput, Button, Box, Title, Text, Alert, Group, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallpaper } from '@/component/layout/Wallpaper';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

// Zod schema for delete account form validation
const deleteAccountFormSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>;

export default function DeleteAccountPage() {
  const router = useRouter();
  const t = useTranslations('DeleteAccount');
  const form = useForm<DeleteAccountFormValues>({
    initialValues: {
      password: '',
    },
    validate: zodResolver(deleteAccountFormSchema),
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (password: string) => {
    setIsDeleting(true);
    setErrorMessage('');
    
    try {
      const response = await authClient.deleteUser({
        password: password,
      });

      if (response.error) {
        setErrorMessage(response.error?.message || t('delete_failed_message'));
        setIsDeleting(false);
        return;
      }

      console.log('Account deleted successfully');
      // Redirect to signin page after successful deletion
      router.push('/signin');
    } catch (error) {
      console.error('Account deletion failed:', error);
      setErrorMessage(t('unexpected_error_message'));
      setIsDeleting(false);
    }
  };

  const openConfirmationModal = (values: typeof form.values) => {
    modals.openConfirmModal({
      title: t('confirm_modal_title'),
      centered: true,
      children: (
        <Text size="sm">
          {t('confirm_modal_message')}{' '}
          <Text component="span" fw={700} c="red">
            {t('confirm_modal_permanent')}
          </Text>
          . {t('confirm_modal_data_removal')}
        </Text>
      ),
      labels: { confirm: t('confirm_modal_confirm'), cancel: t('confirm_modal_cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteAccount(values.password),
    });
  };

  return (
    <Box maw={500} mx="auto" mt="xl" p="sm">
      <Stack gap="md">
        <Box>
          <Title ta="center" order={1} mb="sm" c="red">
            {t('title')}
          </Title>
          <Text ta="center" size="sm" c="dimmed">
            {t('subtitle')}
          </Text>
        </Box>

        <Alert 
          icon={<IconAlertTriangle size={20} />} 
          title={t('warning_title')} 
          color="red" 
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm">
              {t('warning_intro')}
            </Text>
            <Box component="ul" style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>
                <Text size="sm">{t('warning_item_account')}</Text>
              </li>
              <li>
                <Text size="sm">{t('warning_item_data')}</Text>
              </li>
              <li>
                <Text size="sm">{t('warning_item_irreversible')}</Text>
              </li>
            </Box>
          </Stack>
        </Alert>

        {errorMessage && (
          <Alert title={t('error_title')} color="red">
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(openConfirmationModal)}>
          <Stack gap="md">
            <PasswordInput
              label={t('password_label')}
              placeholder={t('password_placeholder')}
              {...form.getInputProps('password')}
              required
              description={t('password_description')}
              autoComplete='current-password'
            />

            <Group justify="center" gap="md" mt="md">
              <Button
                variant="default"
                onClick={() => router.push('/')}
                disabled={isDeleting}
              >
                {t('cancel_button')}
              </Button>
              <Button 
                type="submit" 
                color="red"
                loading={isDeleting}
              >
                {t('delete_button')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}

