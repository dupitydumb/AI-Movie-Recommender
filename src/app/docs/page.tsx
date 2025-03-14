import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  ListItem,
  Text,
  List,
} from "@chakra-ui/react";
import { Provider } from "@/components/ui/provider";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import "./docs.css";
import { ApiDocumentation } from "@/components/ui/api-documentation";
export default function Docs() {
  return (
    <Provider>
      <Header />
      <ApiDocumentation />
      <Footer />
    </Provider>
  );
}
