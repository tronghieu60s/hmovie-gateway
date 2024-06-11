import HomePage from "@/main/pages/Home";

const getMovies = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/movie/ophim");
    const {
      data: { items: movies },
    } = await response.json();

    return movies;
  } catch (error) {}

  return [];
};

export default async function IndexPage() {
  const movies = await getMovies();

  return <HomePage movies={movies} />;
}
