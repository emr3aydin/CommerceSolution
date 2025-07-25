"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  Badge,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from "@heroui/react";
import { ShoppingCart, Search, User, LogOut, Package, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, initializeAuth } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, initializeAuth, fetchCart]);

  const menuItems = [
    "Anasayfa",
    "Kategoriler", 
    "Ürünler",
    "Hakkımızda",
    "İletişim",
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const cartItemCount = cart?.totalItems || 0;

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      className="border-b-1 border-gray-200"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="font-bold text-inherit text-xl">
            <span className="text-primary">Commerce</span>Store
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/">
            Anasayfa
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/categories">
            Kategoriler
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/products">
            Ürünler
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/about">
            Hakkımızda
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/contact">
            İletişim
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Input
            classNames={{
              base: "max-w-full sm:max-w-[10rem] h-10",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Ürün ara..."
            size="sm"
            startContent={<Search size={18} />}
            type="search"
          />
        </NavbarItem>
        
        <NavbarItem>
          <Button
            as={Link}
            href="/cart"
            variant="light"
            isIconOnly
          >
            <Badge 
              content={cartItemCount > 0 ? cartItemCount : undefined} 
              color="danger"
              size="sm"
            >
              <ShoppingCart size={20} />
            </Badge>
          </Button>
        </NavbarItem>

        {isAuthenticated ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                size="sm"
                src="/api/placeholder/32/32"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Hoş geldiniz!</p>
              </DropdownItem>
              <DropdownItem key="orders" startContent={<Package size={16} />}>
                <Link href="/orders" className="w-full">
                  Siparişlerim
                </Link>
              </DropdownItem>
              <DropdownItem key="favorites" startContent={<Heart size={16} />}>
                Favorilerim
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger"
                startContent={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Çıkış Yap
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Button as={Link} color="primary" href="/auth/login" variant="flat">
              Giriş Yap
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={index === 0 ? "primary" : "foreground"}
              className="w-full"
              href={index === 0 ? "/" : `/${item.toLowerCase().replace('ı', 'i')}`}
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
        {!isAuthenticated && (
          <NavbarMenuItem>
            <Link
              color="primary"
              className="w-full"
              href="/auth/login"
              size="lg"
            >
              Giriş Yap
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
