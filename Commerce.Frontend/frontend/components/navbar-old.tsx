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
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo, ShoppingCartIcon, UserIcon } from "@/components/icons";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // Sepet öğe sayısını al (bu daha sonra context ile yönetilebilir)
    const cartCount = localStorage.getItem('cartItemCount');
    if (cartCount) {
      setCartItemCount(parseInt(cartCount));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItemCount');
    setUser(null);
    setCartItemCount(0);
    window.location.href = '/';
  };

  const menuItems = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Ürünler", href: "/products" },
    { name: "Kategoriler", href: "/categories" },
    { name: "Hakkımızda", href: "/about" },
    { name: "İletişim", href: "/contact" },
  ];

  return (
    <HeroUINavbar 
      onMenuOpenChange={setIsMenuOpen}
      className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <NextLink href="/" className="flex items-center space-x-2">
            <Logo />
            <p className="font-bold text-inherit">Commerce</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.name}>
            <NextLink
              href={item.href}
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium"
              )}
            >
              {item.name}
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        
        <NavbarItem>
          <Button
            as={NextLink}
            href="/cart"
            isIconOnly
            variant="light"
            aria-label="Sepet"
          >
            <Badge 
              content={cartItemCount > 0 ? cartItemCount.toString() : null}
              color="danger"
              size="sm"
            >
              <ShoppingCartIcon size={20} />
            </Badge>
          </Button>
        </NavbarItem>

        {user ? (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={user.firstName}
                  size="sm"
                  src={user.avatar || undefined}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profil Eylemleri" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Giriş yapıldı:</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem key="settings" as={NextLink} href="/profile">
                  Profilim
                </DropdownItem>
                <DropdownItem key="orders" as={NextLink} href="/orders">
                  Siparişlerim
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Çıkış Yap
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <NavbarItem className="hidden lg:flex">
            <Button as={NextLink} color="primary" href="/login" variant="flat">
              Giriş Yap
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <NextLink
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full"
              href={item.href}
            >
              {item.name}
            </NextLink>
          </NavbarMenuItem>
        ))}
        
        {!user && (
          <NavbarMenuItem>
            <NextLink href="/login" className="w-full text-primary">
              Giriş Yap
            </NextLink>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
