"use client";

import {
  Container,
  Stack,
  Center,
  Box,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconBookmark, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NotFoundPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Container size="xl" p={0}>
      <Center style={{ minHeight: "100vh" }}>
        <Stack gap="xl" align="center">
          {/* Animated 404 with bookmarks */}
          <Box
            style={{
              position: "relative",
              fontSize: "8rem",
              fontWeight: 900,
              lineHeight: 1,
              color: "var(--mantine-color-gray-3)",
              userSelect: "none",
            }}
          >
            <Group gap="lg" justify="center" wrap="nowrap">
              {/* First 4 */}
              <Box
                style={{
                  position: "relative",
                  transform: mounted ? "translateY(0)" : "translateY(-50px)",
                  opacity: mounted ? 1 : 0,
                  transition: "all 0.6s ease-out",
                }}
              >
                4
              </Box>

              {/* Middle 0 */}
              <Box
                style={{
                  position: "relative",
                  transform: mounted ? "scale(1)" : "scale(0)",
                  opacity: mounted ? 1 : 0,
                  transition: "all 0.6s ease-out 0.2s",
                }}
              >
                <Box
                  style={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  0
                </Box>
              </Box>

              {/* Last 4 */}
              <Box
                style={{
                  position: "relative",
                  transform: mounted ? "translateY(0)" : "translateY(-50px)",
                  opacity: mounted ? 1 : 0,
                  transition: "all 0.6s ease-out 0.4s",
                }}
              >
                4
              </Box>
            </Group>
          </Box>

          {/* Floating bookmarks decoration */}
          <Box
            style={{
              position: "relative",
              width: "100%",
              height: "100px",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                style={{
                  position: "absolute",
                  left: `${5 + i * 18}%`,
                  transform: mounted
                    ? `translateY(${Math.sin(i) * 20}px)`
                    : "translateY(-100px)",
                  opacity: mounted ? 0.3 : 0,
                  transition: `all 0.8s ease-out ${0.6 + i * 0.1}s`,
                  animation: mounted
                    ? `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.2}s`
                    : "none",
                }}
              >
                <IconBookmark
                  size={30 + i * 5}
                  stroke={1.5}
                  style={{
                    color: `var(--mantine-color-${
                      ["blue", "cyan", "teal", "green", "lime"][i]
                    }-5)`,
                  }}
                />
              </Box>
            ))}
          </Box>

          <Box
            style={{
              transform: mounted
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.8)",
              opacity: mounted ? 1 : 0,
              transition: "all 0.6s ease-out 1s",
            }}
          >
            <ActionIcon
              variant="outline"
              color="dark"
              size="xl"
              radius="xl"
              onClick={() => router.push("/")}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          </Box>
        </Stack>
      </Center>

      {/* Floating animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Container>
  );
}
