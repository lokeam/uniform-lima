import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { pageTree } from './source';
import UplabelrLogo from '@/components/ui/Icons/UplabelrLogo';

// Types
import type { ReactNode } from 'react';

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={pageTree}
      githubUrl="https://github.com/lokeam/uniform-lima"
      nav={{
        title: (
          <div className="flex items-center gap-2">
            <UplabelrLogo className="size-8" />
            <span className="font-bold text-md">Uplabelr</span><span className="text-sm">by Ahn Ming Loke</span>
          </div>
        ),
        url: '/',
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  );
}