import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import gifenc from 'gifenc';

const { GIFEncoder, applyPalette, quantize } = gifenc;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'docs', 'assets');

await fs.mkdir(assetsDir, { recursive: true });

await writeGif(
  'job-header-priorities.gif',
  [980, 760, 610, 500, 390, 560, 880],
  renderJobHeaderFrame,
);
await writeGif(
  'toolbar-priorities.gif',
  [820, 680, 560, 440, 360, 610, 820],
  renderToolbarFrame,
);

async function writeGif(fileName, widths, renderFrame) {
  const gif = GIFEncoder();
  const renderedFrames = await Promise.all(
    widths.map((width, index) =>
      rasterizeSvg(renderFrame(width, index, widths.length)),
    ),
  );

  renderedFrames.forEach(({ data, width, height }, index) => {
    const palette = quantize(data, 256, { format: 'rgba4444' });
    const indexed = applyPalette(data, palette, 'rgba4444');
    gif.writeFrame(indexed, width, height, {
      palette,
      delay: index === renderedFrames.length - 1 ? 1200 : 850,
    });
  });

  gif.finish();
  await fs.writeFile(path.join(assetsDir, fileName), gif.bytes());
}

async function rasterizeSvg(svg) {
  const image = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: image.data,
    width: image.info.width,
    height: image.info.height,
  };
}

function renderJobHeaderFrame(width) {
  const stages = jobHeaderStages(width);
  const row2Y = stages.wrapped ? 138 : 86;
  const rightX = stages.wrapped ? 62 : Math.max(62, width - stages.rightWidth - 42);

  return svgShell({
    title: 'Job header priorities',
    width,
    height: 230,
    body: `
      ${container(width, stages.wrapped ? 178 : 126)}
      ${breadcrumbs(stages.breadcrumbs, 62, 86)}
      ${quoteChip(356, 86)}
      ${people(stages.people, rightX, row2Y)}
      ${jobChips(stages.chips, rightX + stages.peopleWidth + 14, row2Y)}
      ${divider(rightX + stages.peopleWidth + stages.chipsWidth + 28, row2Y - 17)}
      ${actions(stages.actions, rightX + stages.peopleWidth + stages.chipsWidth + 44, row2Y)}
      ${caption(stages.caption, 62, stages.wrapped ? 202 : 152)}
    `,
  });
}

function renderToolbarFrame(width) {
  const state = toolbarStages(width);
  const row2Y = state.wrapped ? 134 : 86;
  const rightX = state.wrapped ? 62 : Math.max(62, width - state.rightWidth - 42);

  return svgShell({
    title: 'Toolbar priorities',
    width,
    height: 222,
    body: `
      ${container(width, state.wrapped ? 170 : 120)}
      ${text('Quote 173603', 62, 91, 26, '#20242a', 800)}
      ${toolbarButtons(state.mode, rightX, row2Y)}
      ${caption(state.caption, 62, state.wrapped ? 194 : 144)}
    `,
  });
}

function jobHeaderStages(width) {
  if (width >= 820) {
    return {
      breadcrumbs: 'full',
      people: 'comfortable',
      chips: 'full',
      actions: 'full',
      wrapped: false,
      peopleWidth: 104,
      chipsWidth: 432,
      rightWidth: 104 + 14 + 432 + 16 + 154,
      caption: 'Full row: no compaction required.',
    };
  }

  if (width >= 650) {
    return {
      breadcrumbs: 'compact',
      people: 'comfortable',
      chips: 'short',
      actions: 'full',
      wrapped: false,
      peopleWidth: 104,
      chipsWidth: 326,
      rightWidth: 104 + 14 + 326 + 16 + 154,
      caption: 'Breadcrumbs compact first, then chip labels shorten.',
    };
  }

  if (width >= 530) {
    return {
      breadcrumbs: 'compact',
      people: 'tight',
      chips: 'short',
      actions: 'icon',
      wrapped: false,
      peopleWidth: 74,
      chipsWidth: 326,
      rightWidth: 74 + 14 + 326 + 16 + 94,
      caption: 'Actions become icons before chips lose all labels.',
    };
  }

  if (width >= 430) {
    return {
      breadcrumbs: 'full',
      people: 'comfortable',
      chips: 'short',
      actions: 'icon',
      wrapped: true,
      peopleWidth: 104,
      chipsWidth: 326,
      rightWidth: 104 + 14 + 326 + 16 + 94,
      caption: 'The right group wraps and re-expands on its own line.',
    };
  }

  return {
    breadcrumbs: 'compact',
    people: 'tight',
    chips: 'icon',
    actions: 'icon',
    wrapped: true,
    peopleWidth: 74,
    chipsWidth: 224,
    rightWidth: 74 + 14 + 224 + 16 + 94,
    caption: 'After wrapping, each line still compacts under viewport pressure.',
  };
}

