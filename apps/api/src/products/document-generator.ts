import type { Product } from '@specfinder/shared';

export const DOWNLOADABLE_DOCUMENT_TYPES = ['TDS', 'SDS', 'DoP', 'EPD'] as const;
export type DownloadableDocumentType = (typeof DOWNLOADABLE_DOCUMENT_TYPES)[number];

export function isDownloadableDocumentType(type: string): type is DownloadableDocumentType {
  return (DOWNLOADABLE_DOCUMENT_TYPES as readonly string[]).includes(type);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFireRating(minutes: number | null): string {
  if (minutes === null) return 'Not fire-rated';
  return `EI ${minutes}`;
}

function formatRw(value: number | null): string {
  if (value === null) return '—';
  return `Rw ${value} dB`;
}

function formatMoisture(value: string): string {
  if (value === 'none') return 'Dry (no moisture class)';
  return value;
}

function facePaperLabel(facePaper: string): string {
  switch (facePaper) {
    case 'pink':
      return 'Fire-rated (pink face paper)';
    case 'green':
      return 'Moisture-resistant (green face paper)';
    case 'ivory':
      return 'Standard (ivory face paper)';
    case 'grey':
      return 'Impact-resistant (grey face paper)';
    default:
      return 'Unspecified';
  }
}

function documentTitle(type: DownloadableDocumentType, productName: string): string {
  switch (type) {
    case 'TDS':
      return `${productName} — Technical datasheet`;
    case 'SDS':
      return `${productName} — Safety datasheet`;
    case 'DoP':
      return `${productName} — Declaration of Performance`;
    case 'EPD':
      return `${productName} — Environmental Product Declaration`;
  }
}

function documentFilename(slug: string, type: DownloadableDocumentType): string {
  return `aurelith-${slug}-${type.toLowerCase()}.html`;
}

function datasheetStyles(): string {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px;
      font-family: "IBM Plex Sans", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #16191c;
      background: #fbfbfa;
    }
    .page {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #dfe1de;
      padding: 40px;
    }
    .eyebrow {
      font-family: "IBM Plex Mono", monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #5b6167;
      margin: 0 0 8px;
    }
    h1 {
      font-family: Archivo, Arial, sans-serif;
      font-size: 28px;
      line-height: 1.15;
      margin: 0 0 8px;
    }
    .tagline { color: #5b6167; margin: 0 0 24px; }
    .meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 24px 0;
      padding: 16px 0;
      border-top: 1px solid #dfe1de;
      border-bottom: 1px solid #dfe1de;
    }
    .meta dt {
      font-family: "IBM Plex Mono", monospace;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #5b6167;
      margin-bottom: 4px;
    }
    .meta dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
      font-family: "IBM Plex Mono", monospace;
      font-size: 15px;
      font-weight: 600;
    }
    h2 {
      font-family: Archivo, Arial, sans-serif;
      font-size: 16px;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #dfe1de;
    }
    p { margin: 0 0 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
      font-family: "IBM Plex Mono", monospace;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #dfe1de;
      padding: 8px 10px;
      text-align: left;
    }
    th { background: #f1f2f0; }
    ul { margin: 0; padding-left: 18px; }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #dfe1de;
      font-size: 12px;
      color: #5b6167;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page { border: none; padding: 24px; }
    }
  `;
}

function performanceSection(product: Product): string {
  return `
    <section>
      <h2>Performance summary</h2>
      <dl class="meta">
        <div>
          <dt>Fire resistance</dt>
          <dd>${escapeHtml(formatFireRating(product.performance.fireResistanceMin))}</dd>
        </div>
        <div>
          <dt>Sound insulation</dt>
          <dd>${escapeHtml(formatRw(product.performance.soundReductionRw))}</dd>
        </div>
        <div>
          <dt>Moisture class</dt>
          <dd>${escapeHtml(formatMoisture(product.performance.moistureClass))}</dd>
        </div>
        <div>
          <dt>Reaction to fire</dt>
          <dd>${escapeHtml(product.performance.reactionToFireClass ?? '—')}</dd>
        </div>
        <div>
          <dt>Impact resistance</dt>
          <dd>${escapeHtml(product.performance.impactResistanceClass ?? '—')}</dd>
        </div>
        <div>
          <dt>Thermal conductivity λ</dt>
          <dd>${escapeHtml(product.performance.thermalConductivity != null ? `${product.performance.thermalConductivity} W/mK` : '—')}</dd>
        </div>
      </dl>
    </section>
  `;
}

function variantsSection(product: Product): string {
  const rows = product.variants
    .map(
      (variant) => `
        <tr>
          <td>${escapeHtml(variant.materialNumber)}</td>
          <td>${variant.thicknessMm}</td>
          <td>${variant.widthMm} × ${variant.lengthMm}</td>
          <td>${variant.weightKg}</td>
          <td>${variant.weightPerSqmKg}</td>
          <td>${variant.piecesPerPallet ?? '—'}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <section>
      <h2>Variants &amp; material numbers</h2>
      <table>
        <thead>
          <tr>
            <th>Material no.</th>
            <th>Thickness (mm)</th>
            <th>Dimensions (mm)</th>
            <th>Weight (kg)</th>
            <th>kg/m²</th>
            <th>Pcs/pallet</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function standardsSection(product: Product): string {
  const items = product.standards.map((standard) => `<li>${escapeHtml(standard)}</li>`).join('');
  return `
    <section>
      <h2>Applicable standards</h2>
      <ul>${items}</ul>
    </section>
  `;
}

