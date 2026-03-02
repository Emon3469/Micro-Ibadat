import React, { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Trophy, Clock3, Star, Download, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";

export default function WeeklyCard({ user, dashboard }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Try native share if available (Mobile)
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "ibadah-summary.png", { type: blob.type });
        try {
          await navigator.share({
            title: "My Ibadah Summary",
            text: "Check out my Ramadan consistency!",
            files: [file],
          });
        } catch (shareErr) {
          console.warn("Share API failed or cancelled", shareErr);
          downloadImage(dataUrl);
        }
      } else {
        // Fallback to traditional download (Desktop)
        downloadImage(dataUrl);
      }
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (dataUrl) => {
    const link = document.createElement("a");
    link.download = `micro-ibadah-summary-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!user || !dashboard) return null;

  return (
    <Card className="border-indigo-200 bg-indigo-50/30 overflow-hidden">
      <CardHeader className="bg-indigo-100/50 pb-3 border-b border-indigo-100">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-indigo-900 flex items-center gap-2 font-bold">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Shareable Summary
            </CardTitle>
            <CardDescription className="text-indigo-700/80">Generate a card to share on your story.</CardDescription>
          </div>
          <Button 
            onClick={handleShare} 
            disabled={isGenerating}
            size="sm"
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            {isGenerating ? <Clock3 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
            {navigator.share ? "Share" : "Download"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-6 bg-slate-50 flex justify-center overflow-x-auto">
        {/* The Card to be captured */}
        <div 
          ref={cardRef} 
          className="w-[320px] shrink-0 rounded-[20px] bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 shadow-xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl translate-y-1/3 -translate-x-1/4"></div>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-indigo-200/80 text-[10px] uppercase tracking-widest font-semibold mb-1">Ramadan Summary</p>
              <h3 className="text-xl text-white font-bold">{user.nickname || user.name}'s Ibadah</h3>
            </div>
            <div className="flex flex-col items-end">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] mb-1">Consistency</Badge>
              <span className="text-2xl font-black text-white">{user.streakDays} <span className="text-sm font-semibold text-indigo-300">Days</span></span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <Trophy className="h-4 w-4 text-amber-400 mb-1" />
              <p className="text-xs text-indigo-200 font-medium tracking-wide">Hasanat</p>
              <p className="text-xl font-bold text-white">{user.hasanatPoints || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <Star className="h-4 w-4 text-emerald-400 mb-1" />
              <p className="text-xs text-indigo-200 font-medium tracking-wide">Total Actions</p>
              <p className="text-xl font-bold text-white">{user.totalCheckIns || 0}</p>
            </div>
            <div className="col-span-2 bg-indigo-800/40 rounded-xl p-3 border border-indigo-700/50 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-200 font-medium">Digital Tasbih Count</p>
                <p className="text-lg font-bold text-white">{user.tasbihCount || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <span className="text-emerald-400 font-bold text-sm">✓</span>
              </div>
            </div>
          </div>
          
          {/* Footer Branding */}
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-medium text-indigo-200 uppercase tracking-widest">Micro-Ibadah App</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
