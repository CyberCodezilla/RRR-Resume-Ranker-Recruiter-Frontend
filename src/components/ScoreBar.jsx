const ScoreBar = ({ segments }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      {segments.map((segment) => {
        const width = `${(segment.value / total) * 100}%`;
        return (
          <div
            key={segment.label}
            className={`${segment.color} transition-all duration-300 ease-in-out`}
            style={{ width }}
            title={`${segment.label}: ${(segment.value * 100).toFixed(0)}%`}
          />
        );
      })}
    </div>
  );
};

export default ScoreBar;
