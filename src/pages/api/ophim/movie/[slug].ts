import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  try {
    const movie = await fetch(`https://ophim1.com/phim/${slug}`).then((res) =>
      res.json()
    );

    const data = {
      id: movie.movie._id,
      name: movie.movie.name,
      slug: movie.movie.slug,
      type: movie.movie.type,
      status: movie.movie.status,
      originName: movie.movie.origin_name,
      content: movie.movie.content,
      thumbUrl: movie.movie.thumb_url,
      posterUrl: movie.movie.poster_url,
      trailerUrl: movie.movie.trailer_url,
      totalEpisodes: movie.movie.episode_total,
      currentEpisode: movie.movie.episode_current,
      quality: movie.movie.quality,
      duration: movie.movie.time,
      language: movie.movie.lang,
      showtimes: movie.movie.showtimes,
      publishYear: movie.movie.year,
      casts: movie.movie.actor
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      directors: movie.movie.director
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      categories: movie.movie.category
        .map((item: { name: string }) => item.name.trim())
        .filter((item: string) => item),
      countries: movie.movie.country
        .map((item: { name: string }) => item.name.trim())
        .filter((item: string) => item),
      isTheater: movie.movie.chieurap,
      isCopyright: movie.movie.is_copyright,
      episodes: Object.entries(
        movie.episodes
          .flatMap((ep: any) =>
            ep.server_data.map((data: any) => ({
              name: data.name,
              slug: data.slug,
              filename: data.filename,
              server: ep.server_name,
              linkM3u8: data.link_m3u8,
              linkEmbed: data.link_embed,
            }))
          )
          .reduce((acc: any, cur: any) => {
            if (!acc[cur.name])
              acc[cur.name] = {
                name: cur.name,
                slug: cur.slug,
                filename: cur.filename,
                episodes: [],
              };
            acc[cur.name].episodes.push({
              server: cur.server,
              linkM3u8: cur.linkM3u8,
              linkEmbed: cur.linkEmbed,
            });
            return acc;
          }, {})
      ).map(([, v]) => v),
    };

    res.status(200).json(new ApiResponse({ data }));
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse({ data: null, message: `${error}`, success: false })
      );
  }
}
