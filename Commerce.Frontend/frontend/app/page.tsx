"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Image, Chip } from "@heroui/react";
import { ArrowRight, Truck, Shield, Headphones } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Modern E-Ticaret Deneyimi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              En kaliteli ürünleri en uygun fiyatlarla keşfedin
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                color="secondary"
                onPress={() => router.push('/products')}
                endContent={<ArrowRight size={20} />}
              >
                Alışverişe Başla
              </Button>
              <Button 
                size="lg" 
                variant="bordered" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onPress={() => router.push('/categories')}
              >
                Kategorileri Keşfet
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ücretsiz Kargo</h3>
              <p className="text-gray-600">200 TL ve üzeri alışverişlerde ücretsiz kargo</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">256-bit SSL şifreleme ile güvenli ödeme</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">7/24 Destek</h3>
              <p className="text-gray-600">Müşteri hizmetlerimiz her zaman yanınızda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">CommerceStore'a Hoş Geldiniz</h2>
            <p className="text-gray-600 text-lg mb-8">
              Modern e-ticaret deneyimi için tasarlandı. HeroUI ile güçlendirildi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card isPressable className="hover:scale-105 transition-transform">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">Mobil Uyumlu</h3>
                  <p className="text-sm text-gray-600">Tüm cihazlarda mükemmel deneyim</p>
                </CardBody>
              </Card>
              
              <Card isPressable className="hover:scale-105 transition-transform">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="font-semibold mb-2">Hızlı ve Modern</h3>
                  <p className="text-sm text-gray-600">Next.js 15 ile yüksek performans</p>
                </CardBody>
              </Card>
              
              <Card isPressable className="hover:scale-105 transition-transform">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="font-semibold mb-2">Güzel Tasarım</h3>
                  <p className="text-sm text-gray-600">HeroUI ile modern arayüz</p>
                </CardBody>
              </Card>
              
              <Card isPressable className="hover:scale-105 transition-transform">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="font-semibold mb-2">Güvenli</h3>
                  <p className="text-sm text-gray-600">En yüksek güvenlik standartları</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın!</h2>
          <p className="text-xl mb-8 opacity-90">
            E-ticaret deneyiminizi yeni seviyeye taşıyın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              color="secondary" 
              size="lg"
              onPress={() => router.push('/products')}
            >
              Ürünleri İncele
            </Button>
            <Button 
              variant="bordered" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onPress={() => router.push('/auth/register')}
            >
              Ücretsiz Kayıt Ol
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
