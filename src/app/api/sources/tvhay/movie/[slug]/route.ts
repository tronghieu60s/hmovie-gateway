import { apiCaller } from "@/core/api";
import { ApiResponse } from "@/core/dto/api-result.dto";
import { MovieResponse } from "@/core/dto/movies/movies.dto";
import * as cheerio from "cheerio";

const apiUrl = "https://tvhay.in";

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } }
) {
  try {
    const apiReq = `${apiUrl}/${slug}`;
    const movie = await apiCaller(apiReq, "GET", {
      headers: {
        "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
      },
    }).then((res) => res.text());

    const $ = cheerio.load(movie);
    console.log($("title").text());

    if ($("title").text().includes("Page Not Found")) {
      throw new Error("not found");
    }

    const name = $(".info .title").text().trim() || "";
    const _slug =
      $("link[rel='canonical']")
        .attr("href")
        ?.slice(1, -1)
        ?.split("/")
        ?.pop() || "";
    const thumbUrl = $(".info .poster img")?.attr("src") || "";
    const posterUrl = $(".info .poster img")?.attr("src") || "";

    const type =
      $(".info .episodelistinfo > li").length > 1 ? "series" : "single";
    const content = $(".detail .tabs-content .tab").text().trim();
    const originName = $(".info .name2 > h3").text().trim();

    let status = "";
    let duration = "";
    const publishYear =
      $(".info .name2 > .year")
        .text()
        .trim()
        ?.replace(/^\((.*)\)$/, "$1") || "";

    const casts = [];
    const directors = [];
    const countries = [];
    const tags = Array.from($(".detail .tabs-content .tags .tag-item"))
      .map((item) => $(item).text().trim())
      .filter((item) => item);
    const categories = [];

    const entries = Array.from($(".info .dinfo dt"));
    for (const item of entries) {
      const label = $(item).text();
      const content = $(item).next();
      const contentText = content.text().trim();
      const contentItems = contentText
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);

      if (label.toLowerCase().includes("status")) {
        status = contentText;
      }
      if (label.toLowerCase().includes("thời lượng")) {
        duration = contentText;
      }

      if (label.toLowerCase().includes("diễn viên")) {
        casts.push(...contentItems);
      }
      if (label.toLowerCase().includes("đạo diễn")) {
        directors.push(...contentItems);
      }
      if (label.toLowerCase().includes("quốc gia")) {
        countries.push(...contentItems);
      }
      if (label.toLowerCase().includes("thể loại")) {
        categories.push(...contentItems);
      }
    }

    let language = status;
    let totalEpisodes = "";
    let currentEpisode = "";

    if (status.includes("/")) {
      const episodes = status.substring(0, status.indexOf(" "));
      language = status.substring(status.indexOf(" ") + 1);

      if (episodes.includes("/")) {
        totalEpisodes = episodes.split("/")[1];
        currentEpisode = episodes.split("/")[0];
      }
    }

    const slugEps = $(".info .btn-watch").attr("href")?.split("/")?.pop() || "";
    const apiReqEps = `${apiUrl}/${slugEps}`;
    const responseEps = await apiCaller(apiReqEps, "GET", {
      headers: {
        "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
      },
    }).then((res) => res.text());

    const $$ = cheerio.load(responseEps);

    const episodes = Array.from($$(".episodelist a")).map((item) => ({
      name: $(item).text().trim(),
      slug: $(item).attr("href")?.split("/")?.pop() || "",
    }));

    const data = new MovieResponse({
      name,
      slug: _slug,
      type,
      status,
      originName,
      content,
      thumbUrl,
      posterUrl,
      totalEpisodes,
      currentEpisode,
      duration,
      language,
      publishYear: Number(publishYear),
      casts,
      directors,
      countries,
      tags,
      categories,
      episodes,
      source: "tvhay",
    });

    return Response.json(new ApiResponse({ data }), {
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
