import { cn } from "@/components/ui/utils";

interface TopNavigationProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>
}

export function TopNavigation({
  className,
  children,
  fixed,
  ...props
}: TopNavigationProps) {

  return (
    <header
      id="top-nav"
      className={cn(
        'flex items-center gap-3 sm:gap-4 bg-background p-4 h-16',
        fixed && 'header-fixed peer/header w-[inherit] fixed z-50 rounded-md',
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
};
