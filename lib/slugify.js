export default function slugify(input = "") {
  return input
    .toString()
    .toLowerCase()
    // keep Arabic letters, numbers, spaces, hyphens
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
