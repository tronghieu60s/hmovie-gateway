import { apiCaller } from "@/core/api";
import { ApiResponse } from "@/core/dto/api-result.dto";
import { MoviesResponse } from "@/core/dto/movies/movies.dto";
import { getPaginationNewPerPage } from "@/core/pagination";
import * as cheerio from "cheerio";

const apiUrl = "https://tvhay.in/search";
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
      const apiReq = `${apiUrl}/${encodeURIComponent(keyword)}/page/${queryPage}`;
      const response = await apiCaller(apiReq, "GET", {
        headers: {
          "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
        },
      }).then((res) => res.text());

      queryPage += 1;

      if (response) {
        const $ = cheerio.load(response);
        console.log($("title").text());

        const items = $(".list-film li");

        const itemsData = Array.from(items).map((item) => {
          const name =
            $(item)
              .find(".info .name a")
              ?.clone()
              ?.children()
              ?.remove()
              ?.end()
              ?.text()
              ?.trim() || "";
          const slug =
            $(item)
              .find(".inner a")
              ?.attr("href")
              ?.slice(1, -1)
              ?.split("/")
              ?.pop() || "";
          const originName = $(item).find(".info .name2")?.text()?.trim() || "";
          const thumbUrl =
            $(item).find(".inner img")?.attr("data-original") || "";
          const posterUrl =
            $(item).find(".inner img")?.attr("data-original") || "";

          return new MoviesResponse({
            name,
            slug,
            originName,
            thumbUrl,
            posterUrl,
            source: "tvhay",
          });
        });

        if (!totalPages) {
          const pagination = $(".wp-pagenavi").find("a").last().attr("href");
          totalPages = Number(pagination?.slice(1, -1)?.split("/")?.pop() || 0);
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
