export const optimizeUnsplashUrl = (url: string | null, width = 400) => {
  if (!url) return undefined;
  if (url.includes('unsplash.com')) {
    if (!url.includes('w=')) return `${url.includes('?') ? url + '&' : url + '?'}auto=format&fit=crop&w=${width}&q=75`;
    return url;
  }
  return url;
};
