import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { Provider } from "@/components/ui/provider";
import { Header } from "@/components/ui/header";
import "./price.css";
const PricePage: React.FC = () => {
  const plans = [
    { name: "Basic", price: "$10/month", features: ["Feature 1", "Feature 2"] },
    {
      name: "Standard",
      price: "$20/month",
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
    {
      name: "Premium",
      price: "$30/month",
      features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    },
  ];

  return (
    <Provider>
      <Header />
      <div className="price-page">
        <Box p={5}>
          <VStack gap={5} alignItems="center" mb={10}>
            <Heading as="h1" size="2xl">
              Pricing Plans
            </Heading>
            <Text fontSize="lg">Choose the plan that suits you best.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
            {plans.map((plan, index) => (
              <Box
                key={index}
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
              >
                <Heading as="h3" size="lg" mb={4}>
                  {plan.name}
                </Heading>
                <Text fontSize="2xl" mb={4}>
                  {plan.price}
                </Text>
                <VStack align="start" gap={2} mb={4}>
                  {plan.features.map((feature, idx) => (
                    <Text key={idx}>✓ {feature}</Text>
                  ))}
                </VStack>
                <Button colorScheme="teal">Choose Plan</Button>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </div>
    </Provider>
  );
};

export default PricePage;
