import { getSlug } from "@/core/commonFuncs";
import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  try {
    const movie = await fetch(`https://phim.nguonc.com/api/film/${slug}`).then(
      (res) => res.json()
    );

    const data = {
      id: movie.movie.id,
      slug: movie.movie.slug,
      name: movie.movie.name,
      originName: movie.movie.original_name,
      content: movie.movie.description,
      thumbUrl: movie.movie.thumb_url,
      posterUrl: movie.movie.poster_url,
      totalEpisodes: movie.movie.total_episodes,
      currentEpisode: movie.movie.current_episode,
      quality: movie.movie.quality,
      duration: movie.movie.time,
      language: movie.movie.language,
      casts: (movie.movie.casts || "")
        .split(",")
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      directors: (movie.movie.director || "")
        ?.split(",")
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      taxonomies: Object.values(movie.movie.category).map((item: any) => ({
        group: {
          name: item.group.name,
          slug: getSlug(item.group.name),
        },
        categories: item.list.map((data: any) => ({
          name: data.name,
          slug: getSlug(data.name),
        })),
      })),
      episodes: Object.entries(
        movie.movie.episodes
          .flatMap((ep: any) =>
            ep.items.map((data: any) => ({
              name: data.name,
              slug: data.slug,
              server: ep.server_name,
              linkEmbed: data.embed,
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
