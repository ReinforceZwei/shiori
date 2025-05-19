'use client';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Box, Title, Text, Alert, Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SigninPage() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (values: typeof form.values) => {
    setErrorMessage(''); // Reset error message
    try {
      const response = await authClient.signIn.email(values);
      if (response.error) {
        setErrorMessage(response.error?.message || 'An error occurred during sign-in.');
        return;
      }

      console.log('Sign-in successful:', response);
      notifications.show({
        title: 'Sign-in successful',
        message: 'You have successfully signed in.',
      });
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Sign-in failed:', error);
      setErrorMessage('Sign-in failed. Please try again.');
    }
  };

  return (
    <Box maw={400} mx="auto" mt="xl">
      <Title ta="center" order={1} mb="sm">
        Shiori
      </Title>
      <Text ta="center" size="sm" c="dimmed" mb="xl">
        Sign in to your account
      </Text>

      {errorMessage && (
        <Alert title="Sign-in failed" color="red" mb="md">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Email"
          placeholder="Enter your email"
          {...form.getInputProps('email')}
          required
          mt="md"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          {...form.getInputProps('password')}
          required
          mt="md"
        />

        <Checkbox
          label="Remember me"
          mt="md"
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Sign In
        </Button>
      </form>
    </Box>
  );
}