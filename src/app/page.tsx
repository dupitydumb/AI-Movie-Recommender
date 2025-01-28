"use client";
import dotenv from "dotenv";
import { Provider } from "@/components/ui/provider";
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
import {
  ProgressCircleRing,
  ProgressCircleRoot,
} from "@/components/ui/progress-circle";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@/components/ui/skeleton";
import "./page.css";
import { MovieCard } from "@/components/ui/moviecard";
import { Headers } from "@/components/ui/header";
import * as React from "react";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  let [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  dotenv.config();
  async function run(prompt: string) {
    if (loading) return;
    setMovies([]);
    setLoading(true);
    const promise = fetch("/api/search?q=" + prompt, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env.API_KEY}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          alert(data.error + "Token: " + process.env.API_KEY);
        } else {
          if (data.movies.length === 0) {
            alert("No movies found");
          } else {
            setMovies(data.movies);
          }
        }
      });
    await promise;
    setLoading(false);
  }

  return (
    <Provider>
      <Headers />
      <div className="background"></div>
      <div className="wrapper">
        <Box p={8}>
          <VStack gap={4}>
            <Box textAlign="center">
              <Heading className="hero">Supercharged Movie Nights</Heading>
              <Text className="sub-hero">
                Discover your next favorite film with AI-powered
                recommendations, all in one place. Finding hidden gems and
                exploring new genres has never been this exciting.
              </Text>
              <Button className="button">⚡Try Now!</Button>
            </Box>
            <Separator />
            <HStack className="search-bar" alignItems="center">
              <Box flex="1" position="relative">
                <Input
                  placeholder="Type your movie preference..."
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  paddingRight="2.5rem"
                />
                <Button
                  position="absolute"
                  right="0rem"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={() => run(prompt)}
                  className="search-button"
                >
                  {loading ? (
                    <ProgressCircleRoot value={null} size="sm">
                      <ProgressCircleRing cap="round" />
                    </ProgressCircleRoot>
                  ) : (
                    <svg
                      fill="#000000"
                      width="24px"
                      height="24px"
                      viewBox="0 0 0.96 0.96"
                      id="send"
                      data-name="Flat Color"
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon flat-color"
                    >
                      <path
                        id="primary"
                        d="M0.866 0.48a0.08 0.08 0 0 1 -0.046 0.072L0.235 0.83A0.084 0.084 0 0 1 0.2 0.84a0.08 0.08 0 0 1 -0.073 -0.113L0.218 0.52l0.018 -0.04 -0.018 -0.04 -0.091 -0.205a0.08 0.08 0 0 1 0.108 -0.105l0.586 0.278A0.08 0.08 0 0 1 0.866 0.48"
                        style={{ fill: "rgb(209, 209, 209)" }}
                      />
                      <path
                        id="secondary"
                        d="M0.48 0.48a0.04 0.04 0 0 1 -0.04 0.04H0.218l0.018 -0.04 -0.018 -0.04H0.44a0.04 0.04 0 0 1 0.04 0.04"
                        style={{ fill: "rgb(44, 169, 188)" }}
                      />
                    </svg>
                  )}
                </Button>
              </Box>
            </HStack>
            <HStack className="promt-recs">
              <Button onClick={() => run("girl boss movies")}>
                girl boss movies
              </Button>
              <Button onClick={() => run("sad movies 10s")}>
                sad movies 10s
              </Button>
              <Button onClick={() => run("romantic movies")}>
                romantic movies
              </Button>
            </HStack>

            <div className="movie-list">
              {loading ? (
                <Box className="skeleton" marginBottom={4}>
                  <Skeleton height="200px" marginBottom={4} />
                  <Skeleton height="200px" marginBottom={4} />
                  <Skeleton height="200px" marginBottom={4} />
                </Box>
              ) : movies.length === 0 ? (
                <Text fontSize="lg" color="gray.500"></Text>
              ) : (
                movies.map((movie) =>
                  movie ? (
                    <MovieCard
                      key={movie.id}
                      title={movie.title}
                      releaseYear={movie.release_date}
                      rating={movie.vote_average}
                      posterPath={movie.poster_path}
                      aireview={movie.overview}
                    />
                  ) : (
                    <Text fontSize="lg" color="gray.500">
                      <Separator />
                    </Text>
                  )
                )
              )}
            </div>
          </VStack>
        </Box>
      </div>
    </Provider>
  );
}
