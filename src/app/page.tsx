import { MovieType } from "@/core/api/types";
import HomePage from "@/main/pages/Home";

type Props = {
  movies: MovieType[];
};

export default async function IndexPage(props: Props) {
  const movies = await getMovies();

  return <HomePage movies={movies} />;
}

export const getMovies = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/movie/ophim");
    const {
      data: { items: movies },
    } = await response.json();

    return movies;
  } catch (error) {}

  return [];
};
