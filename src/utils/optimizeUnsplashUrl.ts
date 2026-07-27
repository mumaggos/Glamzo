export const optimizeUnsplashUrl = (url: string | null, width = 400) => {
  if (!url) return undefined;
  if (url.includes('unsplash.com')) {
    if (!url.includes('w=')) return `${url.includes('?') ? url + '&' : url + '?'}auto=format,compress&fit=crop&w=${width}&q=50`;
    return url;
  }
  return url;
};
