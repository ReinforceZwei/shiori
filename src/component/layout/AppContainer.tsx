import { Container, ContainerProps } from "@mantine/core";
import { forwardRef } from "react";

export const AppContainer = forwardRef<HTMLDivElement, ContainerProps>(
  (props, ref) => {
    return <Container ref={ref} size="xl" p={0} {...props} />;
  }
);

AppContainer.displayName = "AppContainer";