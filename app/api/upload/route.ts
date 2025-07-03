import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// Simple token validation
function validateToken(token: string): boolean {
  if (!token) return false
  try {
    const decoded = Buffer.from(token.replace("Bearer ", ""), "base64").toString()
    return decoded.startsWith("admin:")
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin token
    const authHeader = request.headers.get("authorization")
    if (!validateToken(authHeader || "")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const zodiacSign = formData.get("zodiacSign") as string
    const day = formData.get("day") as string
    const imageFile = formData.get("image") as File | null
    const songFile = formData.get("song") as File | null

    if (!zodiacSign || !day) {
      return NextResponse.json({ message: "Missing zodiac sign or day" }, { status: 400 })
    }

    // Create directory structure: public/zodiac-content/[day]/[zodiac-sign]/
    const baseDir = path.join(process.cwd(), "public", "zodiac-content", day, zodiacSign)

    if (!existsSync(baseDir)) {
      await mkdir(baseDir, { recursive: true })
    }

    const results = []

    // Handle image upload
    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      const imageExtension = imageFile.name.split(".").pop() || "jpg"
      const imagePath = path.join(baseDir, `image.${imageExtension}`)

      await writeFile(imagePath, imageBuffer)
      results.push(`Image uploaded for ${zodiacSign} on day ${day}`)
    }

    // Handle song upload
    if (songFile) {
      const songBuffer = Buffer.from(await songFile.arrayBuffer())
      const songExtension = songFile.name.split(".").pop() || "mp3"
      const songPath = path.join(baseDir, `song.${songExtension}`)

      await writeFile(songPath, songBuffer)
      results.push(`Song uploaded for ${zodiacSign} on day ${day}`)
    }

    return NextResponse.json({
      success: true,
      message: results.join(", "),
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validate admin token
    const authHeader = request.headers.get("authorization")
    if (!validateToken(authHeader || "")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { zodiacSign, day } = await request.json()

    if (!zodiacSign || !day) {
      return NextResponse.json({ message: "Missing zodiac sign or day" }, { status: 400 })
    }

    // Delete directory: public/zodiac-content/[day]/[zodiac-sign]/
    const baseDir = path.join(process.cwd(), "public", "zodiac-content", day, zodiacSign)

    if (existsSync(baseDir)) {
      const { rmdir } = await import("fs/promises")
      await rmdir(baseDir, { recursive: true })
    }

    return NextResponse.json({
      success: true,
      message: `Content deleted for ${zodiacSign} on day ${day}`,
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ message: "Delete failed" }, { status: 500 })
  }
}
