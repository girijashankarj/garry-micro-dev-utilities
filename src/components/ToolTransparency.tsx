import { BRAND, type ToolDefinition } from '@/common/constants';

function npmPackageUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`;
}

export function ToolPackageTags({ tool, maxTags = 4 }: { tool: ToolDefinition; maxTags?: number }) {
  const pkgs = tool.transparency.packages;
  if (pkgs.length === 0) {
    return (
      <span className="inline-flex items-center rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {BRAND.transparencyNoPackages}
      </span>
    );
  }

  const visible = pkgs.slice(0, maxTags);
  const rest = pkgs.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
      {visible.map((pkg) => (
        <a
          key={pkg.name}
          href={npmPackageUrl(pkg.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full truncate rounded-md border border-primary/25 bg-primary/5 px-2 py-0.5 text-[11px] font-mono text-primary hover:bg-primary/10 hover:underline"
          title={pkg.description}
        >
          {pkg.name}
        </a>
      ))}
      {rest > 0 && (
        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
          +{rest}
        </span>
      )}
    </div>
  );
}

export function ToolTransparencyBanner({ tool }: { tool: ToolDefinition }) {
  const { summary, packages } = tool.transparency;

  return (
    <section
      className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
      aria-label={`${BRAND.transparencyHeading}: ${BRAND.transparencyBannerSubtitle}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-semibold text-foreground">{BRAND.transparencyHeading}</span>
        <span className="text-muted-foreground">{BRAND.transparencyBannerSubtitle}</span>
      </div>
      <p className="mt-2 text-muted-foreground leading-relaxed">{summary}</p>

      {packages.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {packages.map((pkg) => (
            <li
              key={pkg.name}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2"
            >
              <a
                href={npmPackageUrl(pkg.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-mono text-sm font-medium text-primary hover:underline"
              >
                {pkg.name}
              </a>
              <span className="text-muted-foreground">{pkg.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-muted-foreground">
          No additional npm (Node Package Manager) libraries for core logic — processing uses
          browser application programming interfaces (APIs) and code in this repo only.
        </p>
      )}

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Shared app shell (all tools):{' '}
        <a
          className="font-mono text-primary hover:underline"
          href={npmPackageUrl('sonner')}
          target="_blank"
          rel="noopener noreferrer"
        >
          sonner
        </a>{' '}
        (toasts), user interface (UI) from{' '}
        <a
          className="text-primary hover:underline"
          href="https://www.radix-ui.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Radix UI (component primitives)
        </a>
        ,{' '}
        <a
          className="font-mono text-primary hover:underline"
          href={npmPackageUrl('tailwindcss')}
          target="_blank"
          rel="noopener noreferrer"
        >
          tailwindcss
        </a>
        ,{' '}
        <a
          className="font-mono text-primary hover:underline"
          href={npmPackageUrl('lucide-react')}
          target="_blank"
          rel="noopener noreferrer"
        >
          lucide-react
        </a>
        . Full list: <span className="font-mono">package.json</span>.
      </p>
    </section>
  );
}
