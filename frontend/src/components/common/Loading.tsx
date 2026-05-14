const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-card border border-border p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="mt-1 h-5 w-5 rounded bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  </div>
);

const Loading = () => (
  <div className="flex flex-col gap-3" aria-label="로딩 중">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

export default Loading;
