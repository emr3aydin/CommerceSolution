"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { productAPI, categoryAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product, Category, PaginatedProductsResponse } from "@/types";

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
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('LoadInitialData - Starting to load products for page:', currentPage);

      const productsResponse = await productAPI.getAll({
        pageSize: pageSize,
        pageNumber: currentPage,
        isActive: true,
        categoryId: selectedCategory || undefined
      });
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
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Hoş Geldiniz</h1>
          <p className="text-lg text-gray-600 mb-8">
            En kaliteli ürünleri keşfedin ve online alışverişin keyfini çıkarın
          </p>
        </div>
      </section>

      {/* Ürünler Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Kategori Filtreleri */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Kategoriler</h3>
          <div className="flex flex-wrap gap-2">
            <Chip
              color={selectedCategory === null ? "primary" : "default"}
              variant={selectedCategory === null ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => handleCategoryChange(null)}
            >
              Tüm Ürünler
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                color={selectedCategory === category.id ? "primary" : "default"}
                variant={selectedCategory === category.id ? "solid" : "flat"}
                className="cursor-pointer"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory === null
              ? "Öne Çıkan Ürünler"
              : `${categories.find(c => c.id === selectedCategory)?.name || "Seçili Kategori"} Ürünleri`
            }
          </h2>
          {totalProducts > 0 && (
            <Chip color="primary" variant="flat">
              {totalProducts} ürün
            </Chip>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-lg text-gray-500">Henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-white hover:shadow-lg transition-shadow">
                  <CardBody className="p-0">
                    <Image
                      src={product.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full object-cover h-[400px] w-[400px] rounded-t-lg "
                      fallbackSrc="/placeholder.jpg"
                    />
                  </CardBody>
                  <CardFooter className="flex flex-col items-start p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center w-full mb-3">
                      <span className="text-xl font-bold text-orange-500">
                        {formatPrice(product.price)}
                      </span>
                      <Chip size="sm" color={product.stock > 0 ? "success" : "danger"}>
                        {product.stock > 0 ? `${product.stock} adet` : "Stokta yok"}
                      </Chip>
                    </div>

                    <Button
                      color="primary"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={product.stock === 0}
                      onPress={() => handleAddToCart(product)}
                    >
                      {product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Debug Info - Her zaman göster */}
            <div className="bg-gray-100 p-4 rounded-lg text-sm mb-6">
              <div>Ana Sayfa Debug Bilgileri:</div>
              <div>Toplam Ürün: {totalProducts}</div>
              <div>Sayfa Boyutu: {pageSize}</div>
              <div>Toplam Sayfa: {totalPages}</div>
              <div>Mevcut Sayfa: {currentPage}</div>
              <div>Ürün Sayısı: {products.length}</div>
              <div>Kategoriler yüklendi: {categories.length > 0 ? "Evet" : "Hayır"}</div>
              {categories.length > 0 && (
                <div>
                  Kategori Ürün Sayıları: {categories.map(cat => `${cat.name}: ${cat.productCount}`).join(", ")}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-2 mt-8">
                <div className="text-sm text-default-500">
                  Toplam {totalProducts} ürün • Sayfa {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={currentPage === 1}
                    onPress={() => handlePageChange(currentPage - 1)}
                  >
                    Önceki
                  </Button>

                  <span className="text-sm text-gray-700 px-4">
                    Sayfa {currentPage} / {totalPages}
                  </span>

                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={currentPage === totalPages}
                    onPress={() => handlePageChange(currentPage + 1)}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
