import { type NextRequest, NextResponse } from "next/server"

// Static credentials - no database needed
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "zodiac123",
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Generate a simple token (in production, use proper JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")

      return NextResponse.json({
        success: true,
        token,
        message: "Login successful",
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
