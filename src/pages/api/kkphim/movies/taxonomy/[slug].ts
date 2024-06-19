import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

const apiUrl = "https://phimapi.com/v1/api/danh-sach";
const pageSize = 10;

const taxonomyMapping = {
  "phim-le": "phim-le",
  "phim-bo": "phim-bo",
  "hoat-hinh": "hoat-hinh",
  "tv-shows": "tv-shows",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    page: _page = 1,
    limit: _limit = 24,
    slug,
    taxonomy: _taxonomy,
  } = req.query;

  const queryParams = new URLSearchParams();
  queryParams.append("page", `${_page}`);

  const queryString = queryParams.toString();

  try {
    if (!Object.keys(taxonomyMapping).includes(_taxonomy)) {
      throw new Error("invalid taxonomy");
    }

    const movies = await fetch(`${apiUrl}/${slug}?${queryString}`).then((res) =>
      res.json()
    );

    const pathImage = movies.data.APP_DOMAIN_CDN_IMAGE;

    const items = movies.data.items.map((item: any) => ({
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: `${pathImage}/${item.thumb_url}`,
      posterUrl: `${pathImage}/${item.poster_url}`,
      source: "kkphim",
    }));

    const pagination = {
      page: movies.paginate.current_page,
      limit: movies.paginate.items_per_page,
      totalPages: movies.paginate.total_page,
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
