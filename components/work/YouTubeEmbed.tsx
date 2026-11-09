"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// Click-to-load: no third-party requests to YouTube's player until the visitor presses play.
export default function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-sm border border-line bg-graphite">
      {on ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setOn(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-night/40 transition-colors group-hover:bg-night/20" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-lime text-night shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
