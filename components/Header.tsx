'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Search, Menu, X, User, LogOut, Coins } from 'lucide-react';
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
    checkLoginStatus();
  }, []);

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkLoginStatus = async () => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      
      console.log('🔍 Header checkLoginStatus:', { userId, userEmail, userName });
      
      if (userId && userEmail && userName) {
        // 尝试从API获取用户金币数
        try {
          console.log('🔍 Fetching user profile for userId:', userId);
          const response = await fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}`);
          console.log('🔍 Profile API response status:', response.status);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('🔍 Profile API response data:', userData);
            setUser({
              id: userId,
              email: userEmail,
              name: userName,
              coins: userData.coins || 0
            });
            console.log('✅ User state updated with coins:', userData.coins);
          } else {
            console.log('❌ Profile API failed:', response.status);
            // API失败时使用默认值
            setUser({
              id: userId,
              email: userEmail,
              name: userName,
              coins: 0
            });
          }
        } catch (error) {
          console.error('❌ Profile API error:', error);
          // 网络错误时使用默认值
          setUser({
            id: userId,
            email: userEmail,
            name: userName,
            coins: 0
          });
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Browse', href: '/browse' },
    { name: 'Top Charts', href: '/top' },
    { name: 'Categories', href: '/categories' },
  ];

  const handleNavClick = (name: string) => {
    analytics.trackPageView(`/${name.toLowerCase().replace(' ', '-')}`, name);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
    setShowUserMenu(false);
    // 刷新页面以确保状态更新
    window.location.reload();
  };

  // 在客户端挂载前显示简化版本
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-red-500">
              Dramini
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-red-600 hover:bg-red-700">Sign Up</Button>
              </Link>
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
          ? 'py-2 bg-black/50 backdrop-blur-md border-b border-gray-800' 
          : 'py-4 bg-transparent'
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors"
              onClick={() => analytics.trackPageView('/', 'ShortDramini - 首页')}
            >
              Dramini
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white/80',
                    pathname === item.href 
                      ? 'text-white' 
                      : 'text-white/60'
                  )}
                  onClick={() => handleNavClick(item.name)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-semibold">{user.coins || 0}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 p-1"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Button>
                </div>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-white font-semibold">{user.name}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-white hover:bg-gray-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-white hover:bg-gray-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        My Coins
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
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700">Sign Up</Button>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800">
          <div className="px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-white hover:text-red-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="border-gray-700" />
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm">{user.coins || 0} coins</span>
                </div>
                <Link 
                  href="/profile" 
                  className="block text-white hover:text-red-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="block text-red-400 hover:text-red-300 transition-colors py-2"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  href="/login" 
                  className="block text-white hover:text-red-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/login" 
                  className="block text-white hover:text-red-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
