"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
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
        <h1 className="text-3xl font-bold">Yönetici Paneli</h1>
        <Chip color="success" variant="flat">
          Hoş geldin, {user.firstName}!
        </Chip>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Kullanıcı Yönetimi</h3>
          </CardHeader>
          <CardBody>
            <p className="text-small text-default-500">
              Sistemdeki tüm kullanıcıları görüntüle ve yönet
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Ürün Yönetimi</h3>
          </CardHeader>
          <CardBody>
            <p className="text-small text-default-500">
              Ürünleri ekle, düzenle ve kategorilendir
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Sipariş Yönetimi</h3>
          </CardHeader>
          <CardBody>
            <p className="text-small text-default-500">
              Siparişleri görüntüle ve durumlarını güncelle
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Kategori Yönetimi</h3>
          </CardHeader>
          <CardBody>
            <p className="text-small text-default-500">
              Ürün kategorilerini organize et
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">İstatistikler</h3>
          </CardHeader>
          <CardBody>
            <p className="text-small text-default-500">
              Satış ve kullanıcı istatistiklerini incele
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Sistem Ayarları</h3>
          </CardHeader>
          <CardBody>
            <p className="text-small text-default-500">
              Sistem konfigürasyonunu yönet
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
