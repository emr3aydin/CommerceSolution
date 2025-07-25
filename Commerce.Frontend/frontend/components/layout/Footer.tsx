"use client";

import { Link } from "@heroui/react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve açıklama */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              <span className="text-primary">Commerce</span>Store
            </h3>
            <p className="text-gray-400 text-sm">
              Modern e-ticaret deneyimi için en iyi ürünleri sizlere sunuyoruz. 
              Kaliteli hizmet ve güvenilir alışveriş için doğru adres.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          {/* Hızlı linkler */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Hızlı Linkler</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white text-sm">
                Anasayfa
              </Link>
              <Link href="/products" className="block text-gray-400 hover:text-white text-sm">
                Ürünler
              </Link>
              <Link href="/categories" className="block text-gray-400 hover:text-white text-sm">
                Kategoriler
              </Link>
              <Link href="/about" className="block text-gray-400 hover:text-white text-sm">
                Hakkımızda
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white text-sm">
                İletişim
              </Link>
            </div>
          </div>

          {/* Müşteri hizmetleri */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Müşteri Hizmetleri</h4>
            <div className="space-y-2">
              <Link href="/help" className="block text-gray-400 hover:text-white text-sm">
                Yardım Merkezi
              </Link>
              <Link href="/returns" className="block text-gray-400 hover:text-white text-sm">
                İade ve Değişim
              </Link>
              <Link href="/shipping" className="block text-gray-400 hover:text-white text-sm">
                Kargo Bilgileri
              </Link>
              <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="block text-gray-400 hover:text-white text-sm">
                Kullanım Şartları
              </Link>
            </div>
          </div>

          {/* İletişim bilgileri */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">İletişim</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">
                  İstanbul, Türkiye
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">
                  +90 (212) 555 0123
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">
                  info@commercestore.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt çizgi ve telif hakkı */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 CommerceStore. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
