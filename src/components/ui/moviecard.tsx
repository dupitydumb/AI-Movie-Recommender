import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  HStack,
  Separator,
} from "@chakra-ui/react";

export interface MovieCardProps {
  title: string;
  releaseYear: string;
  rating: string;
  posterPath: string;
  aireview: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  title,
  releaseYear,
  rating,
  posterPath,
  aireview,
}) => {
  return (
    <Box className="movie-card" overflow="hidden">
      <HStack>
        <Box minWidth="100px">
          <img
            src={
              "https://media.themoviedb.org/t/p/w220_and_h330_face/" +
              posterPath
            }
            alt={title}
            style={{ width: "100%" }}
          />
        </Box>
        <VStack align="start" gap={1} p={4}>
          <HStack>
            <Heading size="md" fontWeight="bold">
              {title}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {releaseYear.slice(0, 4)}
            </Text>
          </HStack>
          <HStack>
            <svg
              width="16px"
              height="16px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
            >
              <g transform="translate(0 -1028.4)">
                <path
                  d="m12 1028.4 4 9 8 1-6 5 2 9-8-5-8 5 2-9-6-5 8-1z"
                  fill="#236a4c"
                />
                <path
                  d="m12 1028.4-4 9-6.9688 0.8 4.9688 4.2-0.1875 0.8 0.1875 0.2-1.75 7.8 7.75-4.8 7.75 4.8-1.75-7.8 0.188-0.2-0.188-0.8 4.969-4.2-6.969-0.8-4-9z"
                  fill="#48d597"
                />
              </g>
            </svg>
            <Text fontSize="sm" color="gray.500">
              {rating}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.500" className="overview">
            {aireview}
          </Text>
        </VStack>
      </HStack>
      <Separator variant={"dashed"} colorPalette={"gray"} />
    </Box>
  );
};
