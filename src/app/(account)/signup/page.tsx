'use client'
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Box, Title, Text, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },

    validate: {
      name: (value) => (value ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
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
    <Box maw={400} mx="auto" mt="xl">
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
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          {...form.getInputProps('password')}
          required
          mt="md"
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Sign Up
        </Button>
      </form>
    </Box>
  );
}