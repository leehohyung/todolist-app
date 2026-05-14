const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="h-4 w-4 rounded bg-bg-tertiary shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3.5 bg-bg-tertiary rounded w-2/3" />
      <div className="h-3 bg-bg-tertiary rounded w-1/3" />
    </div>
    <div className="h-5 bg-bg-tertiary rounded-full w-14 shrink-0" />
  </div>
);

const Loading = () => (
  <div className="divide-y divide-border" aria-label="로딩 중">
    {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
  </div>
);

export default Loading;
