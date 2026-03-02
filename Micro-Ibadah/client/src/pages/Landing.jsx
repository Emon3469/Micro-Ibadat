import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <span className="text-4xl">🌙</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">
        Micro-Ibadah
      </h1>
      <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg">
        Busy schedule. Small deeds. Big consistency. The companion app for students during Ramadan and beyond.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
        <Link to="/register" className="w-full">
          <Button className="w-full h-12 text-lg font-bold shadow-lg">Get Started</Button>
        </Link>
        <Link to="/login" className="w-full">
          <Button variant="outline" className="w-full h-12 text-lg font-bold border-2">Log In</Button>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl max-w-2xl w-full">
        <p className="font-semibold text-emerald-800">✨ Over 500+ GUB Students Joined</p>
        <p className="text-sm text-emerald-600/80 mt-1">Track your Tasbih, find context-aware Duas, and build habits with your friend circle.</p>
      </div>
    </div>
  );
}
