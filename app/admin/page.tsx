"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trash2, LogOut, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
]

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))

export default function AdminPage() {
  const [selectedSign, setSelectedSign] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>(new Date().getDate().toString().padStart(2, "0"))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [songFile, setSongFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [currentContent, setCurrentContent] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    if (selectedSign && selectedDay) {
      fetchCurrentContent()
    }
  }, [selectedSign, selectedDay, router])

  const fetchCurrentContent = async () => {
    try {
      const response = await fetch(`/api/content/${selectedDay}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentContent(data[selectedSign] || null)
        if (data[selectedSign]?.image) {
          setImagePreview(data[selectedSign].image)
        } else {
          setImagePreview("")
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setSongFile(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an MP3 audio file.",
        variant: "destructive",
      })
    }
  }

  const uploadContent = async () => {
    if (!selectedSign || !selectedDay) {
      toast({
        title: "Missing information",
        description: "Please select both zodiac sign and day.",
        variant: "destructive",
      })
      return
    }

    if (!imageFile && !songFile) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("zodiacSign", selectedSign)
      formData.append("day", selectedDay)

      if (imageFile) {
        formData.append("image", imageFile)
      }

      if (songFile) {
        formData.append("song", songFile)
      }

      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Upload successful",
          description: `Content uploaded for ${selectedSign} on day ${selectedDay}`,
        })
        setImageFile(null)
        setSongFile(null)
        fetchCurrentContent()

        // Reset file inputs
        const imageInput = document.getElementById("image-upload") as HTMLInputElement
        const songInput = document.getElementById("song-upload") as HTMLInputElement
        if (imageInput) imageInput.value = ""
        if (songInput) songInput.value = ""
      } else {
        const error = await response.json()
        toast({
          title: "Upload failed",
          description: error.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteContent = async () => {
    if (!selectedSign || !selectedDay) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zodiacSign: selectedSign,
          day: selectedDay,
        }),
      })

      if (response.ok) {
        toast({
          title: "Content deleted",
          description: `Content removed for ${selectedSign} on day ${selectedDay}`,
        })
        setCurrentContent(null)
        setImagePreview("")
      } else {
        toast({
          title: "Delete failed",
          description: "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Zodiac
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Upload Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zodiac-select" className="text-white">
                  Zodiac Sign
                </Label>
                <Select value={selectedSign} onValueChange={setSelectedSign}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select zodiac sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map((sign) => (
                      <SelectItem key={sign} value={sign}>
                        {sign}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="day-select" className="text-white">
                  Day of Month (1-31)
                </Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        Day {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-upload" className="text-white">
                  Daily Image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="song-upload" className="text-white">
                  Daily Song (MP3)
                </Label>
                <Input
                  id="song-upload"
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={handleSongChange}
                  className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={uploadContent} disabled={uploading} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Content"}
                </Button>
                {currentContent && (
                  <Button onClick={deleteContent} variant="destructive" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSign && selectedDay ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">{selectedSign}</h3>
                    <p className="text-purple-200 text-sm">Day: {selectedDay}</p>
                  </div>

                  {(imagePreview || currentContent?.image) && (
                    <div>
                      <Label className="text-white text-sm">Current Image:</Label>
                      <img
                        src={imagePreview || currentContent?.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mt-2 shadow-md"
                      />
                    </div>
                  )}

                  {currentContent?.song && (
                    <div>
                      <Label className="text-white text-sm">Current Song:</Label>
                      <audio controls className="w-full mt-2" src={currentContent.song}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {!currentContent && !imagePreview && (
                    <p className="text-purple-300 text-center italic">No content uploaded for this day</p>
                  )}
                </div>
              ) : (
                <p className="text-purple-300 text-center italic">Select zodiac sign and day to preview</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
