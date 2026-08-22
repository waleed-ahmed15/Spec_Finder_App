import Link from 'next/link';

const palette = [
  { name: 'Surface', token: '--surface', className: 'bg-surface' },
  {
    name: 'Surface raised',
    token: '--surface-raised',
    className: 'bg-surface-raised border border-rule',
  },
  { name: 'Surface sunken', token: '--surface-sunken', className: 'bg-surface-sunken' },
  { name: 'Ink', token: '--ink', className: 'bg-ink' },
  { name: 'Ink muted', token: '--ink-muted', className: 'bg-ink-muted' },
  { name: 'Primary', token: '--primary', className: 'bg-primary' },
  { name: 'Primary tint', token: '--primary-tint', className: 'bg-primary-tint' },
  { name: 'Face fire', token: '--face-fire', className: 'bg-face-fire' },
  { name: 'Face moisture', token: '--face-moisture', className: 'bg-face-moisture' },
  { name: 'Face standard', token: '--face-standard', className: 'bg-face-standard' },
  { name: 'Face impact', token: '--face-impact', className: 'bg-face-impact' },
  { name: 'Meets', token: '--meets', className: 'bg-meets' },
  { name: 'Exceeds', token: '--exceeds', className: 'bg-exceeds' },
];

export default function TokensPreviewPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Design system</p>
          <h1 className="font-display text-3xl font-semibold">SpecFinder tokens</h1>
        </div>
        <Link href="/products" className="text-sm text-primary hover:text-primary-hover">
          Go to products
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="font-display mb-4 text-xl font-semibold">Typography roles</h2>
        <div className="space-y-4 rounded border border-rule bg-surface-raised p-6">
          <div>
            <p className="eyebrow mb-1">Display / Archivo</p>
            <p className="font-display text-2xl font-semibold">Aurelith Ignis 15</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Body / IBM Plex Sans</p>
            <p className="text-base">
              High-density fire-rated core for partition walls requiring EI 90.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Data / IBM Plex Mono</p>
            <p className="font-data text-base">
              00767843 · 15 mm · 1200×2400 · 12.0 kg/m² · Rw 54 dB
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-semibold">Palette</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {palette.map((swatch) => (
            <div key={swatch.token} className="rounded border border-rule bg-surface-raised p-3">
              <div className={`mb-3 h-16 rounded ${swatch.className}`} />
              <p className="text-sm font-medium">{swatch.name}</p>
              <p className="font-data text-xs text-ink-muted">{swatch.token}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
