// Turns a client video (Google Flow) into a scroll sequence for <ScrollSequence name="…">, the same format
// as the showcase templates: public/media/seq/<name>/frame_0001.webp … + manifest.json.
// Needs ffmpeg on PATH. Usage: node scripts/video-to-frames.mjs <video.mp4> <name> [fps=24] [width=1600]
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [video, name, fpsArg = '24', widthArg = '1600'] = process.argv.slice(2);
if (!video || !name) throw new Error('usage: node scripts/video-to-frames.mjs <video> <name> [fps] [width]');
const out = join('public', 'media', 'seq', name);
mkdirSync(out, { recursive: true });
execFileSync('ffmpeg', ['-y', '-i', video, '-vf', `fps=${fpsArg},scale=${widthArg}:-2`, '-c:v', 'libwebp', '-quality', '72', join(out, 'frame_%04d.webp')], { stdio: 'inherit' });
const count = readdirSync(out).filter((f) => f.startsWith('frame_')).length;
const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', join(out, 'frame_0001.webp')]).toString().trim();
const [width, height] = probe.split(',').map(Number);
writeFileSync(join(out, 'manifest.json'), JSON.stringify({ count, ext: 'webp', width, height, pad: 4, prefix: 'frame_', fps: Number(fpsArg) }));
console.log(`${name}: ${count} frames ${width}x${height} → ${out}`);
