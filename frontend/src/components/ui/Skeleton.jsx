export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const CardSkeleton = () => (
  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-10 w-full mt-4" />
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);