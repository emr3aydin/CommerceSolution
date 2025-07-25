"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Image, Chip } from "@heroui/react";
import { ArrowRight, Truck, Shield, Headphones, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";
import { useRouter } from "next/navigation";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getProducts({ pageSize: 8, isActive: true }),
          categoryService.getCategories(),
        ]);
        
        setFeaturedProducts(productsResponse);
        setCategories(categoriesResponse.filter(cat => cat.isActive).slice(0, 6));
      } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popüler Kategoriler</h2>
            <p className="text-gray-600 text-lg">İhtiyacınıza uygun kategoriyi seçin</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                isPressable
                className="hover:scale-105 transition-transform cursor-pointer"
                onPress={() => router.push(`/categories/${category.id}`)}
              >
                <CardBody className="p-4 text-center">
                  <Image
                    src={category.imageUrl || "/api/placeholder/100/100"}
                    alt={category.name}
                    className="w-16 h-16 mx-auto mb-3 rounded-lg object-cover"
                  />
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {category.productCount} ürün
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Öne Çıkan Ürünler</h2>
            <p className="text-gray-600 text-lg">En popüler ve en çok satan ürünlerimiz</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="w-full">
                  <CardBody className="p-0">
                    <div className="animate-pulse">
                      <div className="bg-gray-300 h-48 w-full"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded mb-4"></div>
                        <div className="h-6 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              color="primary" 
              variant="bordered"
              onPress={() => router.push('/products')}
              endContent={<ArrowRight size={20} />}
            >
              Tüm Ürünleri Görüntüle
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Haberdar Olun!</h2>
          <p className="text-xl mb-8 opacity-90">
            Yeni ürünler ve kampanyalardan ilk siz haberdar olun
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button color="secondary" size="lg">
              Abone Ol
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
