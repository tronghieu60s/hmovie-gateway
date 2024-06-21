import { ApiResponse } from "@/core/dto/api-result.dto";
import { getPaginationNewPerPage } from "@/core/pagination";
import * as cheerio from "cheerio";

const apiUrl = "https://animehay.bio/phim-moi-cap-nhap/trang";
const pageSize = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const _page = searchParams.get("page") || 1;
  const _limit = searchParams.get("limit") || 24;

  try {
    let limit = Number(_limit);
    const page = Number(_page);

    if (limit < 10) {
      limit = 10;
    } else if (limit > 50) {
      limit = 50;
    }

    const movies = [];

    const { startPage, endPage, startRecord, endRecord } =
      getPaginationNewPerPage(page, pageSize, limit);

    let queryPage = startPage;
    let totalPages = 0;

    do {
      const apiReq = `${apiUrl}-${queryPage}.html`;
      console.info(apiReq);

      const response = await fetch(apiReq).then((res) => res.text());

      queryPage += 1;

      if (response) {
        const $ = cheerio.load(response);
        const items = $(".movies-list .movie-item");

        const itemsData = Array.from(items).map((item) => {
          const href = $(item).children("a").attr("href");
          const episode = $(item).find(".episode-latest").text();

          const id = href?.split("-")?.pop()?.replace(".html", "") || "";
          const name = $(item).children("a").attr("title") || "";
          const slug = href?.split("/")?.pop()?.replace(".html", "") || "";
          const link = $(item).children("a").attr("href") || "";
          const thumbUrl = $(item).find("img").attr("src") || "";
          const posterUrl = $(item).find("img").attr("src") || "";
          const totalEpisodes = episode.split("/")?.[1]?.trim() || "";
          const currentEpisode = episode.split("/")?.[0]?.trim() || "";
          const rating =
            $(item).children("a").children(".score").text().trim() || "";
          return {
            id,
            name,
            slug,
            link,
            thumbUrl,
            posterUrl,
            totalEpisodes,
            currentEpisode,
            rating,
          };
        });

        if (!totalPages) {
          const pagination = $(".pagination").find("a").last().attr("href");
          totalPages = Number(pagination?.split("-")?.pop()?.replace(".html", "") || 0);
        }

        movies.push(...itemsData);
      }
    } while (queryPage <= endPage);

    const startIndex = startRecord - pageSize * (startPage - 1) - 1;
    const endIndex = endRecord - pageSize * (startPage - 1);

    const items = movies.slice(startIndex, endIndex);

    const pagination = {
      page: page,
      limit: limit,
      totalPages: totalPages,
      totalItems: totalPages * limit,
    };

    return Response.json(new ApiResponse({ data: { items, pagination } }), {
      headers: {
        "Cache-Control": "max-age=10",
        "CDN-Cache-Control": "max-age=60",
        "Vercel-CDN-Cache-Control": "max-age=3600",
      },
    });
  } catch (error: any) {
    return Response.json(
      new ApiResponse({
        data: null,
        message: `${error.message || error}`,
        success: false,
      }),
      { status: 500 }
    );
  }
}
