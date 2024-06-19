import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

const apiUrl = "https://phimapi.com/v1/api/danh-sach";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const {
        slug,
        page: _page = 1,
        limit: _limit = 24,
      } = req.query;

      let limit = Number(_limit);
      const page = Number(_page);

      if (limit < 10) {
        limit = 10;
      } else if (limit > 50) {
        limit = 50;
      }

      const queryParams = new URLSearchParams();
      queryParams.append("page", `${page}`);
      queryParams.append("limit", `${limit}`);

      const queryString = queryParams.toString();

      const movies = await fetch(`${apiUrl}/${slug}?${queryString}`).then(
        (res) => res.json()
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
        page: movies.data.params.pagination.currentPage,
        limit: movies.data.params.pagination.totalItemsPerPage,
        totalPages: movies.data.params.pagination.totalPages,
        totalItems: movies.data.params.pagination.totalItems,
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
