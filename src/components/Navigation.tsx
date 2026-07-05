import { Hammer, Home, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe md:top-0 md:bottom-0 md:right-auto md:w-24 md:border-t-0 md:border-r md:flex md:flex-col md:justify-center">
      <div className="max-w-md mx-auto flex justify-around p-2 md:flex-col md:space-y-8 md:p-4">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl transition-colors min-w-[64px] ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          id="nav-tab-home"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </NavLink>
        <NavLink 
          to="/practice" 
          className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl transition-colors min-w-[64px] ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          id="nav-tab-practice"
        >
          <Hammer className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">Practice</span>
        </NavLink>
        <NavLink 
          to="/stats" 
          className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl transition-colors min-w-[64px] ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          id="nav-tab-profile"
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
