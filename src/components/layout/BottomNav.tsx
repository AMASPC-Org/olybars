import { NavLink } from 'react-router-dom';
import { Home, Map, Trophy, MoreHorizontal } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { to: '/', text: 'Buzz', icon: Home },
  { to: '/map', text: 'Map', icon: Map },
  { to: '/league', text: 'League', icon: Trophy },
  { to: '/more', text: 'More', icon: MoreHorizontal },
];

const BottomNav = () => {
  const activeLink = 'text-amber-400';
  const inactiveLink = 'text-gray-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto h-[72px] max-w-md border-t border-gray-700 bg-gray-900">
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
