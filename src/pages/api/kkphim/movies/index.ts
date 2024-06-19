import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

const apiUrl = "https://phimapi.com/danh-sach/phim-moi-cap-nhat";
const pageSize = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { page: _page = 1, limit: _limit = 24 } = req.query;

      let limit = Number(_limit);
      const page = Number(_page);

      if (limit < 10) {
        limit = 10;
      } else if (limit > 50) {
        limit = 50;
      }

      const movies = [];

      let queryPage = Math.ceil(page * limit / pageSize);
      let totalItems = 0;

      do {
        const queryParams = new URLSearchParams();
        queryParams.set("page", `${queryPage}`);

        const queryString = queryParams.toString();

        queryPage -= 1;

        const response = await fetch(`${apiUrl}?${queryString}`).then((res) =>
          res.json()
        );

        movies.unshift(...response.items);
        if (!totalItems) {
          totalItems = response.pagination.totalItems;
        }
      } while (movies.length < limit);

      const startIndex = limit * (page - 1) - (queryPage * pageSize);
      const endIndex = startIndex + limit;

      const items = movies.slice(startIndex, endIndex).map((item: any) => ({
        id: item._id,
        name: item.name,
        slug: item.slug,
        originName: item.origin_name,
        thumbUrl: item.thumb_url,
        posterUrl: item.poster_url,
        source: "kkphim",
      }));

      const pagination = {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
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
}
