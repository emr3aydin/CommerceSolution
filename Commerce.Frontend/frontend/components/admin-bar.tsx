"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Card, CardBody } from "@heroui/card";
import { Badge } from "@heroui/badge";
import NextLink from "next/link";
import { 
  SettingsIcon, 
  UserIcon, 
  ShoppingCartIcon, 
  ChartBarIcon,
  TagIcon,
  ClipboardListIcon
} from "@/components/icons";

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export const AdminBar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo && userInfo !== 'undefined') {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('localStorage error:', error);
      }
    }
  }, [mounted]);

  // Admin değilse hiçbir şey gösterme
  if (!mounted || !user || !user.roles?.includes('Admin')) {
    return null;
  }

  const adminMenuItems = [
    { 
      name: "Dashboard", 
      href: "/admin/dashboard", 
      icon: <ChartBarIcon className="w-4 h-4" />,
      color: "primary" 
    },
    { 
      name: "Kullanıcılar", 
      href: "/admin/users", 
      icon: <UserIcon className="w-4 h-4" />,
      color: "secondary" 
    },
    { 
      name: "Ürünler", 
      href: "/admin/products", 
      icon: <ShoppingCartIcon className="w-4 h-4" />,
      color: "success" 
    },
    { 
      name: "Kategoriler", 
      href: "/admin/categories", 
      icon: <TagIcon className="w-4 h-4" />,
      color: "warning" 
    },
    { 
      name: "Siparişler", 
      href: "/admin/orders", 
      icon: <ClipboardListIcon className="w-4 h-4" />,
      color: "danger" 
    },
    { 
      name: "Ayarlar", 
      href: "/admin/settings", 
      icon: <SettingsIcon className="w-4 h-4" />,
      color: "default" 
    }
  ];

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg border-b border-purple-300/20">
      <div className="container mx-auto max-w-7xl px-6">
        <Card className="bg-transparent shadow-none border-none">
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge content="Admin" color="warning" variant="solid">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold text-sm">
                      Yönetici Paneli
                    </span>
                  </div>
                </Badge>
                <span className="text-white/80 text-sm hidden sm:block">
                  Hoş geldin, {user.firstName} {user.lastName}
                </span>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto">
                {adminMenuItems.map((item) => (
                  <Button
                    key={item.name}
                    as={NextLink}
                    href={item.href}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 min-w-max"
                    startContent={item.icon}
                  >
                    <span className="hidden sm:inline">{item.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
