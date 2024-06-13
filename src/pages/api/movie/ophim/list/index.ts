import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600');

  const { page = 1 } = req.query;

  const queryParams = new URLSearchParams();
  queryParams.append("page", `${page}`);

  const queryString = queryParams.toString();

  try {
    const movies = await fetch(
      `https://ophim1.com/danh-sach/phim-moi-cap-nhat?${queryString}`
    ).then((res) => res.json());

    const items = movies.items.map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: `${movies.pathImage}${item.thumb_url}`,
      posterUrl: `${movies.pathImage}${item.poster_url}`,
    }));

    const pagination = {
      page: movies.pagination.currentPage,
      limit: movies.pagination.totalItemsPerPage,
      totalPage: movies.pagination.totalPages,
      totalItems: movies.pagination.totalItems,
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
