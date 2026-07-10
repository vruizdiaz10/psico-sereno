import sharp from "sharp";
import { mkdirSync } from "node:fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#18181b"/>
  <text x="256" y="340" font-family="Georgia, serif" font-size="280"
        fill="#fafafa" text-anchor="middle">S</text>
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
