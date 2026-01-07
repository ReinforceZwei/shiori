'use client';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { TextInput, PasswordInput, Button, Box, Title, Text, Alert, Popover } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LocaleSwitcher } from '@/component/LocaleSwitcher';
import { locales } from '@/i18n/locale';
import { initSettingsAction } from '@/app/actions/settings';
import { useTranslations, useLocale } from 'next-intl';
import { Wallpaper } from '@/component/layout/Wallpaper';
import { useAppConfig } from '@/lib/config/client';

// Zod schema for sign-up form validation
const signupFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  locale: z.enum(locales),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations('Signup');
  const tMetadata = useTranslations('metadata');
  const locale = useLocale();
  const config = useAppConfig();
  const form = useForm<SignupFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      locale: locale as (typeof locales)[number],
    },
    validate: zodResolver(signupFormSchema),
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (values: typeof form.values) => {
    setErrorMessage(''); // Reset error message
    try {
      const response = await authClient.signUp.email(values);
      if (response.error) {
        setErrorMessage(response.error?.message || t('sign_up_error_message'));
        return;
      }
      try {
        await initSettingsAction({
          locale: values.locale,
        });
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      }
      console.log('Sign-up successful:', response);
      notifications.show({
        title: t('sign_up_successful'),
        message: t('sign_up_success_message'),
      });
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Sign-up failed:', error);
      setErrorMessage(t('sign_up_failed_message'));
    }
  };

  if (config.auth.disableSignup) {
    return (
      <Box maw={400} mx="auto" mt="xl" p="sm">
        <Wallpaper imageUrl={'/shiori-bg-transparent.webp'} displayPosition='right bottom' />
        <Title ta="center" order={1} mb="sm">
          {tMetadata('title')}
        </Title>
        <Alert title={t('sign_up_disabled')} color="yellow" mb="md" icon={<IconInfoCircle />}>
          {t('sign_up_disabled_message')}
        </Alert>
        <Text ta="center" mt="lg" size="sm">
          {t('already_have_an_account')}{' '}
          <Text component={Link} href="/signin" c="blue" style={{ textDecoration: 'none', fontWeight: 500 }}>
            {t('sign_in')}
          </Text>
        </Text>
      </Box>
    );
  }

  return (
    <Box maw={400} mx="auto" mt="xl" p="sm">
      <Wallpaper imageUrl={'/shiori-bg-transparent.webp'} displayPosition='right bottom' />
      <Title ta="center" order={1} mb="sm">
        {tMetadata('title')}
      </Title>
      <Text ta="center" size="sm" c="dimmed" mb="xl">
        {t('subtitle')}
      </Text>

      {errorMessage && (
        <Alert title={t('sign_up_failed')} color="red" mb="md" icon={<IconInfoCircle />}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('name')}
          placeholder={t('name_input_placeholder')}
          {...form.getInputProps('name')}
          required
          mt="md"
        />

        <TextInput
          label={t('email')}
          placeholder={t('email_input_placeholder')}
          {...form.getInputProps('email')}
          required
          mt="md"
          rightSection={
            <Popover width={220} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <IconInfoCircle size={16} style={{ cursor: 'pointer' }} />
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="sm">
                  {t('email_info_popover')}
                </Text>
              </Popover.Dropdown>
            </Popover>
          }
        />

        <PasswordInput
          label={t('password')}
          placeholder={t('password_input_placeholder')}
          {...form.getInputProps('password')}
          required
          mt="md"
        />

        <Box mt="md">
          <Text size="sm" fw={500} mb={4}>
            {t('language')}
          </Text>
          <LocaleSwitcher
            value={form.values.locale}
            onChange={(locale) => form.setFieldValue('locale', locale)}
            size="sm"
            width="100%"
          />
        </Box>

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          {t('sign_up')}
        </Button>
      </form>

      <Text ta="center" mt="lg" size="sm">
        {t('already_have_an_account')}{' '}
        <Text component={Link} href="/signin" c="blue" style={{ textDecoration: 'none', fontWeight: 500 }}>
          {t('sign_in')}
        </Text>
      </Text>
    </Box>
  );
}