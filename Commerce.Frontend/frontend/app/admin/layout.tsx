'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    roles: string[];
}
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

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

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/products', label: 'Ürünler', icon: '📦' },
        { href: '/admin/categories', label: 'Kategoriler', icon: '📁' },
        { href: '/admin/orders', label: 'Siparişler', icon: '🛒' },
        { href: '/admin/logs', label: 'Sistem Logları', icon: '📋' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Chip color="success" variant="flat">
                                {user.firstName} {user.lastName}
                            </Chip>
                            <Button
                                color="danger"
                                variant="flat"
                                size="sm"
                                onPress={() => {
                                    localStorage.removeItem('authToken');
                                    localStorage.removeItem('userInfo');
                                    router.push('/');
                                }}
                            >
                                Çıkış
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <Card>
                            <CardBody className="p-0">
                                <nav className="space-y-1">
                                    {menuItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${pathname === item.href
                                                ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
