import { ApiResponse } from "@/core/dto/api-result.dto";
import { notion } from "@/main/notion";
import { checkDatabaseExists } from "@/main/notion/database";
import type { NextApiRequest, NextApiResponse } from "next";

const apiUrl = "https://ophim1.com/danh-sach/phim-moi-cap-nhat";
const pageSize = 24;

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

      let queryPage = Math.ceil((page * limit) / pageSize);
      let pathImage = "";
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
        if (!pathImage) {
          pathImage = response.pathImage;
        }
        if (!totalItems) {
          totalItems = response.pagination.totalItems;
        }
      } while (movies.length < limit);

      const startIndex = limit * (page - 1) - queryPage * pageSize;
      const endIndex = startIndex + limit;

      const moviesItems = movies.slice(startIndex, endIndex);

      const items = moviesItems.map((item: any) => ({
        id: item._id,
        name: item.name,
        slug: item.slug,
        originName: item.origin_name,
        thumbUrl: `${pathImage}${item.thumb_url}`,
        posterUrl: `${pathImage}${item.poster_url}`,
        source: "ophim",
      }));

      const pagination = {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      };

      res.status(200).json(new ApiResponse({ data: { items, pagination } }));

      let databaseId = await checkDatabaseExists("OPhim Movies");

      if (!databaseId) {
        const databaseCreated = await notion.databases.create({
          icon: { type: "emoji", emoji: "📑" },
          parent: {
            type: "page_id",
            page_id: "9da663ff82bc4a5f91525a34a26e954f",
          },
          title: [{ type: "text", text: { content: "OPhim Movies" } }],
          properties: {
            id: { rich_text: {} },
            name: { title: {} },
            slug: { rich_text: {} },
            originName: { rich_text: {} },
            thumbUrl: { rich_text: {} },
            posterUrl: { rich_text: {} },
          },
        });
        databaseId = databaseCreated.id;
      }

      await Promise.all(
        items.map(async (item) => {
          const database = await notion.databases.query({
            database_id: databaseId,
            filter: { property: "id", rich_text: { equals: item.id } },
          });

          const pageFound = database.results.find(
            (item) => item.object === "page"
          );

          if (pageFound) {
            return notion.pages.update({
              page_id: pageFound.id,
              properties: {
                id: { rich_text: [{ text: { content: item.id } }] },
                name: { title: [{ text: { content: item.name } }] },
                slug: { rich_text: [{ text: { content: item.slug } }] },
                originName: { rich_text: [{ text: { content: item.originName } }] },
                thumbUrl: { rich_text: [{ text: { content: item.thumbUrl } }] },
                posterUrl: { rich_text: [{ text: { content: item.posterUrl } }] },
              },
            });
          }

          return notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
              id: { rich_text: [{ text: { content: item.id } }] },
              name: { title: [{ text: { content: item.name } }] },
              slug: { rich_text: [{ text: { content: item.slug } }] },
              originName: { rich_text: [{ text: { content: item.originName } }] },
              thumbUrl: { rich_text: [{ text: { content: item.thumbUrl } }] },
              posterUrl: { rich_text: [{ text: { content: item.posterUrl } }] },
            },
          });
        })
      );
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
