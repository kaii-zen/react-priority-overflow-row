import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import gifenc from 'gifenc';
import { chromium } from 'playwright';

const { GIFEncoder, applyPalette, quantize } = gifenc;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'docs', 'assets');
const serverUrl = 'http://127.0.0.1:4173';

const gifs = [
  {
    fileName: 'workspace-header-priorities.gif',
    selector: '[data-example="workspace-header"]',
    widths: smoothWidths(760, 320, 22, 720),
  },
  {
    fileName: 'toolbar-priorities.gif',
    selector: '[data-example="toolbar"]',
    widths: smoothWidths(820, 320, 20, 760),
  },
];

await fs.mkdir(assetsDir, { recursive: true });

const server = spawn(
  process.execPath,
  [
    path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
    'examples/basic',
    '--host',
    '127.0.0.1',
    '--port',
    '4173',
    '--strictPort',
  ],
  {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

try {
  await waitForServer(serverUrl);

  const browser = await chromium.launch({
    channel: 'chrome',
  });

  try {
    const page = await browser.newPage({
      deviceScaleFactor: 1,
      viewport: {
        width: 1120,
        height: 760,
      },
    });

    await page.goto(serverUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          caret-color: transparent !important;
          transition: none !important;
        }
      `,
    });

    for (const gif of gifs) {
      await writeGifFromRenderedExample(page, gif);
    }

    await page.close();
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}

async function writeGifFromRenderedExample(page, { fileName, selector, widths }) {
  const gif = GIFEncoder();
  const frames = [];

  for (const width of widths) {
    await setExampleWidth(page, selector, width);
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    const png = await locator.screenshot({
      animations: 'disabled',
      scale: 'css',
    });
    frames.push(await pngToRawFrame(png));
  }

  const { width, height } = commonFrameSize(frames);

  for (const [index, frame] of frames.entries()) {
    const normalized = await normalizeFrame(frame, width, height);
    const palette = quantize(normalized.data, 256, { format: 'rgba4444' });
    const indexed = applyPalette(normalized.data, palette, 'rgba4444');

    gif.writeFrame(indexed, width, height, {
      palette,
      delay: index === frames.length - 1 ? 1000 : 90,
    });
  }

  gif.finish();
  await fs.writeFile(path.join(assetsDir, fileName), gif.bytes());
}

async function setExampleWidth(page, selector, width) {
  await page.locator(selector).evaluate(
    (element, nextWidth) => {
      element.style.width = `${nextWidth}px`;
    },
    width,
  );

  await page.waitForFunction(
    ({ frameSelector, expectedWidth }) => {
      const element = document.querySelector(frameSelector);

      if (!element) {
        return false;
      }

      return Math.round(element.getBoundingClientRect().width) === expectedWidth;
    },
    { frameSelector: selector, expectedWidth: width },
  );

  // Let ResizeObserver-driven mode selection settle after the explicit resize.
  await page.waitForTimeout(80);
}

function smoothWidths(start, end, steps, returnTo) {
  const down = Array.from({ length: steps }, (_, index) =>
    Math.round(start + ((end - start) * index) / (steps - 1)),
  );
  const up = Array.from({ length: Math.max(Math.floor(steps / 2), 2) }, (_, index) =>
    Math.round(end + ((returnTo - end) * (index + 1)) / Math.floor(steps / 2)),
  );

  return [...down, ...up];
}

async function pngToRawFrame(png) {
  const image = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: image.data,
    width: image.info.width,
    height: image.info.height,
  };
}

function commonFrameSize(frames) {
  return {
    width: Math.max(...frames.map((frame) => frame.width)),
    height: Math.max(...frames.map((frame) => frame.height)),
  };
}

async function normalizeFrame(frame, width, height) {
  if (frame.width === width && frame.height === height) {
    return frame;
  }

  const data = await sharp(frame.data, {
    raw: {
      width: frame.width,
      height: frame.height,
      channels: 4,
    },
  })
    .extend({
      right: width - frame.width,
      bottom: height - frame.height,
      background: {
        r: 255,
        g: 255,
        b: 255,
        alpha: 1,
      },
    })
    .raw()
    .toBuffer();

  return {
    data,
    width,
    height,
  };
}

async function waitForServer(url) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 20_000) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `Timed out waiting for ${url}${lastError ? `: ${lastError}` : ''}`,
  );
}
