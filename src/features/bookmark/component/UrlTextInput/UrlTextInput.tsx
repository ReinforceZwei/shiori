import { TextInput, TextInputProps, Input, InputProps } from '@mantine/core';
import { forwardRef, ReactNode } from 'react';

export interface UrlTextInputProps extends TextInputProps {
  label?: string;
  description?: string;
  error?: ReactNode;
}

export const UrlTextInput = forwardRef<HTMLInputElement, UrlTextInputProps>(
  (props, ref) => {
    const { label, ...rest } = props;
    return (
      <>
        { label && (<Input.Label>{label}</Input.Label>) }
        <TextInput
          ref={ref}
          description={props.description}
          error={props.error}
          {...rest}
        />
      </>
    );
  }
);

UrlTextInput.displayName = 'UrlTextInput';