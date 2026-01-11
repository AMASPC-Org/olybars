import { NavLink } from 'react-router-dom';
import { Zap, Map, Trophy, Key } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { to: '/', text: 'Buzz', icon: Zap },
  { to: '/back-room', text: 'Back Room', icon: Key },
  { to: '/map', text: 'Map', icon: Map },
  { to: '/league', text: 'League', icon: Trophy },
];

const BottomNav = () => {
  const activeLink = 'text-amber-400';
  const inactiveLink = 'text-slate-500';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto h-16 max-w-md border-t border-slate-800 bg-slate-900">
      <div className="flex h-full items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              twMerge(
                'flex h-full w-full flex-col items-center justify-center gap-1 text-xs',
                isActive ? activeLink : inactiveLink
              )
            }
          >
            <item.icon size={24} />
            <span>{item.text}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
