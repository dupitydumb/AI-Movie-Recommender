// components/Header.js
import { Box, Flex, Heading, Button, Link } from "@chakra-ui/react";
import "../../styles/header.css";
export const Headers = () => {
  return (
    <Box as="header" color="white" p={4} className="header">
      <Flex align="center" justify="space-between">
        <Heading size="lg">Movie Rec</Heading>
        <Flex>
          <Link href="/" px={4} className="menu-item">
            Home
          </Link>
          <Link href="/about" px={4} className="menu-item">
            About
          </Link>
          <Link href="/products" px={4} className="menu-item">
            API
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};
