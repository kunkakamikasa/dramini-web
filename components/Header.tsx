'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // 确保组件在客户端挂载后再访问localStorage
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse user data');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Browse', href: '/browse' },
    { name: 'Top Charts', href: '/top' },
    { name: 'Categories', href: '/categories' },
  ];

  const handleNavClick = (name: string) => {
    analytics.pageView(`/${name.toLowerCase().replace(' ', '-')}`);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setShowUserMenu(false);
  };

  // 在客户端挂载前显示简化版本
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              Dramini
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'py-2 bg-black/50 backdrop-blur-md border-b border-border' 
          : 'py-4 bg-transparent'
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
              onClick={() => analytics.pageView('/')}
            >
              Dramini
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-foreground/80',
                    pathname === item.href 
                      ? 'text-foreground' 
                      : 'text-foreground/60'
                  )}
                  onClick={() => handleNavClick(item.name)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-300">
                    {user.coins || 0} 🪙
                  </div>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-white">{user.name || 'User'}</span>
                  </Button>
                </div>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/account" 
                        className="flex items-center px-4 py-2 text-white hover:bg-gray-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Account
                      </Link>
                      <Link 
                        href="/coins" 
                        className="flex items-center px-4 py-2 text-white hover:bg-gray-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        🪙 Buy Coins
                      </Link>
                      <hr className="border-gray-700 my-1" />
                      <button
                        className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-800"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
