import type { MantineColorScheme } from '@mantine/core';

export interface SetColorSchemeScriptProps extends React.ComponentPropsWithoutRef<'script'> {
  colorScheme?: MantineColorScheme;
  localStorageKey?: string;
}

const getScript = ({
  colorScheme,
  localStorageKey,
}: Pick<SetColorSchemeScriptProps, 'colorScheme' | 'localStorageKey'>) =>
  `try {
  window.localStorage.setItem("${localStorageKey}", "${colorScheme}");
} catch (e) {}
`;

/**
 * Copied from Mantine source code. 
 * Allow server to update mantine color scheme localStorage value before hydration,
 * to avoid localStorage value override server color scheme.
 * Put this before Mantine `ColorSchemeScript`
 */
export function SetColorSchemeScript({
  colorScheme = 'light',
  localStorageKey = 'mantine-color-scheme-value',
  ...others
}: SetColorSchemeScriptProps) {
  return (
    <script
      {...others}
      data-mantine-script
      dangerouslySetInnerHTML={{
        __html: getScript({
          colorScheme,
          localStorageKey,
        }),
      }}
    />
  );
}