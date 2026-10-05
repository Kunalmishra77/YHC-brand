'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { SiteVideo } from '@/lib/images';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './background-video';
import { RAIL, RAIL_ITEM } from './section';

export interface StoryVideo {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  video: SiteVideo;
  /** Storyline captions laid over the b-roll, shown in turn (seconds from the start of each loop). */
  captions: { at: number; text: string }[];
}

/**
 * "Watch" cards that open a dialog player. The footage is illustrative b-roll with storyline captions —
 * not testimonials, not our clinic and not Dr. Tyagi — and every card says so.
 */
export function VideoLibrary({ videos, className }: { videos: StoryVideo[]; className?: string }) {
  // Several stories: a swipeable rail on phones/tablets, three columns on desktop. One story: a single card.
  const rail = videos.length > 1;
  return (
    <ul className={cn(rail ? RAIL : 'grid', className)} aria-label="Explainer videos">
      {videos.map((v) => (
        <li key={v.id} className={rail ? RAIL_ITEM : undefined}>
          <VideoCard story={v} />
        </li>
      ))}
    </ul>
  );
}

function VideoCard({ story }: { story: StoryVideo }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-ink-2 text-left ring-1 ring-line-dark transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-raised hover:ring-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-on-dark motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="relative aspect-video">
            <Image
              src={story.video.poster}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />
            <span className="absolute top-3 left-3 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-on-dark backdrop-blur">
              Illustrative b-roll
            </span>
            <span className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform group-hover:scale-105 motion-reduce:transition-none">
              <Play className="ml-0.5 size-5 fill-current" aria-hidden />
            </span>
          </div>
          <div className="p-5">
            <p className="text-[12px] font-semibold tracking-[0.12em] text-brand-on-dark uppercase">
              {story.kicker}
            </p>
            <p className="mt-2 font-display text-2xl leading-tight text-on-dark">{story.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{story.summary}</p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden border-line-dark bg-obsidian p-0 text-on-dark sm:max-w-3xl [&>button]:text-on-dark">
        <DialogTitle className="sr-only">{story.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {story.summary} Illustrative footage with captions; no sound.
        </DialogDescription>
        <StoryPlayer story={story} />
      </DialogContent>
    </Dialog>
  );
}

function StoryPlayer({ story }: { story: StoryVideo }) {
  const reduced = usePrefersReducedMotion();
  const [caption, setCaption] = useState(0);
  const onTime = (t: number) => {
    let idx = 0;
    story.captions.forEach((c, i) => {
      if (t >= c.at) idx = i;
    });
    setCaption(idx);
  };
  return (
    <div>
      <div className="relative aspect-video bg-black">
        {reduced ? (
          <Image src={story.video.poster} alt="" fill sizes="768px" className="object-cover" />
        ) : (
          <video
            className="absolute inset-0 size-full object-cover"
            src={story.video.src}
            poster={story.video.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
            onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
            aria-label={story.video.label}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-12 flex justify-center px-6">
          <p
            key={caption}
            aria-live="polite"
            className="max-w-xl animate-in rounded-xl bg-black/60 px-4 py-2.5 text-center text-[15px] leading-snug text-white backdrop-blur duration-500 fade-in motion-reduce:animate-none"
          >
            {reduced ? story.captions.map((c) => c.text).join(' ') : (story.captions[caption]?.text ?? '')}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-5 sm:p-6">
        <p className="text-[12px] font-semibold tracking-[0.12em] text-brand-on-dark uppercase">
          {story.kicker}
        </p>
        <p className="font-display text-2xl text-on-dark">{story.title}</p>
        <p className="mt-1 text-[13px] text-on-dark-muted">
          Illustrative laboratory footage with captions — not a patient, not our clinic and not Dr. Tyagi. No
          sound.
        </p>
      </div>
    </div>
  );
}
