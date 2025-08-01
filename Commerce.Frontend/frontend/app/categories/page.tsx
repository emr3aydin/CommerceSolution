"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { TagIcon } from "@/components/icons";
import { categoryAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = (categoryId: number) => {
    router.push(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kategoriler</h1>
        <Chip color="primary" variant="flat">
          {categories.length} kategori
        </Chip>
      </div>

      {/* Kategori Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 w-full">
                {category.imageUrl ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder-category.jpg"
                    />
                  </div>
                ) : (
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <TagIcon className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-small text-default-500 mb-4">
                {category.description || "Açıklama bulunmuyor."}
              </p>
              <div className="flex justify-between items-center">
                <Chip 
                  size="sm" 
                  color={category.isActive ? "success" : "danger"}
                  variant="flat"
                >
                  {category.isActive ? "Aktif" : "Pasif"}
                </Chip>
                <Button
                  color="primary"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewProducts(category.id)}
                >
                  Ürünleri Gör
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <p className="text-lg text-default-500">Kategori bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
