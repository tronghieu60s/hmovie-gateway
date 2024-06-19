import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

const apiUrl = "https://phimapi.com/v1/api/tim-kiem";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { page: _page = 1, limit: _limit = 24, keyword = "" } = req.query;

      if (!keyword) {
        throw new Error("keyword is required");
      }

      let limit = Number(_limit);
      const page = Number(_page);

      if (limit < 10) {
        limit = 10;
      } else if (limit > 50) {
        limit = 50;
      }

      const queryParams = new URLSearchParams();
      queryParams.append("limit", `${page * limit}`);
      queryParams.append("keyword", `${keyword}`);

      const queryString = queryParams.toString();

      const movies = await fetch(`${apiUrl}?${queryString}`).then((res) =>
        res.json()
      );

      const pathImage = movies.data.APP_DOMAIN_CDN_IMAGE;

      const moviesItems = movies.data.items.slice(
        page * limit - limit,
        page * limit
      );

      const items = moviesItems.map((item: any) => ({
        name: item.name,
        slug: item.slug,
        originName: item.origin_name,
        thumbUrl: `${pathImage}/${item.thumb_url}`,
        posterUrl: `${pathImage}/${item.poster_url}`,
        source: "kkphim",
      }));

      const totalItems = movies.data.params.pagination.totalItems;

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
