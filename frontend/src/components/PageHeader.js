import { cn } from "./utils";

// Reusable page header component for consistent styling across pages
function PageHeader({ title, description, children, className, ...props }) {
  return (
    <div 
      className={cn(
        "flex pt-4 pb-4 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", 
        className
      )}
      {...props}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

export { PageHeader };