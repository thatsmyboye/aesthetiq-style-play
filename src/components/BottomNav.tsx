import { NavLink } from 'react-router-dom';
import { Sparkles, User, ShoppingBag, Store, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/play', label: 'Play', icon: Sparkles },
  { path: '/decks', label: 'Decks', icon: Layers },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/shop', label: 'Shop', icon: ShoppingBag },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-nav-background border-t border-nav-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-18">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all',
                  'text-nav-icon hover:text-nav-icon-active',
                  isActive && 'text-nav-icon-active bg-secondary/30'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('w-6 h-6 transition-transform', isActive && 'scale-110')}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
