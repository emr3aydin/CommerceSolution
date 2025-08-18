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
    setMounted(true);
  }, []);

  useEffect(() => {
    // Sadece mount edildikten sonra localStorage'a eriş
    if (mounted && typeof window !== 'undefined') {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo && userInfo !== 'undefined') {
          setUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error('localStorage error:', error);
        // localStorage hatası durumunda temizle
        localStorage.removeItem('userInfo');
      }
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
