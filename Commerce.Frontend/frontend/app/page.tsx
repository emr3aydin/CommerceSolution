"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import { productAPI, categoryAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product, Category, PaginatedProductsResponse } from "@/types";
import { logAuthState } from '@/utils/auth';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { addToCart } = useCart();

  const pageSize = 12;

  useEffect(() => {
    console.log('Home page loaded - checking auth state...');
    logAuthState();
    loadCategories();
    loadInitialData();
  }, [currentPage, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.success && response.data) {
        const categoriesData = response.data as Category[];
        setCategories(categoriesData);
        console.log("Ana sayfa - kategoriler yüklendi:", categoriesData.length);
        console.log("Ana sayfa - kategoriler:", categoriesData.map(c => ({ id: c.id, name: c.name })));
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('LoadInitialData - Starting to load products for page:', currentPage);
      console.log('LoadInitialData - Selected category:', selectedCategory);

      const apiParams: any = {
        pageSize: pageSize,
        pageNumber: currentPage,
        isActive: true
      };

      // Kategori seçilmişse ekle
      if (selectedCategory !== null && selectedCategory > 0) {
        apiParams.categoryId = selectedCategory;
      }

      console.log('LoadInitialData - API params:', apiParams);

      const productsResponse = await productAPI.getAll(apiParams);
      console.log('LoadInitialData - Products API response:', productsResponse);

      if (productsResponse.success && productsResponse.data) {
        const paginatedData = productsResponse.data as PaginatedProductsResponse;
        console.log('LoadInitialData - Paginated data:', paginatedData);

        setProducts(paginatedData.data || []);
        setTotalProducts(paginatedData.totalCount);
        setTotalPages(paginatedData.totalPages);

        console.log("Ana sayfa - Backend'den pagination:", {
          itemsCount: paginatedData.data?.length || 0,
          totalCount: paginatedData.totalCount,
          totalPages: paginatedData.totalPages,
          currentPage: paginatedData.pageNumber
        });
      } else {
        console.error('LoadInitialData - API error:', productsResponse.message);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (categoryId: number | null) => {
    console.log('Category change:', { from: selectedCategory, to: categoryId });
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset sayfa numarasını
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              E-Ticaret Dünyasına Hoş Geldiniz
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              En kaliteli ürünleri keşfedin, güvenli alışveriş yapın ve hızlı teslimatın keyfini çıkarın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg"
                onPress={() => {
                  const section = document.getElementById('products-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ürünleri İncele
              </Button>
              <Button 
                size="lg"
                variant="bordered"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg"
              >
                Kategorileri Keşfet
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-sm"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-300/30 rounded-full blur-md"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalProducts}+</h3>
              <p className="text-gray-600">Kaliteli Ürün</p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Hızlı Teslimat</p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">%100</h3>
              <p className="text-gray-600">Güvenli Alışveriş</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ürünler Section */}
      <section id="products-section" className="container mx-auto px-4 py-16">
        {/* Kategori Filtreleri */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategorilerimiz</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Geniş ürün kategorilerimizden size en uygun olanları seçin ve kaliteli alışverişin keyfini çıkarın
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Chip
              size="lg"
              color={selectedCategory === null ? "primary" : "default"}
              variant={selectedCategory === null ? "solid" : "flat"}
              className="cursor-pointer px-6 py-3 text-base font-medium transition-all hover:scale-105"
              onClick={() => handleCategoryChange(null)}
            >
              🛍️ Tüm Ürünler
            </Chip>
            {categories.length === 0 && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Kategoriler yükleniyor...</span>
              </div>
            )}
            {categories.map((category) => (
              <Chip
                key={category.id}
                size="lg"
                color={selectedCategory === category.id ? "primary" : "default"}
                variant={selectedCategory === category.id ? "solid" : "flat"}
                className="cursor-pointer px-6 py-3 text-base font-medium transition-all hover:scale-105"
                onClick={() => handleCategoryChange(category.id)}
              >
                📦 {category.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">
            {selectedCategory === null
              ? "⭐ Öne Çıkan Ürünler"
              : `📋 ${categories.find(c => c.id === selectedCategory)?.name || "Seçili Kategori"} Ürünleri`
            }
          </h3>
          {totalProducts > 0 && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {totalProducts} ürün bulundu
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-3a3 3 0 00-3 3v-3z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Henüz ürün bulunmuyor</h4>
            <p className="text-gray-500">Bu kategoride yakında yeni ürünler eklenecek.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg cursor-pointer">
                  <NextLink href={`/products/${product.id}`}>
                    <CardBody className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.imageUrl || "/placeholder.jpg"}
                          alt={product.name}
                          className="w-full object-cover h-64 transition-transform duration-300 hover:scale-110"
                          fallbackSrc="/placeholder.jpg"
                        />
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Son {product.stock} adet!
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                              Stokta Yok
                            </span>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </NextLink>
                  <CardFooter className="flex flex-col items-start p-6">
                    <NextLink href={`/products/${product.id}`}>
                      <h4 className="font-bold text-lg mb-3 line-clamp-1 text-gray-900 hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                    </NextLink>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center w-full mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </span>
                      <Chip 
                        size="sm" 
                        color={product.stock > 0 ? "success" : "danger"}
                        variant="flat"
                        className="font-medium"
                      >
                        {product.stock > 0 ? `✅ ${product.stock} adet` : "❌ Stokta yok"}
                      </Chip>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        as={NextLink}
                        href={`/products/${product.id}`}
                        color="primary"
                        variant="bordered"
                        size="lg"
                        className="flex-1 font-semibold"
                      >
                        👁️ Detay
                      </Button>
                      <Button
                        color="primary"
                        size="lg"
                        className="flex-1 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300"
                        disabled={product.stock === 0}
                        onPress={() => handleAddToCart(product)}
                      >
                        {product.stock > 0 ? "🛒 Sepete Ekle" : "😔 Stokta Yok"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6 mt-16">
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow">
                  📊 Toplam {totalProducts} ürün • Sayfa {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    variant="bordered"
                    isDisabled={currentPage === 1}
                    onPress={() => handlePageChange(currentPage - 1)}
                    className="px-6"
                  >
                    ← Önceki
                  </Button>

                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "solid" : "light"}
                          color={currentPage === pageNum ? "primary" : "default"}
                          onPress={() => handlePageChange(pageNum)}
                          className="min-w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    size="lg"
                    variant="bordered"
                    isDisabled={currentPage === totalPages}
                    onPress={() => handlePageChange(currentPage + 1)}
                    className="px-6"
                  >
                    Sonraki →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Hemen Alışverişe Başlayın!</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Binlerce ürün arasından size en uygun olanları bulun. Güvenli ödeme ve hızlı teslimat garantisi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg"
            >
              🎯 Kategorileri Keşfet
            </Button>
            <Button 
              size="lg"
              variant="bordered"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg"
            >
              📞 İletişime Geç
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
