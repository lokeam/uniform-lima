'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/utils';

interface Tab {
  label: string;
  href: string;
  badge?: string | number;
}

interface NavigationTabsProps {
  tabs: Tab[];
  className?: string;
}

export function NavigationTabs({ tabs, className }: NavigationTabsProps) {

  const pathname = usePathname();

  return(
    <nav className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      <div className="flex gap-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return(
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'pb-3 px-1 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2',
                isActive
                  ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tab.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  );
}