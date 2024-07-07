import { apiCaller } from "@/core/api";
import { ApiResponse } from "@/core/dto/api-result.dto";
import { MoviesEpisodeResponse } from "@/core/dto/movies/movies.dto";
import * as cheerio from "cheerio";

const apiUrl = "https://animehay.bio/xem-phim";

const getEpisodeServerLink = (props: {
  str: string;
  start?: string;
  server: string;
  startSource?: string;
  endSource?: string;
}) => {
  const {
    str,
    start = "startStreaming",
    server,
    startSource = 'src="',
    endSource = '"',
  } = props;

  const streamStartIndex = str.indexOf(start);
  const serverStartIndex = str.indexOf(`${server}`, streamStartIndex);
  const sourceStartIndex = str.indexOf(`${startSource}`, serverStartIndex);
  const sourceEndIndex = str.indexOf(
    `${endSource}`,
    sourceStartIndex + startSource.length
  );

  return str.substring(sourceStartIndex + startSource.length, sourceEndIndex);
};

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } }
) {
  try {
    const apiReq = `${apiUrl}/${slug}.html`;
    const movie = await apiCaller(apiReq, "GET", {
      headers: {
        "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
      },
    }).then((res) => res.text());

    const $ = cheerio.load(movie);
    console.log($("title").text());

    const name = $(".list-item-episode > a[active]").text().trim() || "";
    const _slug =
      $("link[rel='canonical']")
        .attr("href")
        ?.split("/")
        ?.pop()
        ?.replace(".html", "") || "";
    const filename =
      $(".watching-movie .ah-frame-bg > a")
        ?.clone()
        ?.children()
        ?.remove()
        ?.end()
        ?.text()
        ?.trim() || "";

    const episodes = [];

    const tikM3u8 = getEpisodeServerLink({
      str: movie,
      start: "$info_play_video",
      server: "tik",
      startSource: "tik: '",
      endSource: "'",
    });
    const embEmbed = getEpisodeServerLink({ str: movie, server: "EMB" });
    const hyEmbed = getEpisodeServerLink({ str: movie, server: "HY" });
    const vProEmbed = getEpisodeServerLink({ str: movie, server: "VPRO" });
    const powEmbed = getEpisodeServerLink({ str: movie, server: "POW" });
    const phoEmbed = getEpisodeServerLink({ str: movie, server: "PHO" });
    const gunEmbed = getEpisodeServerLink({ str: movie, server: "GUN" });

    if (tikM3u8) {
      episodes.push({ server: "Tik", linkM3u8: tikM3u8 });
    }
    if (embEmbed) {
      episodes.push({ server: "EMB", linkEmbed: embEmbed });
    }
    if (hyEmbed) {
      episodes.push({ server: "HY", linkEmbed: hyEmbed });
    }
    if (vProEmbed) {
      episodes.push({ server: "VPRO", linkEmbed: vProEmbed });
    }
    if (powEmbed) {
      episodes.push({ server: "POW", linkEmbed: powEmbed });
    }
    if (phoEmbed) {
      episodes.push({ server: "PHO", linkEmbed: phoEmbed });
    }
    if (gunEmbed) {
      episodes.push({ server: "GUN", linkEmbed: gunEmbed });
    }

    const data = new MoviesEpisodeResponse({
      name,
      slug: _slug,
      filename,
      episodes,
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
