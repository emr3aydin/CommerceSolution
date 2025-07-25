"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  CardBody,
  Chip,
  Select,
  SelectItem,
  Pagination,
} from "@heroui/react";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const pageSize = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData.filter(cat => cat.isActive));
    } catch (error) {
      console.error("Kategoriler yüklenirken hata oluştu:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize,
        isActive: true,
        ...(selectedCategory && { categoryId: parseInt(selectedCategory) }),
        ...(searchTerm && { searchTerm }),
      };
      
      const productsData = await productService.getProducts(params);
      setProducts(productsData);
      
      // API'den toplam sayfa sayısı gelmiyor, tahmini hesaplama
      setTotalPages(Math.ceil(productsData.length / pageSize) || 1);
    } catch (error) {
      console.error("Ürünler yüklenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Ürünler</h1>
            <p className="text-gray-600">
              Geniş ürün yelpazemizden size en uygun olanları keşfedin
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:w-1/4">
              <Card className="sticky top-4">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filtreler</h3>
                    <Button size="sm" variant="light" onPress={clearFilters}>
                      Temizle
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ürün Ara
                      </label>
                      <Input
                        placeholder="Ürün adı..."
                        startContent={<Search size={18} />}
                        value={searchTerm}
                        onValueChange={handleSearch}
                        size="sm"
                      />
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Kategori
                      </label>
                      <Select
                        placeholder="Kategori seçin"
                        size="sm"
                        selectedKeys={selectedCategory ? [selectedCategory] : []}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0] as string;
                          handleCategoryChange(value || "");
                        }}
                      >
                        {categories.map((category) => (
                          <SelectItem key={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Active Filters */}
                    {(searchTerm || selectedCategory) && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Aktif Filtreler
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {searchTerm && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="primary"
                              onClose={() => setSearchTerm("")}
                            >
                              Arama: {searchTerm}
                            </Chip>
                          )}
                          {selectedCategory && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="secondary"
                              onClose={() => setSelectedCategory("")}
                            >
                              {categories.find(c => c.id.toString() === selectedCategory)?.name}
                            </Chip>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {products.length} ürün gösteriliyor
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === "grid" ? "solid" : "light"}
                      isIconOnly
                      onPress={() => setViewMode("grid")}
                    >
                      <Grid3X3 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "list" ? "solid" : "light"}
                      isIconOnly
                      onPress={() => setViewMode("list")}
                    >
                      <List size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
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
              ) : products.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                      : "grid-cols-1"
                  }`}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination
                        total={totalPages}
                        page={currentPage}
                        onChange={setCurrentPage}
                        showControls
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ürün bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Arama kriterlerinize uygun ürün bulunamadı.
                  </p>
                  <Button color="primary" onPress={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
