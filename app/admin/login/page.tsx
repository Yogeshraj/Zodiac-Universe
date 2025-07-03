"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("adminToken", data.token)
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        })
        router.push("/admin")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Zodiac
            </Button>
          </Link>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter password"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-purple-200 text-sm text-center mb-2">Demo Credentials:</p>
              <p className="text-white text-xs text-center">Username: admin</p>
              <p className="text-white text-xs text-center">Password: zodiac123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
