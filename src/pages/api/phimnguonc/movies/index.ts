import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = 1 } = req.query;

  const queryParams = new URLSearchParams();
  queryParams.append("page", `${page}`);

  const queryString = queryParams.toString();

  try {
    const movies = await fetch(
      `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?${queryString}`
    ).then((res) => res.json());

    const items = movies.items.map((item: any) => ({
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: item.thumb_url,
      posterUrl: item.poster_url,
      content: item.description,
      totalEpisodes: item.total_episodes,
      currentEpisode: item.current_episode,
      quality: item.quality,
      duration: item.item,
      language: item.language,
      casts: (item.casts || '').split(",").map((item: string) => item.trim()).filter((item: string) => item),
      directors: (item.director || '')?.split(",").map((item: string) => item.trim()).filter((item: string) => item),
      source: "phimnguonc",
    }));

    const pagination = {
      page: movies.paginate.current_page,
      limit: movies.paginate.items_per_page,
      totalPage: movies.paginate.total_page,
      totalItems: movies.paginate.total_items,
    };

    res.status(200).json(new ApiResponse({ data: { items, pagination } }));
  } catch (error) {
    res.status(500).json(
      new ApiResponse({
        data: null,
        message: `${error}`,
        success: false,
      })
    );
  }
}
