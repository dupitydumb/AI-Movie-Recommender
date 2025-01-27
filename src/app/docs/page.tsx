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
import "./docs.css";
export default function Docs() {
  return (
    <Provider>
      <div className="docs">
        <Flex>
          <Box
            className="nav"
            width="30ch"
            py={4}
            pr={4}
            borderRight="1px solid"
            borderColor="gray.200"
          >
            <Heading size="md" mb={4}>
              Navigation
            </Heading>
            <List.Root as="ol">
              <List.Item as="ul">
                <a href="#getting-started">Getting Started</a>
              </List.Item>
              <List.Item as="ul">
                <a href="#api-docs">API Documentation</a>
              </List.Item>
              <List.Item as="ul">
                <a href="#example-api-requests">Example API Requests</a>
                <List.Root ps="5" as="ol" className="nested" mt={2}>
                  <List.Item>
                    <Code>GET</Code>TMBD/IMBD
                  </List.Item>
                  <List.Item>
                    <Code>GET</Code>Search
                  </List.Item>
                  <List.Item>
                    <Code>GET</Code>Recommendations
                  </List.Item>
                  <List.Item>
                    <Code>GET</Code>Generate Prompt
                  </List.Item>
                </List.Root>
              </List.Item>
            </List.Root>
          </Box>
          <Box className="content" p={4} flex="1">
            <Heading id="getting-started" mb={4}>
              Getting Started
            </Heading>
            <Text fontSize="lg">
              The AI Movie Recommender is a web application that uses AI to help
              you discover your next favorite movie. The application is built
              with <Code>Next.js</Code>, <Code>React</Code>, and
              <Code>Tailwind CSS</Code>. It uses the <Code>TMDB API</Code> to
              fetch movie data and the <Code>OpenAI API</Code> to generate movie
              recommendations based on your preferences.
            </Text>
            <Text fontSize="lg" mb={4}>
              To get started with the application, simply type in the search bar
              and press enter. The application will then display a list of
              movies that match your search query. You can then click on a movie
              to view its details, including its title, release year, genres,
              and a short summary.
            </Text>
            <Heading id="api-docs" mb={4}>
              API Documentation
            </Heading>
            <Text fontSize="lg">
              The API endpoint is located at <Code>/api/search</Code>. It
              expects a query string parameter <Code>q</Code> with the user's
              search query. The response will be a JSON object with the
              following structure:
            </Text>
            <Code px={4} py={2} mb={4} variant={"subtle"}>
              {`{
  "recommendations": [
    {
      "title": "Movie Title",
      "reason": "Specific connection to user's stated preferences in 1 sentence"
    },
    ...
  ]
}`}
            </Code>
            <Heading id="example-api-requests" size="md" mb={2}>
              API Requests
            </Heading>
            <Text fontSize="lg" mb={4}>
              Below are examples of the different types of API requests you can
              make to the application.
            </Text>
            <Heading as={"h3"} size="sm" mb={2} mt={4}>
              Get TMBD/IMBD
            </Heading>
            <Text fontSize="lg" mb={4}>
              To get movie details, send a GET request to{" "}
              <Code>/api/movie/{"movieId"}</Code>. The response will be a JSON
              object with the following structure:
            </Text>
            <Code px={4} py={2} mb={4} variant={"subtle"}>
              {`{
    "title": "Movie Title",
    "genres": ["Genre 1", "Genre 2", ...],
    "release_date": "YYYY-MM-DD",
    "overview": "Movie Overview"
}`}
            </Code>
            <Heading as={"h3"} size="sm" mb={2} mt={4}>
              Search
            </Heading>
            <Text fontSize="lg" mb={4}>
              To search for movies, send a GET request to{" "}
              <Code>/api/search?q=</Code> with a search query. The response will
              be a JSON object with the following structure:
            </Text>
            <Code px={4} py={2} mb={4} variant={"subtle"}>
              {`{
    "movies": [
        {
            "title": "Movie Title",
            "release_date": "YYYY-MM-DD",
            "overview": "Movie Overview"
        },
        ...
    ]
}`}
            </Code>
            <Heading as={"h3"} size="sm" mb={2} mt={4}>
              Recommendations
            </Heading>
            <Text fontSize="lg" mb={4}>
              To get movie recommendations, send a GET request to{" "}
              <Code>/api/recommendations</Code>. The response will be a JSON
              object with the following structure:
            </Text>
            <Code px={4} py={2} mb={4} variant={"subtle"}>
              {`{
    "recommendations": [
        {
            "title": "Movie Title",
            "reason": "Specific connection to user's stated preferences in 1 sentence"
        },
        ...
    ]
}`}
            </Code>
            <Heading as={"h3"} size="sm" mb={2} mt={4}>
              Generate Prompt
            </Heading>
            <Text fontSize="lg" mb={4}>
              To generate a prompt for the AI, send a GET request to{" "}
              <Code>/api/generate-prompt</Code>. The response will be a JSON
              object with the following structure:
            </Text>
            <Code px={4} py={2} mb={4} variant={"subtle"}>
              {`{
    "prompt": "Prompt text"
}`}
            </Code>
          </Box>
        </Flex>
      </div>
    </Provider>
  );
}
