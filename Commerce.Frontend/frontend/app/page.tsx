"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { productAPI, categoryAPI } from "@/lib/api";
import { Product, Category } from "@/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productAPI.getAll({ pageSize: 20, isActive: true }),
        categoryAPI.getAll()
      ]);
      
      setProducts((productsData as any)?.items || (productsData as Product[]));
      setCategories(categoriesData as Category[]);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = { 
        pageSize: 20, 
        isActive: true 
      };
      
      if (searchTerm) params.searchTerm = searchTerm;
      if (selectedCategory) params.categoryId = parseInt(selectedCategory);

      const productsData = await productAPI.getAll(params);
      setProducts((productsData as any)?.items || (productsData as Product[]));
    } catch (error) {
      console.error("Arama hatası:", error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Hoş Geldiniz</h1>
        <p className="text-lg text-gray-600 mb-8">
          En kaliteli ürünleri keşfedin ve online alışverişin keyfini çıkarın
        </p>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <Input
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Select
            placeholder="Kategori seçin"
            selectedKeys={selectedCategory ? [selectedCategory] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys as Set<string>)[0] || "";
              setSelectedCategory(selected);
            }}
            className="md:w-48"
          >
            <SelectItem key="">Tüm Kategoriler</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </Select>
          <Button
            color="primary"
            onClick={handleSearch}
            className="md:w-32"
          >
            Ara
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Ürünler</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="max-w-[400px]">
                <CardBody className="p-0">
                  <Image
                    src={product.imageUrl || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="w-full object-cover h-[200px]"
                    fallbackSrc="/placeholder-product.jpg"
                  />
                </CardBody>
                <CardFooter className="flex flex-col items-start p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center w-full mb-3">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Chip size="sm" color={product.stock > 0 ? "success" : "danger"}>
                      {product.stock > 0 ? `${product.stock} adet` : "Stokta yok"}
                    </Chip>
                  </div>
                  
                  <Button
                    color="primary"
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
