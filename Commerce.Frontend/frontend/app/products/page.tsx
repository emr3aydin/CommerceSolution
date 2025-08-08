"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { ShoppingCartIcon } from "@/components/icons";
import { productAPI, categoryAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product, Category, PaginatedProductsResponse } from "@/types";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const { addToCart } = useCart();

  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    // URL parametrelerinden kategori değerini al
    const urlCategory = searchParams.get('category') || '';
    console.log('Products page - URL category parameter:', urlCategory);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.success && response.data) {
        setCategories(response.data as Category[]);
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: currentPage,
        pageSize: pageSize,
        isActive: true
      };

      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "") {
        const categoryId = parseInt(selectedCategory);
        if (categoryId > 0) {
          params.categoryId = categoryId;
        }
      }

      console.log("Products page - API params:", params);
      const response = await productAPI.getAll(params);
      console.log("Products page - API response:", response);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedProductsResponse;
        setProducts(paginatedData.data || []);
        setTotalPages(paginatedData.totalPages);

        console.log("Products page - Loaded products:", {
          count: paginatedData.data?.length || 0,
          totalPages: paginatedData.totalPages,
          totalCount: paginatedData.totalCount
        });
      } else {
        console.error("Products page - API error:", response.message);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      await addToCart(product, 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ürünler</h1>
        <Chip color="primary" variant="flat">
          {products.length} ürün
        </Chip>
      </div>

      {/* Sadece Kategori Filtresi */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <Select
            placeholder="Kategori seçin"
            selectedKeys={selectedCategory ? [selectedCategory] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              console.log('Products page - Category selection changed:', selected);
              setSelectedCategory(selected);
            }}
          >
            <SelectItem key="all">Tüm Kategoriler</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Ürün Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-full">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-default-200 rounded-lg flex items-center justify-center">
                    <span className="text-default-500">Resim Yok</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-small text-default-500 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  <Chip size="sm" color="secondary" variant="flat">
                    {product.categoryName}
                  </Chip>
                  <Chip size="sm" color={product.stock > 0 ? "success" : "danger"}>
                    {product.stock > 0 ? `${product.stock} adet` : "Tükendi"}
                  </Chip>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <Button
                    color="primary"
                    variant="solid"
                    size="sm"
                    startContent={<ShoppingCartIcon className="w-4 h-4" />}
                    onClick={() => handleAddToCart(product.id)}
                    isDisabled={product.stock === 0}
                  >
                    Sepete Ekle
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            variant="bordered"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            isDisabled={currentPage === 1}
          >
            Önceki
          </Button>
          <Chip variant="solid" color="primary">
            {currentPage} / {totalPages}
          </Chip>
          <Button
            variant="bordered"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            isDisabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-lg text-default-500">Ürün bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
