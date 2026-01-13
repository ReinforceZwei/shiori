"use client";

import { Center, Loader } from "@mantine/core";

export default function Loading() {
  return (
    <Center>
      <Loader size="lg" type="dots" />
    </Center>
  );
}
