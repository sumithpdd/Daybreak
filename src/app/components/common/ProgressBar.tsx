interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  showLabel = true,
  height = "md",
  animated = false,
}: ProgressBarProps) {
  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-4",
  };

  const getColor = (value: number) => {
    if (value >= 75) return "bg-green-500";
    if (value >= 50) return "bg-blue-500";
    if (value >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
      )}
      <div className={`w-full ${heightClasses[height]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${heightClasses[height]} ${getColor(progress)} ${
            animated ? "transition-all duration-500" : ""
          } rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

