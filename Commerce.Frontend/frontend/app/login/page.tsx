"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import NextLink from "next/link";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authAPI.login({ email, password });

            console.log('Login response:', response);

            if (response.success && response.data) {
                // Token'ı response.data'dan al (API response yapısına göre)
                const token = (response.data as any).token || (response.data as any).Token || (response.data as string);
                if (token) {
                    localStorage.setItem('authToken', token);

                    // Kullanıcı bilgilerini al
                    try {
                        const userResponse = await authAPI.getCurrentUser();
                        console.log('User info:', userResponse);
                        if (userResponse.success && userResponse.data) {
                            localStorage.setItem('userInfo', JSON.stringify(userResponse.data));
                        }
                    } catch (userError) {
                        console.error('User info fetch error:', userError);
                        // Fallback kullanıcı bilgisi
                        const userInfo = {
                            email: email,
                            firstName: 'Kullanıcı',
                            lastName: '',
                            roles: ['Customer']
                        };
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    }

                    // Ana sayfaya yönlendir
                    window.location.href = '/';
                } else {
                    setError('Giriş başarısız. Token alınamadı.');
                }
            } else {
                setError(response.message || 'Giriş başarısız.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-8">
            <Card className="max-w-md w-full mx-4">
                <CardHeader className="flex flex-col gap-3 text-center">
                    <h1 className="text-2xl font-bold">Giriş Yap</h1>
                    <p className="text-sm text-gray-600">Hesabınıza giriş yapın</p>
                </CardHeader>

                <form onSubmit={handleLogin}>
                    <CardBody className="gap-4">
                        {error && (
                            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <Input
                            type="text"
                            label="E-posta veya Kullanıcı Adı"
                            placeholder="E-posta adresinizi veya kullanıcı adınızı girin"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isRequired
                            variant="bordered"
                        />

                        <Input
                            label="Şifre"
                            placeholder="Şifrenizi girin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            endContent={
                                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                    {isVisible ? (
                                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                            type={isVisible ? "text" : "password"}
                            isRequired
                            variant="bordered"
                        />
                    </CardBody>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            color="primary"
                            className="w-full"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Giriş Yap
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Hesabınız yok mu?{" "}
                                <Link as={NextLink} href="/register" color="primary">
                                    Kayıt olun
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
