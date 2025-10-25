import { TopNavigation } from "@/components/navigation/TopNavigation";
import UplabelrLogo from "@/components/ui/logos/UplabelrLogo";
import { NavigationTabs } from "@/components/navigation/NavigationTabs";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {

  const tabs = [
      { label: 'Overview', href: '/demos/overview' },
      { label: 'Data imports', href: '/demos/data-imports', badge: '3' },
      { label: 'Cases', href: '/demos/cases', badge: '2357' },
      { label: 'Add labels', href: '/demos/add-labels' },
    ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <TopNavigation fixed>
        <UplabelrLogo className="size-6" />
        <div>Uplabelr</div>
      </TopNavigation>

      {/* Main */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Demos (safe to share) / Medical Transcript NER Demo /  Identification
          </div>

          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Techniques for uploading large datasets & labeling media files
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-300">
                  Text
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-300">
                  Named Entity Recognition
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                Manage Task
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                Download results
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <NavigationTabs tabs={tabs} className="mb-8" />

          {/* Child pages render here - NO REDIRECT NEEDED! */}
          {children}
        </div>
      </main>
    </div>
  );
}
