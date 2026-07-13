import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sereno",
    short_name: "Sereno",
    description:
      "Acompañamiento conversacional para crecimiento personal y bienestar emocional.",
    start_url: "/",
    display: "standalone",
    background_color: "#e8e4da",
    theme_color: "#e8e4da",
    lang: "es-MX",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
