"use client";

import { useState, useEffect } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo, ShoppingCartIcon } from "@/components/icons";
import { CartPreview } from "@/components/cart-preview";
import { useCart } from "@/contexts/CartContext";
import { authAPI } from "@/lib/api";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const { getTotalItems, items } = useCart();

  // Sepet değişikliklerini dinle
  useEffect(() => {
    if (mounted) {
      setCartItemCount(getTotalItems());
    }
  }, [items, mounted, getTotalItems]); // items array'ini direkt dinle

  useEffect(() => {
    console.log('🏗️ Navbar: Component mounted, setting mounted to true');
    setMounted(true);
  }, []);

  useEffect(() => {
    // Sadece mount edildikten sonra localStorage'a eriş
    console.log('⚙️ Navbar: Second useEffect triggered, mounted:', mounted);
    if (mounted && typeof window !== 'undefined') {
      console.log('✅ Navbar: Setting up event listeners and initial check');
      const checkUserInfo = () => {
        console.log('🔍 Navbar: checkUserInfo called');
        try {
          const userInfo = localStorage.getItem('userInfo');
          const accessToken = localStorage.getItem('accessToken');
          
          console.log('🔍 Navbar auth state:', { 
            hasUserInfo: !!userInfo, 
            hasAccessToken: !!accessToken,
            currentUser: user?.firstName || 'none'
          });
          
          if (userInfo && userInfo !== 'undefined' && accessToken) {
            const parsedUser = JSON.parse(userInfo);
            console.log('✅ Navbar: Setting user to:', parsedUser.firstName);
            setUser(parsedUser);
          } else {
            console.log('❌ Navbar: Clearing user');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Navbar localStorage error:', error);
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      };

      // İlk yükleme
      console.log('🎯 Navbar: Calling initial checkUserInfo');
      checkUserInfo();

      // localStorage değişikliklerini dinle
      const handleStorageChange = (e: StorageEvent) => {
        console.log('📦 Navbar: Storage event detected:', e.key);
        if (e.key === 'userInfo' || e.key === 'accessToken') {
          console.log('🔄 Navbar: Auth-related storage change, checking user info...');
          checkUserInfo();
        }
      };

      // Custom event listener (same-page localStorage changes için)
      const handleCustomStorageChange = () => {
        console.log('🎯 Navbar: Custom storage change event');
        checkUserInfo();
      };

      // Force update event listener
      const handleForceUpdate = (e: any) => {
        console.log('🔄 Navbar: Force update event', e.detail);
        if (e.detail) {
          setUser(e.detail);
        } else {
          checkUserInfo();
        }
      };

      // Periyodik kontrol (fallback olarak)
      console.log('⏰ Navbar: Setting up interval check every 1000ms');
      const interval = setInterval(checkUserInfo, 1000);

      console.log('👂 Navbar: Adding event listeners');
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('userInfoChanged', handleCustomStorageChange);
      window.addEventListener('forceNavbarUpdate', handleForceUpdate);

      return () => {
        console.log('🧹 Navbar: Cleaning up event listeners and interval');
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userInfoChanged', handleCustomStorageChange);
        window.removeEventListener('forceNavbarUpdate', handleForceUpdate);
        clearInterval(interval);
      };
    } else {
      console.log('⏳ Navbar: Waiting for mount or window, mounted:', mounted, 'window:', typeof window);
    }
  }, [mounted]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Önce API'dan logout
        await authAPI.logout();
      } catch (error) {
        console.error('Logout API error:', error);
        // API hatası olsa bile local storage'ı temizle
      } finally {
        // Local storage'ı temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItemCount');
        setUser(null);
        
        // Navbar'ın güncellendiğini diğer component'lere bildir
        window.dispatchEvent(new Event('userInfoChanged'));
        
        window.location.href = '/';
      }
    }
  };

  const menuItems = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Ürünler", href: "/products" },
    { name: "Kategoriler", href: "/categories" },
    { name: "Hakkımızda", href: "/about" },
    { name: "İletişim", href: "/contact" },
    ...(process.env.NODE_ENV === 'development' ? [{ name: "API Test", href: "/api-test" }] : []),
  ];

  // Component mount edilmeden boş render et
  if (!mounted) {
    return (
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent>
          <NavbarBrand>
            <NextLink href="/" className="font-bold text-inherit flex items-center gap-2">
              <Logo />
              <span>E-Ticaret</span>
            </NextLink>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <>
      {(user?.role === 'Admin' || user?.role === 'admin') && (
        <div className="w-full bg-primary text-white text-center py-2 text-sm font-semibold">
          <Link as={NextLink} href="/admin" className="text-white">Yönetim Paneli</Link>
        </div>
      )}
      <HeroUINavbar maxWidth="xl" position="sticky" isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <NextLink href="/" className="font-bold text-inherit flex items-center gap-2">
            <Logo />
            <span>E-Ticaret</span>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              as={NextLink}
              color="foreground"
              href={item.href}
              className="w-full"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>

        {user ? (
          <>
            <NavbarItem>
              <Badge content={cartItemCount} color="danger" size="sm" showOutline={false}>
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Sepet"
                  onPress={() => setIsCartPreviewOpen(true)}
                >
                  <ShoppingCartIcon size={20} />
                </Button>
              </Badge>
            </NavbarItem>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user.firstName + " " + user.lastName}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Hoş geldin</p>
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
                </DropdownItem>
                <DropdownItem key="orders" as={NextLink} href="/orders">
                  Siparişlerim
                </DropdownItem>
                <DropdownItem key="profile_settings" as={NextLink} href="/profile">
                  Profil Ayarları
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Çıkış Yap
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link as={NextLink} href="/login">
                Giriş Yap
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={NextLink} color="primary" href="/register" variant="flat">
                Kayıt Ol
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              as={NextLink}
              color="foreground"
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {!user && (
          <>
            <NavbarMenuItem>
              <Link
                as={NextLink}
                color="primary"
                className="w-full"
                href="/login"
                size="lg"
              >
                Giriş Yap
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                as={NextLink}
                color="primary"
                className="w-full"
                href="/register"
                size="lg"
              >
                Kayıt Ol
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </HeroUINavbar>
    
    {/* Cart Preview */}
    <CartPreview 
      isOpen={isCartPreviewOpen} 
      onClose={() => setIsCartPreviewOpen(false)} 
    />
    </>
  );
};
