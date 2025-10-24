export function preloadImages(urls: string[]) {
  urls.forEach((u) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = u;
  });
}
