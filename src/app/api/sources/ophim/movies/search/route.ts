import { apiCaller } from "@/core/api";
import { ApiResponse } from "@/core/dto/api-result.dto";
import { getPaginationNewPerPage } from "@/core/pagination";
import * as cheerio from "cheerio";
import { randomUUID } from "crypto";

const apiUrl = "https://ophim17.cc/tim-kiem";
const pageSize = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const _page = searchParams.get("page") || 1;
  const _limit = searchParams.get("limit") || 24;
  const keyword = searchParams.get("keyword");

  try {
    if (!keyword) {
      throw new Error("Keyword is required");
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
    let totalItems = 0;

    do {
      const params = new URLSearchParams();
      params.set("page", `${queryPage}`);
      params.append("keyword", `${keyword}`);

      const queryString = params.toString();

      const apiReq = `${apiUrl}?${queryString}`;
      const response = await apiCaller(apiReq).then((res) => res.text());

      queryPage += 1;

      if (response) {
        const $ = cheerio.load(response);
        console.log($("title").text());

        const items = $("table tbody tr");
        const itemsData = Array.from(items).map((item) => {
          const href = $(item).find("a").attr("href") || "";

          const name =
            $(item)
              .find("h3")
              ?.clone()
              ?.children()
              ?.remove()
              ?.end()
              ?.text()
              ?.trim() || "";
          const slug = href.replace("/phim/", "");
          const originName =
            $(item)
              .find("h4")
              ?.text()
              ?.trim()
              ?.replace(/^\((.*)\)$/, "$1") || "";
          return {
            name,
            slug,
            originName,
            thumbUrl: `https://img.ophim.live/uploads/movies/${slug}-thumb.jpg`,
            posterUrl: `https://img.ophim.live//uploads/movies/${slug}-poster.jpg`,
            source: "ophim",
          };
        });

        if (!totalItems) {
          const pagination =
            $("table").next()?.find("span:nth-child(3)")?.text() || 0;
          totalItems = Number(pagination);
        }

        movies.push(...itemsData);
      }
    } while (queryPage <= endPage);

    const startIndex = startRecord - pageSize * (startPage - 1) - 1;
    const endIndex = endRecord - pageSize * (startPage - 1);

    const items = movies.slice(startIndex, endIndex);

    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
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
