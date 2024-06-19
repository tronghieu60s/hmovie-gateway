import { ApiResponse } from "@/core/dto/api-result.dto";
import { notion } from "@/main/notion";
import { checkDatabaseExists } from "@/main/notion/database";
import type { NextApiRequest, NextApiResponse } from "next";

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

      let databaseId = await checkDatabaseExists("OPhim Movies");

      if (!databaseId) {
        throw new Error("Database not found");
      }

      const database = await notion.databases.query({
        database_id: databaseId,
        filter: {
          or: [
            { property: "name", rich_text: { contains: `${keyword}` } },
            { property: "originName", rich_text: { contains: `${keyword}` } },
          ],
        },
      });

      const result = database.results
        .filter((item) => item.object === "page")
        .map((item: any) => item.properties)
        .slice((page - 1) * limit, page * limit);

      const items = result.map((item) => ({
        id: item.id.rich_text[0].plain_text,
        name: item.name.title[0].plain_text,
        slug: item.slug.rich_text[0].plain_text,
        originName: item.originName.rich_text[0].plain_text,
        thumbUrl: item.thumbUrl.rich_text[0].plain_text,
        posterUrl: item.posterUrl.rich_text[0].plain_text,
        source: "ophim",
      }));

      const totalItems = database.results.length;

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
