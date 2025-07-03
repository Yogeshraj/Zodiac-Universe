"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Play, Pause } from "lucide-react";
import Link from "next/link";

const zodiacSigns = [
  {
    name: "Aries",
    symbol: "♈",
    dates: "Mar 21 - Apr 19",
    color: "bg-red-500",
  },
  {
    name: "Taurus",
    symbol: "♉",
    dates: "Apr 20 - May 20",
    color: "bg-green-500",
  },
  {
    name: "Gemini",
    symbol: "♊",
    dates: "May 21 - Jun 20",
    color: "bg-yellow-500",
  },
  {
    name: "Cancer",
    symbol: "♋",
    dates: "Jun 21 - Jul 22",
    color: "bg-blue-500",
  },
  {
    name: "Leo",
    symbol: "♌",
    dates: "Jul 23 - Aug 22",
    color: "bg-orange-500",
  },
  {
    name: "Virgo",
    symbol: "♍",
    dates: "Aug 23 - Sep 22",
    color: "bg-purple-500",
  },
  {
    name: "Libra",
    symbol: "♎",
    dates: "Sep 23 - Oct 22",
    color: "bg-pink-500",
  },
  {
    name: "Scorpio",
    symbol: "♏",
    dates: "Oct 23 - Nov 21",
    color: "bg-red-700",
  },
  {
    name: "Sagittarius",
    symbol: "♐",
    dates: "Nov 22 - Dec 21",
    color: "bg-indigo-500",
  },
  {
    name: "Capricorn",
    symbol: "♑",
    dates: "Dec 22 - Jan 19",
    color: "bg-gray-600",
  },
  {
    name: "Aquarius",
    symbol: "♒",
    dates: "Jan 20 - Feb 18",
    color: "bg-cyan-500",
  },
  {
    name: "Pisces",
    symbol: "♓",
    dates: "Feb 19 - Mar 20",
    color: "bg-teal-500",
  },
];

interface ZodiacContent {
  [key: string]: {
    image?: string;
    song?: string;
  };
}

export default function HomePage() {
  const [zodiacContent, setZodiacContent] = useState<ZodiacContent>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [playingSign, setPlayingSign] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().getDate().toString().padStart(2, "0");

  useEffect(() => {
    fetchTodayContent();
  }, []);

  const fetchTodayContent = async () => {
    try {
      const response = await fetch(`/api/content/${today}`);
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        setZodiacContent(data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (sign: string, audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (playingSign === sign) {
      setPlayingSign(null);
      setCurrentAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setPlayingSign(sign);

    audio.onended = () => {
      setPlayingSign(null);
      setCurrentAudio(null);
    };
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingSign(null);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-xl'>
          Loading today's cosmic content...
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <div className='text-center flex-1'>
            <h1 className='text-4xl font-bold text-white mb-2'>
              Zodiac Universe
            </h1>
            <p className='text-purple-200'>
              Discover your daily cosmic connection
            </p>
            <p className='text-sm text-purple-300 mt-2'>
              Today: {new Date().toLocaleDateString()} (Day {today})
            </p>
          </div>
          <Link href='/admin/login'>
            <Button
              variant='outline'
              className='bg-white/10 border-white/20 text-white hover:bg-white/20'
            >
              <Settings className='w-4 h-4 mr-2' />
              Admin
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {zodiacSigns.map((sign) => {
            const signContent = zodiacContent[sign.name];
            const hasContent = signContent?.image || signContent?.song;
            const isPlaying = playingSign === sign.name;

            return (
              <Card
                key={sign.name}
                className='bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105'
              >
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <div
                      className={`w-16 h-16 rounded-full ${sign.color} flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg`}
                    >
                      {sign.symbol}
                    </div>
                    <h3 className='text-xl font-semibold text-white mb-1'>
                      {sign.name}
                    </h3>
                    <p className='text-purple-200 text-sm mb-4'>{sign.dates}</p>

                    {signContent?.image && (
                      <div className='mb-4'>
                        <img
                          src={signContent.image || "/placeholder.svg"}
                          alt={`${sign.name} daily image`}
                          className='w-full h-32 object-cover rounded-lg shadow-md'
                        />
                      </div>
                    )}

                    {signContent?.song && (
                      <Button
                        onClick={() => playAudio(sign.name, signContent.song!)}
                        variant='outline'
                        size='sm'
                        className='bg-white/10 border-white/20 text-white hover:bg-white/20 mb-2'
                      >
                        {isPlaying ? (
                          <>
                            <Pause className='w-4 h-4 mr-2' />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className='w-4 h-4 mr-2' />
                            Play Today's Song
                          </>
                        )}
                      </Button>
                    )}

                    {!hasContent && (
                      <p className='text-purple-300 text-sm italic'>
                        No content for today
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {playingSign && (
          <div className='fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
              <span>Playing {playingSign}</span>
              <Button
                onClick={stopAudio}
                variant='ghost'
                size='sm'
                className='text-white hover:bg-white/20'
              >
                <Pause className='w-4 h-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
