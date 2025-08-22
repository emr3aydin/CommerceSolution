"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmail() {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }
    }, [searchParams]);

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch("https://localhost:7057/api/Auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Email: email,
                    VerificationCode: verificationCode
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage(data.message || "Email doğrulaması tamamlandı!");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setError(data.message || "Doğrulama başarısız.");
            }
        } catch (error) {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setError("Email adresi gerekli.");
            return;
        }

        setIsResending(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch("https://localhost:7057/api/Auth/resend-email-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Email: email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage(data.message || "Doğrulama kodu tekrar gönderildi!");
            } else {
                setError(data.message || "Kod gönderilirken hata oluştu.");
            }
        } catch (error) {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        📧 Email Doğrulama
                    </h1>
                    <p className="text-gray-600">
                        Email adresinize gönderilen 6 haneli doğrulama kodunu girin
                    </p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <form onSubmit={handleVerifyEmail}>
                        <CardBody className="gap-6 p-8">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                    {successMessage}
                                </div>
                            )}

                            <Input
                                type="email"
                                label="Email Adresi"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isRequired
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                                }}
                            />

                            <Input
                                type="text"
                                label="Doğrulama Kodu"
                                placeholder="6 haneli kod (örn: 123456)"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                isRequired
                                variant="bordered"
                                size="lg"
                                maxLength={6}
                                classNames={{
                                    input: "text-base text-center font-mono text-xl tracking-widest",
                                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                                }}
                            />

                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-3">
                                    Kod gelmedi mi?
                                </p>
                                <Button
                                    type="button"
                                    variant="flat"
                                    color="secondary"
                                    size="sm"
                                    onClick={handleResendCode}
                                    isLoading={isResending}
                                    disabled={isResending || !email}
                                >
                                    {isResending ? 'Gönderiliyor...' : 'Kodu Tekrar Gönder'}
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                                isLoading={isLoading}
                                disabled={isLoading || !email || !verificationCode || verificationCode.length !== 6}
                            >
                                {isLoading ? 'Doğrulanıyor...' : 'Email\'i Doğrula'}
                            </Button>

                            <div className="text-center">
                                <Link 
                                    as={NextLink} 
                                    href="/login" 
                                    color="primary"
                                    className="text-sm hover:underline"
                                >
                                    ← Giriş sayfasına dön
                                </Link>
                            </div>
                        </CardBody>
                    </form>
                </Card>
            </div>
        </div>
    );
}
