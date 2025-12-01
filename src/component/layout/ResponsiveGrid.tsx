import { Box, BoxProps, MantineSpacing, useMantineTheme } from "@mantine/core";
import { ReactNode } from "react";

interface ResponsiveGridProps extends Omit<BoxProps, 'style'> {
  /** Minimum width for each grid item (in px) */
  minItemWidth: number;
  /** Maximum width for each grid item (in px, optional). If not provided, items will grow to fill space */
  maxItemWidth?: number;
  /** Gap between items (Mantine spacing or px) */
  spacing?: MantineSpacing;
  /** Vertical spacing (defaults to spacing if not provided) */
  verticalSpacing?: MantineSpacing;
  /** Children to render in grid */
  children: ReactNode;
  /** Additional custom styles */
  style?: React.CSSProperties;
}

/**
 * ResponsiveGrid - A truly responsive grid component that automatically adjusts columns based on available space
 * 
 * This component uses CSS Grid's auto-fit feature to automatically calculate the optimal number of columns
 * based on the container width and the min/max item widths you specify.
 * 
 * @example
 * ```tsx
 * <ResponsiveGrid minItemWidth={100} maxItemWidth={140} spacing="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </ResponsiveGrid>
 * ```
 */
export function ResponsiveGrid({
  minItemWidth,
  maxItemWidth,
  spacing = "md",
  verticalSpacing,
  children,
  style,
  ...boxProps
}: ResponsiveGridProps) {
  const theme = useMantineTheme();

  // Convert Mantine spacing to actual values
  const getSpacing = (spacingValue: MantineSpacing): string => {
    if (typeof spacingValue === "number") return `${spacingValue}px`;
    return theme.spacing[spacingValue] || spacingValue;
  };

  const horizontalGap = getSpacing(spacing);
  const verticalGap = verticalSpacing 
    ? getSpacing(verticalSpacing) 
    : horizontalGap;

  const maxWidth = maxItemWidth ? `${maxItemWidth}px` : "1fr";

  return (
    <Box
      {...boxProps}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, ${maxWidth}))`,
        gap: `${verticalGap} ${horizontalGap}`,
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

