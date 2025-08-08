"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { productAPI, categoryAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product, Category } from "@/types";
import { addToast } from "@heroui/toast";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();
  
  const pageSize = 12;

  useEffect(() => {
    loadCategories();
    loadInitialData();
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.success && response.data) {
        const categoriesData = response.data as Category[];
        setCategories(categoriesData);
        
        // Kategoriler yüklendiğinde toplam ürün sayısını hesapla
        const totalProductCount = categoriesData.reduce((total: number, category: Category) => total + category.productCount, 0);
        setTotalProducts(totalProductCount);
        setTotalPages(Math.ceil(totalProductCount / pageSize));
        console.log("Ana sayfa - kategorilerden hesaplanan toplam ürün sayısı:", totalProductCount);
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('LoadInitialData - Starting to load products for page:', currentPage);
      
      try {
        console.log('LoadInitialData - Making API call to products');
        const productsResponse = await productAPI.getAll({ 
          pageSize: pageSize, 
          pageNumber: currentPage,
          isActive: true 
        });
        console.log('LoadInitialData - Products API response:', productsResponse);
        
        if (productsResponse.success && productsResponse.data) {
          const productsData = productsResponse.data as any;
          console.log('LoadInitialData - Products data:', productsData);
          
          // Backend'den paginated response geliyorsa
          if (productsData.items && Array.isArray(productsData.items)) {
            setProducts(productsData.items);
            
            // Kategorilerden toplam sayıyı al veya API'den gelen sayıyı kullan
            const totalFromCategories = categories.reduce((total: number, category: Category) => total + category.productCount, 0);
            if (totalFromCategories > 0) {
              setTotalProducts(totalFromCategories);
              setTotalPages(Math.ceil(totalFromCategories / pageSize));
              console.log("Ana sayfa - kategorilerden pagination:", {
                totalFromCategories,
                totalPages: Math.ceil(totalFromCategories / pageSize)
              });
            } else {
              // Kategoriler henüz yüklenmemişse fallback
              setTotalProducts(productsData.totalCount || 0);
              setTotalPages(productsData.totalPages || Math.ceil((productsData.totalCount || 0) / pageSize));
            }
          } else if (Array.isArray(productsData)) {
            // Backend'den direkt array geliyorsa
            setProducts(productsData);
            const totalFromCategories = categories.reduce((total: number, category: Category) => total + category.productCount, 0);
            if (totalFromCategories > 0) {
              setTotalProducts(totalFromCategories);
              setTotalPages(Math.ceil(totalFromCategories / pageSize));
            } else {
              setTotalProducts(productsData.length);
              setTotalPages(1);
            }
          } else {
            setProducts([]);
            setTotalProducts(0);
            setTotalPages(1);
          }
          
          console.log('LoadInitialData - Final products list:', products);
        }
      } catch (productError) {
        console.error("Ürünler yüklenirken hata:", productError);
        console.error('Product Error details:', {
          message: productError instanceof Error ? productError.message : 'Unknown error',
          stack: productError instanceof Error ? productError.stack : undefined,
        });
        setProducts([]);
      }
      
    } catch (error) {
      console.error("Genel veri yükleme hatası:", error);
      setProducts([]);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Öne Çıkan Ürünler</h2>
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
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  showControls
                  showShadow
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
