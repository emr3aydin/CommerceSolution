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

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);

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

        // Sepet öğe sayısını al (bu daha sonra context ile yönetilebilir)
        const cartCount = localStorage.getItem('cartItemCount');
        if (cartCount && cartCount !== 'undefined') {
          setCartItemCount(parseInt(cartCount));
        }
      } catch (error) {
        console.error('localStorage error:', error);
        // localStorage hatası durumunda temizle
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cartItemCount');
      }
    }
  }, [mounted]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cartItemCount');
        setUser(null);
        setCartItemCount(0);
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
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
          <Link as={NextLink} href="/admin" color="white">Yönetim Paneli</Link>
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
                  as={NextLink}
                  href="/cart"
                  isIconOnly
                  variant="light"
                  aria-label="Sepet"
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
    </>
  );
};
