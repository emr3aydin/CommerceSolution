"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import NextLink from "next/link";
import { SearchIcon, ShoppingCartIcon, UserIcon } from "@/components/icons";
import { categoryAPI, authAPI } from "@/lib/api";
import { Category } from "@/types";

export const TrendyolHeader = () => {
  const [user, setUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log('🏗️ TrendyolHeader: Component mounted, setting mounted to true');
    setMounted(true);
    loadCategories();
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const checkUserInfo = async () => {
        console.log('🔍 TrendyolHeader: checkUserInfo called');
        try {
          const userInfo = localStorage.getItem('userInfo');
          const accessToken = localStorage.getItem('accessToken');
          
          console.log('🔍 TrendyolHeader auth state:', { 
            hasUserInfo: !!userInfo, 
            hasAccessToken: !!accessToken,
            currentUser: user?.firstName || 'none'
          });
          
          if (userInfo && userInfo !== 'undefined' && accessToken) {
            const parsedUser = JSON.parse(userInfo);
            console.log('✅ TrendyolHeader: Setting user to:', parsedUser.firstName);
            setUser(parsedUser);
          } else if (accessToken && (!userInfo || userInfo === 'undefined')) {
            // Token var ama userInfo yoksa, me endpoint'inden çekmeyi dene
            console.log('🧾 TrendyolHeader: accessToken exists but userInfo missing, fetching /api/Auth/me');
            try {
              const me = await authAPI.getCurrentUser();
              if (me.success && me.data) {
                localStorage.setItem('userInfo', JSON.stringify(me.data));
                setUser(me.data);
                console.log('✅ TrendyolHeader: User info fetched and set');
              } else {
                console.warn('⚠️ TrendyolHeader: /me failed, keeping logged-out UI');
                setUser(null);
              }
            } catch (err) {
              console.warn('⚠️ TrendyolHeader: /me request error', err);
              setUser(null);
            }
          } else {
            console.log('❌ TrendyolHeader: Clearing user');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ TrendyolHeader localStorage error:', error);
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      };

      const checkCartInfo = () => {
        console.log('🛒 TrendyolHeader: checkCartInfo called');
        try {
          const cartCount = localStorage.getItem('cartItemCount');
          const newCount = cartCount && cartCount !== 'undefined' ? parseInt(cartCount) : 0;
          console.log('🛒 TrendyolHeader: Cart count:', newCount);
          setCartItemCount(newCount);
        } catch (error) {
          console.error('❌ TrendyolHeader cart localStorage error:', error);
          localStorage.removeItem('cartItemCount');
          setCartItemCount(0);
        }
      };

      // İlk yükleme
      console.log('🎯 TrendyolHeader: Calling initial checkUserInfo and checkCartInfo');
      checkUserInfo();
      checkCartInfo();

      // Event listener'ları ekle
      const handleStorageChange = (e: StorageEvent) => {
        console.log('📦 TrendyolHeader: Storage event detected:', e.key);
        if (e.key === 'userInfo' || e.key === 'accessToken') {
          console.log('🔄 TrendyolHeader: Auth-related storage change, checking user info...');
          checkUserInfo();
        } else if (e.key === 'cartItemCount') {
          console.log('🛒 TrendyolHeader: Cart-related storage change, checking cart info...');
          checkCartInfo();
        }
      };

      const handleCustomStorageChange = () => {
        console.log('🎯 TrendyolHeader: Custom storage change event');
        checkUserInfo();
      };

      const handleCartUpdate = () => {
        console.log('🛒 TrendyolHeader: Cart update event');
        checkCartInfo();
      };

      const handleForceUpdate = (e: any) => {
        console.log('🔄 TrendyolHeader: Force update event', e.detail);
        if (e.detail) {
          setUser(e.detail);
        } else {
          checkUserInfo();
        }
      };

      console.log('👂 TrendyolHeader: Adding event listeners');
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('userInfoChanged', handleCustomStorageChange);
      window.addEventListener('forceNavbarUpdate', handleForceUpdate);
      window.addEventListener('cartUpdated', handleCartUpdate);

      return () => {
        console.log('🧹 TrendyolHeader: Cleaning up event listeners');
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userInfoChanged', handleCustomStorageChange);
        window.removeEventListener('forceNavbarUpdate', handleForceUpdate);
        window.removeEventListener('cartUpdated', handleCartUpdate);
      };
    }
  }, [mounted]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.success && response.data) {
        // İlk 10 kategoriyi al
        const categoriesData = response.data as Category[];
        setCategories(categoriesData.slice(0, 10));
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        await authAPI.logout();
        setUser(null);
        setCartItemCount(0);
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        window.location.href = '/';
      }
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Next.js router kullanarak navigate et
      window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
    } else {
      window.location.href = '/products';
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="text-xl font-bold text-orange-500">E-Ticaret</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      {/* Ana Header */}
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <NextLink href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-orange-500">
              E-Ticaret
            </div>
          </NextLink>

          {/* Arama Kutusu */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Input
                placeholder="Aradığınız ürün, kategori veya markayı yazın"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                startContent={<SearchIcon className="text-gray-400" />}
                className="w-full"
                size="lg"
              />
              <Button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
                color="primary"
                size="sm"
                onClick={handleSearch}
              >
                Ara
              </Button>
            </div>
          </div>

          {/* Sağ Menü */}
          <div className="flex items-center gap-4">
            {/* Giriş Yap / Kullanıcı */}
            {user ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" className="flex items-center gap-2">
                    <Avatar
                      size="sm"
                      name={user.firstName || user.email}
                      className="w-6 h-6"
                    />
                    <span className="hidden md:inline text-sm">
                      {user.firstName || 'Kullanıcı'}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="profile" href="/profile">
                    Profilim
                  </DropdownItem>
                  <DropdownItem key="orders" href="/orders">
                    Siparişlerim
                  </DropdownItem>
                  {user.roles?.includes('Admin') && (
                    <DropdownItem key="admin" href="/admin">
                      Admin Panel
                    </DropdownItem>
                  )}
                  <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                    Çıkış Yap
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <NextLink href="/login">
                <Button variant="light" className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline">Giriş Yap</span>
                </Button>
              </NextLink>
            )}

            {/* Sepetim */}
            <NextLink href="/cart">
              <Button variant="light" className="flex items-center gap-2">
                <Badge 
                  content={cartItemCount > 0 ? cartItemCount : undefined} 
                  color="danger" 
                  size="sm"
                  className={cartItemCount > 0 ? '' : 'hidden'}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                </Badge>
                <span className="hidden md:inline">Sepetim</span>
              </Button>
            </NextLink>
          </div>
        </div>
      </div>

      {/* Kategoriler */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 h-12 overflow-x-auto">
            <NextLink 
              href="/categories" 
              className="flex-shrink-0 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
            >
              TÜM KATEGORİLER
            </NextLink>
            
            {categories.map((category) => (
              <NextLink
                key={category.id}
                href={`/products?category=${category.id}`}
                className="flex-shrink-0 text-sm text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                {category.name}
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
