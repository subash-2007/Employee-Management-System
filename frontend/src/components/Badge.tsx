import React from 'react';

interface BadgeProps {
  variant?: 'active' | 'inactive' | 'leave' | 'terminated' | 'present' | 'absent' | 'late' | 'info' | 'primary';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const variantMap: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-600/10',
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-600/10',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
    absent: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-600/10',
    leave: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-600/10',
    late: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-600/10',
    terminated: 'bg-red-100 text-red-800 border-red-200 ring-red-600/10',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-600/10',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-600/10',
  };

  const statusKey = typeof children === 'string' ? children.toLowerCase() : '';
  let chosenClass = variantMap[variant];
  if (statusKey === 'active' || statusKey === 'present') chosenClass = variantMap.active;
  else if (statusKey === 'inactive') chosenClass = variantMap.inactive;
  else if (statusKey === 'on leave' || statusKey === 'half day') chosenClass = variantMap.leave;
  else if (statusKey === 'absent' || statusKey === 'terminated') chosenClass = variantMap.absent;
  else if (statusKey === 'late') chosenClass = variantMap.late;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset ${chosenClass} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {children}
    </span>
  );
};
