/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import sharp from "sharp";

async function main() {
  const dir = path.join(process.cwd(), "public", "images", "logo");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const srcPath = path.join(process.cwd(), "public", "surekh.jpg.jpeg");
  const { data, info } = await sharp(srcPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  function extractAlpha(rVal: number, gVal: number, bVal: number) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 3];
      const g = data[i * 3 + 1];
      const b = data[i * 3 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let alpha = 0;
      if (lum < 162) {
        alpha = Math.min(
          255,
          Math.max(0, Math.round(((162 - lum) / (162 - 125)) * 255))
        );
      }
      rgba[i * 4] = rVal;
      rgba[i * 4 + 1] = gVal;
      rgba[i * 4 + 2] = bVal;
      rgba[i * 4 + 3] = alpha;
    }
    return rgba;
  }

  // 1. Dark Wine / Charcoal (#2e0d1d)
  const darkRgba = extractAlpha(46, 13, 29);
  // 2. White (#ffffff)
  const whiteRgba = extractAlpha(255, 255, 255);
  // 3. Gold / Champagne (#d4af37)
  const goldRgba = extractAlpha(212, 175, 55);

  // Full stacked logo
  await sharp(darkRgba, { raw: { width, height, channels: 4 } })
    .extract({ left: 195, top: 285, width: 710, height: 485 })
    .png()
    .toFile(path.join(dir, "surekh-logo-stacked.png"));

  await sharp(whiteRgba, { raw: { width, height, channels: 4 } })
    .extract({ left: 195, top: 285, width: 710, height: 485 })
    .png()
    .toFile(path.join(dir, "surekh-logo-stacked-white.png"));

  // Standalone Icon
  await sharp(darkRgba, { raw: { width, height, channels: 4 } })
    .extract({ left: 465, top: 295, width: 160, height: 300 })
    .png()
    .toFile(path.join(dir, "surekh-icon.png"));

  await sharp(whiteRgba, { raw: { width, height, channels: 4 } })
    .extract({ left: 465, top: 295, width: 160, height: 300 })
    .png()
    .toFile(path.join(dir, "surekh-icon-white.png"));

  await sharp(goldRgba, { raw: { width, height, channels: 4 } })
    .extract({ left: 465, top: 295, width: 160, height: 300 })
    .png()
    .toFile(path.join(dir, "surekh-icon-gold.png"));

  // Also create root public/surekh.png as transparent stacked
  fs.copyFileSync(
    path.join(dir, "surekh-logo-stacked.png"),
    path.join(process.cwd(), "public", "surekh.png")
  );
  fs.copyFileSync(
    path.join(dir, "surekh-logo-stacked-white.png"),
    path.join(process.cwd(), "public", "surekh-white.png")
  );

  // Generate horizontal versions
  async function makeHorizontal(isWhite: boolean) {
    const iconFile = path.join(
      dir,
      isWhite ? "surekh-icon-white.png" : "surekh-icon.png"
    );
    const iconTrimmed = await sharp(iconFile).trim().toBuffer();
    const iconResized = await sharp(iconTrimmed)
      .resize({ height: 160, fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const stackedFile = path.join(
      dir,
      isWhite ? "surekh-logo-stacked-white.png" : "surekh-logo-stacked.png"
    );
    const textRaw = await sharp(stackedFile)
      .extract({ left: 100, top: 330, width: 510, height: 95 })
      .toBuffer();
    const textTrimmed = await sharp(textRaw).trim().toBuffer();
    const textResized = await sharp(textTrimmed)
      .resize({ height: 60, fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const tagRaw = await sharp(stackedFile)
      .extract({ left: 0, top: 440, width: 710, height: 40 })
      .toBuffer();
    const tagTrimmed = await sharp(tagRaw).trim().toBuffer();
    const tagResized = await sharp(tagTrimmed)
      .resize({ height: 14, fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const iconW = iconResized.info.width;
    const iconH = iconResized.info.height;
    const textW = textResized.info.width;
    const textH = textResized.info.height;
    const tagW = tagResized.info.width;
    const tagH = tagResized.info.height;

    const gap = 20;
    const totalW = iconW + gap + Math.max(textW, tagW) + 12;
    const totalH = Math.max(iconH, textH + 8 + tagH) + 10;

    const iconTop = Math.round((totalH - iconH) / 2);
    const textBlockH = textH + 8 + tagH;
    const textTop = Math.round((totalH - textBlockH) / 2);
    const tagTop = textTop + textH + 8;
    const rightLeft = iconW + gap;

    const suffix = isWhite ? "-white" : "";

    // With tagline
    await sharp({
      create: {
        width: totalW,
        height: totalH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: iconResized.data, top: iconTop, left: 6 },
        { input: textResized.data, top: textTop, left: rightLeft },
        { input: tagResized.data, top: tagTop, left: rightLeft },
      ])
      .png()
      .toFile(path.join(dir, `surekh-horizontal${suffix}.png`));

    // Clean (without tagline)
    const compactH = Math.max(iconH, textH) + 10;
    const compactIconTop = Math.round((compactH - iconH) / 2);
    const compactTextTop = Math.round((compactH - textH) / 2);
    const compactTotalW = iconW + gap + textW + 12;

    await sharp({
      create: {
        width: compactTotalW,
        height: compactH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: iconResized.data, top: compactIconTop, left: 6 },
        { input: textResized.data, top: compactTextTop, left: rightLeft },
      ])
      .png()
      .toFile(path.join(dir, `surekh-horizontal-clean${suffix}.png`));
  }

  await makeHorizontal(false);
  await makeHorizontal(true);

  // Favicon & App Icons
  const iconWhiteTrimmed = await sharp(path.join(dir, "surekh-icon-white.png"))
    .trim()
    .toBuffer();
  const iconSquareSize = 340;
  const iconSquareResized = await sharp(iconWhiteTrimmed)
    .resize({ height: iconSquareSize, width: iconSquareSize, fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  const appIconOffsetLeft = Math.round(
    (512 - iconSquareResized.info.width) / 2
  );
  const appIconOffsetTop = Math.round(
    (512 - iconSquareResized.info.height) / 2
  );

  // App icon with brand background
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 61, g: 10, b: 32, alpha: 255 },
    },
  })
    .composite([
      {
        input: iconSquareResized.data,
        top: appIconOffsetTop,
        left: appIconOffsetLeft,
      },
    ])
    .png()
    .toFile(path.join(process.cwd(), "src", "app", "icon.png"));

  // Apple icon 180x180
  await sharp(path.join(process.cwd(), "src", "app", "icon.png"))
    .resize(180, 180)
    .toFile(path.join(process.cwd(), "src", "app", "apple-icon.png"));

  // 32x32 favicon
  await sharp(path.join(process.cwd(), "src", "app", "icon.png"))
    .resize(32, 32)
    .toFile(path.join(dir, "favicon-32x32.png"));

  console.log("All logo assets successfully generated!");
}

main().catch(console.error);