function renderShell(product: Product, type: DownloadableDocumentType, body: string): string {
  const title = documentTitle(type, product.name);
  const generatedAt = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${datasheetStyles()}</style>
  </head>
  <body>
    <article class="page">
      <p class="eyebrow">Aurelith · ${escapeHtml(type)} · ${escapeHtml(product.family)}</p>
      <h1>${escapeHtml(product.name)}</h1>
      <p class="tagline">${escapeHtml(product.tagline)}</p>
      <p><strong>Face paper:</strong> ${escapeHtml(facePaperLabel(product.facePaper))}</p>
      ${body}
      <footer class="footer">
        <p>Fictional Aurelith document generated by SpecFinder for demonstration purposes.</p>
        <p>Generated: ${escapeHtml(generatedAt)} · Product slug: ${escapeHtml(product.slug)}</p>
      </footer>
    </article>
  </body>
</html>`;
}

function generateTds(product: Product): string {
  return renderShell(
    product,
    'TDS',
    `
      ${performanceSection(product)}
      ${variantsSection(product)}
      ${standardsSection(product)}
      <section>
        <h2>Field of application</h2>
        <p>${escapeHtml(product.description)}</p>
        <p><strong>Applications:</strong> ${escapeHtml(product.applications.join(', '))}</p>
        <p><strong>Area of application:</strong> ${escapeHtml(product.areaOfApplication)}</p>
        <p><strong>Edge profile:</strong> ${escapeHtml(product.edgeProfile)}</p>
      </section>
    `,
  );
}

function generateSds(product: Product): string {
  return renderShell(
    product,
    'SDS',
    `
      <section>
        <h2>Identification</h2>
        <p>${escapeHtml(product.name)} is a ${escapeHtml(product.category.replace(/_/g, ' '))} product supplied under material numbers listed in the technical datasheet.</p>
      </section>
      <section>
        <h2>Handling &amp; storage</h2>
        <ul>
          <li>Store flat in a dry, covered area.</li>
          <li>Protect edges and face paper from moisture and mechanical damage.</li>
          <li>Wear cut-resistant gloves when handling boards with damaged edges.</li>
        </ul>
      </section>
      <section>
        <h2>Disposal</h2>
        <p>Dispose of in accordance with local construction waste regulations. Gypsum-based boards may be recyclable where facilities exist.</p>
      </section>
      ${variantsSection(product)}
    `,
  );
}

function generateDop(product: Product): string {
  return renderShell(
    product,
    'DoP',
    `
      <section>
        <h2>Declared performance</h2>
        <p>This Declaration of Performance summarises the essential characteristics declared for ${escapeHtml(product.name)} under the Construction Products Regulation.</p>
        ${performanceSection(product)}
        ${standardsSection(product)}
      </section>
      <section>
        <h2>Manufacturer</h2>
        <p>Aurelith Building Materials GmbH (fictional) · Munich, Germany</p>
      </section>
    `,
  );
}

function generateEpd(product: Product): string {
  if (!product.sustainability.hasEpd) {
    throw new Error('EPD not available for this product');
  }

  return renderShell(
    product,
    'EPD',
    `
      <section>
        <h2>Environmental summary</h2>
        <dl class="meta">
          <div>
            <dt>Recycled content</dt>
            <dd>${product.sustainability.recycledContentPct != null ? `${product.sustainability.recycledContentPct}%` : '—'}</dd>
          </div>
          <div>
            <dt>EPD status</dt>
            <dd>Third-party verified</dd>
          </div>
        </dl>
        <p>Environmental Product Declaration data is provided for specification and tender documentation. Functional unit: 1 m² installed board.</p>
      </section>
      ${performanceSection(product)}
      ${standardsSection(product)}
    `,
  );
}

export function generateProductDocument(
  product: Product,
  type: DownloadableDocumentType,
): { html: string; filename: string; title: string } {
  let html: string;
  switch (type) {
    case 'TDS':
      html = generateTds(product);
      break;
    case 'SDS':
      html = generateSds(product);
      break;
    case 'DoP':
      html = generateDop(product);
      break;
    case 'EPD':
      html = generateEpd(product);
      break;
  }

  return {
    html,
    filename: documentFilename(product.slug, type),
    title: documentTitle(type, product.name),
  };
}
