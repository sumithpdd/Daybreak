import type { IOKR } from "@/redux/services/apiSlice";

interface StatusBadgeProps {
  status: IOKR["status"];
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const statusConfig: Record<IOKR["status"], { bg: string; text: string; icon: string }> = {
    "Not Started": { bg: "bg-gray-100", text: "text-gray-700", icon: "⭕" },
    "In Progress": { bg: "bg-blue-100", text: "text-blue-700", icon: "🔄" },
    "Completed": { bg: "bg-green-100", text: "text-green-700", icon: "✅" },
    "Needs Revision": { bg: "bg-orange-100", text: "text-orange-700", icon: "⚠️" },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{status.toUpperCase()}</span>
    </span>
  );
}

