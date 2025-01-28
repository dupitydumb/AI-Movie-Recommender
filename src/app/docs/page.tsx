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
import { Headers } from "@/components/ui/header";
import "./docs.css";
export default function Docs() {
  return (
    <Provider>
      <Headers />
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
              Search Endpoint
            </Heading>
            <Text fontSize="lg">
              The API endpoint is located at <Code>/api/search?q=promt</Code>.
              It expects a query string parameter q with the user's search
              query. The response will be a JSON object with the following
              structure:
            </Text>
            <pre className="json-code" style={{ margin: "1rem 0" }}>
              <code>
                {JSON.stringify(
                  {
                    movies: [
                      {
                        adult: false,
                        backdrop_path: "/wj2nLa0vfS0SLu2vJ6ABTRhMrok.jpg",
                        genre_ids: [18],
                        id: 334541,
                        original_language: "en",
                        original_title: "Manchester by the Sea",
                        overview:
                          "After his older brother passes away, Lee Chandler is forced to return home to care for his 16-year-old nephew. There he is compelled to deal with a tragic past that separated him from his family and the community where he was born and raised.",
                        popularity: 37.713,
                        poster_path: "/o9VXYOuaJxCEKOxbA86xqtwmqYn.jpg",
                        release_date: "2016-11-18",
                        title: "Manchester by the Sea",
                        video: false,
                        vote_average: 7.5,
                        vote_count: 5868,
                      },
                    ],
                  },
                  null,
                  2
                )}
              </code>
            </pre>
            <Heading as={"h3"} size="sm" mb={2} mt={4}>
              Get TMBD/IMBD
            </Heading>
            <Text fontSize="lg" mb={4}>
              To get movie details, send a GET request to{" "}
              <Code>/api/getID/{"?title=La la land"}</Code>. The response will
              be a JSON object with the following structure:
            </Text>
            <pre className="json-code" style={{ margin: "1rem 0" }}>
              <code>
                {JSON.stringify(
                  {
                    name: "La la land (2016)",
                    imdb: "tt3783958",
                    tmdb: "299534",
                  },
                  null,
                  2
                )}
              </code>
            </pre>
          </Box>
        </Flex>
      </div>
    </Provider>
  );
}
