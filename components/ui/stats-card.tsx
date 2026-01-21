import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  status?: "success" | "warning" | "danger";
}

export function StatsCard({ title, value, description, icon: Icon, trend, status }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>

          {trend && (
            <Badge
              variant={status === "success" ? "success" : status === "danger" ? "danger" : "warning"}
              size="sm"
            >
              {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
