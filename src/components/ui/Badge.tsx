import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  variant?: 'default' | 'outline' | 'lively' | 'buzzing' | 'chill';
}

function Badge({ className, variant = 'default', label, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-700 text-slate-100',
    outline: 'border border-slate-600 text-slate-300',
    lively: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    buzzing: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    chill: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  };

  const classes = twMerge(
    'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
    variantClasses[variant],
    className
  );

  return (
    <div className={classes} {...props}>
      {label}
    </div>
  );
}

export { Badge };
