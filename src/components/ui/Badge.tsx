import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  variant?: 'default' | 'outline' | 'buzzing' | 'chill' | 'dead' | 'packed';
}

function Badge({ className, variant = 'default', label, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-700 text-slate-100',
    outline: 'border border-slate-600 text-slate-300',
    buzzing: 'bg-red-500/20 text-red-300 border border-red-500/40',
    chill: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    dead: 'bg-slate-700/20 text-slate-400 border border-slate-700/40',
    packed: 'bg-pink-500/20 text-pink-300 border border-pink-500/40',
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
