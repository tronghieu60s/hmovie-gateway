import { MovieType } from "@/core/api/types";
import Image from "next/image";

type Props = {
  movies: MovieType[];
};

export default function HomePage(props: Props) {
  const { movies } = props;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        {movies.map((movie, index) => (
          <div key={index} className="flex flex-row shadow gap-2">
            <Image
              src={movie.thumbUrl}
              alt={movie.name}
              width={70}
              height={70}
            />
            <div className="p-2">
              <p className="text-md font-bold text-gray-900">{movie.name}</p>
              <p className="text-sm text-gray-700">({movie.originName})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
