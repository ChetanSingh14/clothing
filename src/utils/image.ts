export const getOptimizedUrl = (url?: string): string => {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes("f_auto,q_auto")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  }
  return url;
};
