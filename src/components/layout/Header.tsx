// ============================================
// FILE: src/components/layout/Header.tsx (REDESIGNED)
// ============================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Home, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';

export const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-[hsl(var(--border))] animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="bg-[hsl(var(--accent))] p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[hsl(var(--accent-hover))]">
              <Film className="w-5 h-5 text-[hsl(var(--text-primary))]" />
            </div>
            <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] tracking-tight">
              WatchTracker
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" active={isActive('/')} icon={<Home className="w-4 h-4" />}>
              Home
            </NavLink>
            <NavLink to="/search" active={isActive('/search')} icon={<Search className="w-4 h-4" />}>
              Search
            </NavLink>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[hsl(var(--surface-hover))] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[hsl(var(--text-primary))]" />
              ) : (
                <Menu className="w-5 h-5 text-[hsl(var(--text-primary))]" />
              )}
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative group">
                  <Avatar className="h-10 w-10 bg-[hsl(var(--accent))] ring-2 ring-transparent transition-all duration-300 group-hover:ring-[hsl(var(--accent-hover))]">
                    <AvatarFallback className="bg-[hsl(var(--accent))] text-[hsl(var(--text-primary))] font-medium">
                      {user ? getInitials(user.email) : <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[hsl(var(--success))] rounded-full border-2 border-[hsl(var(--background))]"></div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-2 animate-scale-in"
              >
                <div className="px-3 py-3 border-b border-[hsl(var(--border))]">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
                    Manage your account
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))] transition-colors mt-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[hsl(var(--error))] hover:bg-[hsl(var(--error-muted))] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t border-[hsl(var(--border))] animate-slide-down">
            <div className="flex flex-col gap-2">
              <MobileNavLink 
                to="/" 
                active={isActive('/')} 
                icon={<Home className="w-4 h-4" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </MobileNavLink>
              <MobileNavLink 
                to="/search" 
                active={isActive('/search')} 
                icon={<Search className="w-4 h-4" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </MobileNavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// Desktop Nav Link Component
interface NavLinkProps {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, icon, children }) => (
  <Link to={to}>
    <button
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
        transition-all duration-300
        ${active 
          ? 'bg-[hsl(var(--accent))] text-[hsl(var(--text-primary))] shadow-sm' 
          : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]'
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </button>
  </Link>
);

// Mobile Nav Link Component
interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, active, icon, children, onClick }) => (
  <Link to={to} onClick={onClick}>
    <button
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
        transition-all duration-300
        ${active 
          ? 'bg-[hsl(var(--accent))] text-[hsl(var(--text-primary))]' 
          : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]'
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </button>
  </Link>
);