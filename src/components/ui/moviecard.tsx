import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

type Movie = {
  id: string;
  title: string;
  year: string;
  genre: string[];
  rating: number;
  description: string;
  imageUrl: string;
};

interface MovieCardProps {
  id: string;
  key: string;
  title: string;
  releaseYear: string;
  rating: number;
  posterPath: string;
  aireview: string;
  className?: string;
}

export function MovieCard({
  id,
  key,
  title,
  releaseYear,
  rating,
  posterPath,
  aireview,
  className,
}: MovieCardProps) {
  return (
    <Card className={`movie-card overflow-hidden bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-all duration-300 flex flex-col ${className}`}>
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={`https://image.tmdb.org/t/p/w500/${posterPath}` || ""}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-lg text-gray-200 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400">{releaseYear}</div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-300 line-clamp-3 mb-3">{aireview}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link
          href={`/movie/${id}/watch/`}
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            variant="default"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
          >
            Watch
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
