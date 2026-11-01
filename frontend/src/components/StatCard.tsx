import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'rose';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend
}) => {
  const colorStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'hover:border-amber-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'hover:border-rose-200' },
  }[color];

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${colorStyles.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
