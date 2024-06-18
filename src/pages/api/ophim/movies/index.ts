import { ApiResponse } from "@/core/dto/api-result.dto";
import type { NextApiRequest, NextApiResponse } from "next";

const apiUrl = "https://ophim1.com/danh-sach/phim-moi-cap-nhat";
const pageSize = 24;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { page: _page = 1, limit: _limit = 50 } = req.query;

      const movies = [];

      let page = Math.ceil(Number(_page) * Number(_limit) / pageSize);
      let pathImage = "";
      let totalItems = 0;

      do {
        const queryParams = new URLSearchParams();
        queryParams.set("page", `${page}`);

        const queryString = queryParams.toString();

        page -= 1;
        console.log(`${apiUrl}?${queryString}`);

        const response = await fetch(`${apiUrl}?${queryString}`).then((res) =>
          res.json()
        );

        movies.unshift(...response.items);
        if (!pathImage) {
          pathImage = response.pathImage;
        }
        if (!totalItems) {
          totalItems = response.pagination.totalItems;
        }
      } while (movies.length < Number(_limit));

      const test = Number(_limit) * (Number(_page) - 1) - (page * pageSize);
      console.log(test);
      
      const items = movies.slice(test, test + Number(_limit)).map((item: any) => ({
        id: item._id,
        name: item.name,
        slug: item.slug,
        originName: item.origin_name,
        thumbUrl: `${pathImage}${item.thumb_url}`,
        posterUrl: `${pathImage}${item.poster_url}`,
        source: "ophim",
      }));

      const pagination = {
        page: Number(_page),
        limit: Number(_limit),
        totalPages: Math.ceil(totalItems / Number(_limit)),
        totalItems: totalItems,
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