function toolbarStages(width) {
  if (width >= 760) {
    return {
      mode: 'full',
      wrapped: false,
      rightWidth: 520,
      caption: 'Toolbar actions keep full labels when the row fits.',
    };
  }

  if (width >= 600) {
    return {
      mode: 'short',
      wrapped: false,
      rightWidth: 360,
      caption: 'Secondary action labels shorten before wrapping.',
    };
  }

  if (width >= 480) {
    return {
      mode: 'icon',
      wrapped: false,
      rightWidth: 220,
      caption: 'Icon mode is the last in-row representation.',
    };
  }

  return {
    mode: width >= 390 ? 'short' : 'icon',
    wrapped: true,
    rightWidth: width >= 390 ? 360 : 220,
    caption: 'The action group wraps, then solves again from available width.',
  };
}

function svgShell({ title, width, height, body }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1040" height="${height}" viewBox="0 0 1040 ${height}">
      <rect width="1040" height="${height}" fill="#eef2f7"/>
      ${text(title, 42, 32, 19, '#334155', 800)}
      ${text(`${width}px`, width + 52, 32, 15, '#64748b', 700)}
      ${body}
    </svg>
  `;
}

function container(width, height) {
  return `
    <rect x="42" y="48" width="${width}" height="${height}" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>
    <line x1="${width + 42}" y1="48" x2="${width + 42}" y2="${height + 48}" stroke="#2563eb" stroke-width="3" stroke-dasharray="8 6"/>
  `;
}

function breadcrumbs(mode, x, y) {
  const label =
    mode === 'full' ? 'Home / Production / Jobs / 67194-0' : 'H / P / J / 67194-0';

  return pill(label, x, y - 24, mode === 'full' ? 274 : 170, '#e0f2fe', '#1478d4');
}

function quoteChip(x, y) {
  return pill('173603', x, y - 24, 88, '#ffffff', '#1781e9', '#6bb6ff');
}

function people(spacing, x, y) {
  const overlap = spacing === 'tight' ? 20 : 10;
  return ['EC', 'SS', 'MB']
    .map((label, index) => {
      const cx = x + index * (36 - overlap) + 18;
      const colors = ['#a76ea1', '#9fe95b', '#6875f5'];
      return `
        <circle cx="${cx}" cy="${y}" r="19" fill="${colors[index]}" stroke="#fff" stroke-width="3"/>
        ${text(label, cx - 10, y + 6, 14, '#fff', 800)}
      `;
    })
    .join('');
}

function jobChips(mode, x, y) {
  const labels =
    mode === 'full'
      ? [
          ['Packages', 116, '#11aee7'],
          ['Welding', 108, '#ffc928'],
          ['Picking', 96, '#dfe3e9'],
          ['Production', 122, '#dfe3e9'],
        ]
      : mode === 'short'
        ? [
            ['Pkg', 74, '#11aee7'],
            ['Weld', 82, '#ffc928'],
            ['Pick', 76, '#dfe3e9'],
            ['Prod', 78, '#dfe3e9'],
          ]
        : [
            ['PK', 48, '#11aee7'],
            ['WD', 48, '#ffc928'],
            ['PI', 48, '#dfe3e9'],
            ['PR', 48, '#dfe3e9'],
          ];
  let cursor = x;
  return labels
    .map(([label, width, fill]) => {
      const output = pill(label, cursor, y - 19, Number(width), String(fill), '#111827');
      cursor += Number(width) + 8;
      return output;
    })
    .join('');
}

function actions(mode, x, y) {
  const labels = mode === 'full' ? [['BOM', 76], ['Save', 86]] : [['B', 42], ['S', 42]];
  let cursor = x;
  return labels
    .map(([label, width], index) => {
      const fill = index === 1 ? '#d0d0d0' : '#238be6';
      const color = index === 1 ? '#6b7280' : '#fff';
      const output = pill(String(label), cursor, y - 21, Number(width), fill, color);
      cursor += Number(width) + 8;
      return output;
    })
    .join('');
}

function toolbarButtons(mode, x, y) {
  const labels =
    mode === 'full'
      ? [
          ['Refresh', 104],
          ['Print preview', 156],
          ['Approval drawing', 190],
          ['Save', 88],
        ]
      : mode === 'short'
        ? [
            ['R', 48],
            ['P', 48],
            ['A', 48],
            ['Save', 88],
          ]
        : [
            ['R', 48],
            ['P', 48],
            ['A', 48],
            ['S', 48],
          ];
  let cursor = x;
  return labels
    .map(([label, width]) => {
      const output = pill(String(label), cursor, y - 21, Number(width), '#475569', '#fff');
      cursor += Number(width) + 8;
      return output;
    })
    .join('');
}

function divider(x, y) {
  return `<rect x="${x}" y="${y}" width="1" height="34" fill="#cbd5e1"/>`;
}

function caption(value, x, y) {
  return text(value, x, y, 16, '#64748b', 600);
}

function pill(label, x, y, width, fill, color, stroke = 'transparent') {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="38" rx="19" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    ${text(label, x + 16, y + 25, 17, color, 800)}
  `;
}

function text(value, x, y, size, fill, weight) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${escapeHtml(value)}</text>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
