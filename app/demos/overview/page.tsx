import Link from 'next/link';

// Layout Components
import { PageHeadline } from "@/components/layout/page-headline";
import { PageMain } from "@/components/layout/page-main";

// Components
import { GlowGrid } from "@/components/ui/GlowGrid/GlowGrid";

// Icons
import PhotoEditIcon from "@/components/ui/Icons/PhotoEditLogo";
import UploadIcon from "@/components/ui/Icons/UploadIcon";
import LabelIcon from "@/components/ui/Icons/LabelIcon";
import FileDotsIcon from "@/components/ui/Icons/FileDotsIcon";


interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  features?: string;
  link: string;
}

const GridItem = ({ area, icon, title, description, features, link }: GridItemProps) => {
  return (
    <li className={`min-h-56 list-none ${area}`}>
      <Link href={link} className="block h-full">
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3 cursor-pointer">
        <GlowGrid
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-white dark:bg-transparent shadow-sm dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-300 dark:border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h2 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h2>
              <h3 className="font-sans text-sm/[1.125rem] text-gray-700 md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-200">{features}</p>
            </div>
          </div>
        </div>
      </div>
      </Link>
    </li>
  );
};


export default function OverviewPage() {
  return (
    <PageMain>
      <PageHeadline
        title="Uplabelr"
        description="Uplabelr is a showcase of custom media tools for (image/video/text) to help label data accurately and efficiently along with techniques for handling large, multi-file uploads."
      />

      <div className="max-w-5xl mx-auto px-8">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <GridItem
            area=""
            icon={<UploadIcon className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Multi-file Upload Demo"
            description="Drag and drop multiple files with real-time progress tracking and validation."
            features="Built with React hooks and native File API."
            link="/demos/data-imports/manual-upload"
          />

          <GridItem
            area=""
            icon={<FileDotsIcon className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Chunked Upload Demo"
            description="Handle large files by splitting them into smaller pieces."
            features="Features resume capability and parallel processing."
            link="/demos/data-imports/chunked-upload"
          />

          <GridItem
            area=""
            icon={<PhotoEditIcon className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Image Labeling Demo"
            description="Draw bounding boxes on images with custom labels."
            features="Uses HTML Canvas API with session storage persistence."
            link="/demos/image-labels"
          />

          <GridItem
            area=""
            icon={<LabelIcon className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Text Labeling Demo"
            description="Select any text to add custom labels."
            features="Export your annotations as JSON, CSV, or JSONL for training datasets."
            link="/demos/add-labels"
          />
        </ul>
      </div>
    </PageMain>
  )
}