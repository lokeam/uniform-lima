import { TopNavigation } from "@/components/navigation/TopNavigation";
import UplabelrLogo from "@/components/ui/logos/UplabelrLogo";
import { NavigationTabs } from "@/components/navigation/NavigationTabs";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {

  const tabs = [
      { label: 'Overview', href: '/demos/overview' },
      { label: 'File Uploading', href: '/demos/data-imports' },
      { label: 'Image Labeling', href: '/demos/image-labels' },
      { label: 'Text Labeling', href: '/demos/add-labels' },
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
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Techniques for uploading large datasets & labeling media files
              </h3>
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
