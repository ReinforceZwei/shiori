'use client';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { TextInput, PasswordInput, Button, Box, Title, Text, Alert, Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Zod schema for sign-in form validation
const signinFormSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

type SigninFormValues = z.infer<typeof signinFormSchema>;

export default function SigninPage() {
  const router = useRouter();
  const t = useTranslations('Signin');
  const form = useForm<SigninFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validate: zodResolver(signinFormSchema),
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (values: typeof form.values) => {
    setErrorMessage(''); // Reset error message
    try {
      const response = await authClient.signIn.email(values);
      if (response.error) {
        setErrorMessage(response.error?.message || t('sign_in_error_message'));
        return;
      }

      console.log('Sign-in successful:', response);
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Sign-in failed:', error);
      setErrorMessage(t('sign_in_failed_message'));
    }
  };

  return (
    <Box maw={400} mx="auto" mt="xl" p="sm">
      <Title ta="center" order={1} mb="sm">
        Shiori
      </Title>
      <Text ta="center" size="sm" c="dimmed" mb="xl">
        {t('subtitle')}
      </Text>

      {errorMessage && (
        <Alert title={t('sign_in_failed')} color="red" mb="md">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('email')}
          placeholder={t('email_input_placeholder')}
          {...form.getInputProps('email')}
          required
          mt="md"
        />

        <PasswordInput
          label={t('password')}
          placeholder={t('password_input_placeholder')}
          {...form.getInputProps('password')}
          required
          mt="md"
        />

        <Checkbox
          label={t('remember_me')}
          mt="md"
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          {t('sign_in')}
        </Button>
      </form>

      <Text ta="center" mt="lg" size="sm">
        {t('dont_have_an_account')}{' '}
        <Text component={Link} href="/signup" c="blue" style={{ textDecoration: 'none', fontWeight: 500 }}>
          {t('sign_up')}
        </Text>
      </Text>
    </Box>
  );
}