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
  const form = useForm<SignupFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      locale: 'en-US' as const,
    },
    validate: zodResolver(signupFormSchema),
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (values: typeof form.values) => {
    setErrorMessage(''); // Reset error message
    try {
      const response = await authClient.signUp.email(values);
      if (response.error) {
        setErrorMessage(response.error?.message || 'An error occurred during sign-up.');
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
        title: 'Sign-up successful',
        message: 'You have successfully signed up.',
      });
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Sign-up failed:', error);
      setErrorMessage('Sign-up failed. Please try again.');
    }
  };

  return (
    <Box maw={400} mx="auto" mt="xl" p="sm">
      <Title ta="center" order={1} mb="sm">
        Shiori
      </Title>
      <Text ta="center" size="sm" c="dimmed" mb="xl">
        Create your account
      </Text>

      {errorMessage && (
        <Alert title="Sign-up failed" color="red" mb="md" icon={<IconInfoCircle />}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="Enter your name"
          {...form.getInputProps('name')}
          required
          mt="md"
        />

        <TextInput
          label="Email"
          placeholder="Enter your email"
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
                Drop any email here. We won’t send you jack. Fake emails welcome (just don’t forget it, genius).
                </Text>
              </Popover.Dropdown>
            </Popover>
          }
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          {...form.getInputProps('password')}
          required
          mt="md"
        />

        <Box mt="md">
          <Text size="sm" fw={500} mb={4}>
            Language
          </Text>
          <LocaleSwitcher
            value={form.values.locale}
            onChange={(locale) => form.setFieldValue('locale', locale)}
            size="sm"
            width="100%"
          />
        </Box>

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Sign Up
        </Button>
      </form>

      <Text ta="center" mt="lg" size="sm">
        Already have an account?{' '}
        <Text component={Link} href="/signin" c="blue" style={{ textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Text>
      </Text>
    </Box>
  );
}