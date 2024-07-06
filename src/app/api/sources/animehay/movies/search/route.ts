import { apiCaller } from "@/core/api";
import { getSlug } from "@/core/commonFuncs";
import { ApiResponse } from "@/core/dto/api-result.dto";
import { MoviesResponse } from "@/core/dto/movies/movies.dto";
import { getPaginationNewPerPage } from "@/core/pagination";
import * as cheerio from "cheerio";

const apiUrl = "https://animehay.bio/tim-kiem";
const pageSize = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const _page = searchParams.get("page") || 1;
  const _limit = searchParams.get("limit") || 24;
  const keyword = searchParams.get("keyword");

  try {
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

    const movies = [];

    const { startPage, endPage, startRecord, endRecord } =
      getPaginationNewPerPage(page, pageSize, limit);

    let queryPage = startPage;
    let totalPages = 0;

    do {
      const apiReq = `${apiUrl}/${getSlug(keyword)}/trang-${queryPage}.html`;
      const response = await apiCaller(apiReq, "GET", {
        headers: {
          "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
        },
      }).then((res) => res.text());

      queryPage += 1;

      if (response) {
        const $ = cheerio.load(response);
        console.log($("title").text());

        const items = $(".movies-list .movie-item");

        const itemsData = Array.from(items).map((item) => {
          const name = $(item).children("a")?.attr("title")?.trim() || "";
          const slug =
            $(item)
              .children("a")
              ?.attr("href")
              ?.split("/")
              ?.pop()
              ?.replace(".html", "") || "";
          const thumbUrl = $(item).find("img")?.attr("src") || "";
          const posterUrl = $(item).find("img")?.attr("src") || "";
          return new MoviesResponse({
            name,
            slug,
            thumbUrl,
            posterUrl,
            source: "animehay",
          });
        });

        if (!totalPages) {
          const pagination = $(".pagination").find("a").last().attr("href");
          totalPages = Number(
            pagination?.split("-")?.pop()?.replace(".html", "") || 0
          );
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
