"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ChartBarIcon, UserIcon, ShoppingCartIcon, TagIcon } from "@/components/icons";

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userInfo);
        if (!parsedUser.roles?.includes('Admin')) {
          router.push('/');
          return;
        }

        setUser(parsedUser);
        
        // TODO: API'den gerçek istatistikleri çek
        setStats({
          totalUsers: 150,
          totalProducts: 45,
          totalOrders: 89,
          totalCategories: 12
        });
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Chip color="success" variant="flat">
          Admin: {user.firstName} {user.lastName}
        </Chip>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
          <CardBody className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <UserIcon className="w-8 h-8 opacity-80" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600">
          <CardBody className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Toplam Ürün</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <ShoppingCartIcon className="w-8 h-8 opacity-80" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600">
          <CardBody className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Toplam Sipariş</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 opacity-80" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600">
          <CardBody className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Toplam Kategori</p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
              <TagIcon className="w-8 h-8 opacity-80" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* İstatistik Grafikleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Aylık Satış Trendi</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Ocak</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Şubat</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Mart</span>
                  <span>76%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Nisan</span>
                  <span>88%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Kategori Performansı</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Elektronik</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Giyim</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Kitap</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Spor</span>
                  <span>82%</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Son Aktiviteler */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Son Aktiviteler</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
              <div>
                <p className="font-medium">Yeni kullanıcı kaydı</p>
                <p className="text-sm text-default-500">john.doe@example.com - 2 saat önce</p>
              </div>
              <Chip size="sm" color="success">Yeni</Chip>
            </div>
            <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
              <div>
                <p className="font-medium">Ürün güncellendi</p>
                <p className="text-sm text-default-500">iPhone 15 Pro - 4 saat önce</p>
              </div>
              <Chip size="sm" color="primary">Güncellendi</Chip>
            </div>
            <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
              <div>
                <p className="font-medium">Yeni sipariş</p>
                <p className="text-sm text-default-500">Sipariş #1234 - 6 saat önce</p>
              </div>
              <Chip size="sm" color="warning">Beklemede</Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
