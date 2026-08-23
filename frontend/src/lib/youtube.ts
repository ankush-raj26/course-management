// turns a youtube watch/share/embed url into an autoplaying embed url. returns null if it's not a youtube link.
export function getYouTubeEmbedUrl(url: string): string | null {
  let videoId: string | null = null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1] ?? null;
      }
    }
  } catch {
    return null;
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}
