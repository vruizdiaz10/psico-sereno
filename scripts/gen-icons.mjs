import sharp from "sharp";
import { mkdirSync } from "node:fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#e8e4da"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#38412f" stroke-width="34"
          stroke-linecap="round" stroke-dasharray="800 120" stroke-dashoffset="160"
          transform="rotate(-100 256 256)"/>
</svg>
`;

mkdirSync("public/icons", { recursive: true });

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
}

console.log("Icons generated.");
