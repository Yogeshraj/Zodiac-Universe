import { type NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export async function GET(
  request: NextRequest,
  { params }: { params: { day: string } }
) {
  try {
    // console.log("params", params);
    const { day } = await params;
    const content: any = {};

    // Check each zodiac sign for content on this day
    for (const sign of zodiacSigns) {
      const signDir = path.join(
        process.cwd(),
        "public",
        "zodiac-content",
        day,
        sign
      );

      if (existsSync(signDir)) {
        const files = await readdir(signDir);
        const signContent: any = {};

        // Look for image files
        const imageFile = files.find((file) => file.startsWith("image."));
        if (imageFile) {
          signContent.image = `/zodiac-content/${day}/${sign}/${imageFile}`;
        }

        // Look for song files
        const songFile = files.find((file) => file.startsWith("song."));
        if (songFile) {
          signContent.song = `/zodiac-content/${day}/${sign}/${songFile}`;
        }

        if (Object.keys(signContent).length > 0) {
          content[sign] = signContent;
        }
      }
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
