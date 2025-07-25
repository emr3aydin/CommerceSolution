"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";
import { SearchIcon } from "@/components/icons";
import { categoryAPI } from "@/lib/api";
import { Category } from "@/types";

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function AdminCategoriesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user, searchTerm]);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.roles?.includes('Admin')) {
          setUser(parsedUser);
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll() as Category[];
      let filteredCategories = response;
      
      if (searchTerm) {
        filteredCategories = response.filter(category =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setCategories(filteredCategories);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      if (!formData.name) {
        alert("Lütfen kategori adını girin.");
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description || "",
        imageUrl: formData.imageUrl || "",
        isActive: formData.isActive
      };

      await categoryAPI.create(categoryData);
      setShowCreateForm(false);
      resetForm();
      loadCategories();
      alert("Kategori başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Kategori oluşturulurken hata:", error);
      alert("Kategori oluşturulurken bir hata oluştu.");
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory || !formData.name) {
        alert("Lütfen kategori adını girin.");
        return;
      }

      const categoryData = {
        id: editingCategory.id,
        name: formData.name,
        description: formData.description || "",
        imageUrl: formData.imageUrl || "",
        isActive: formData.isActive
      };

      await categoryAPI.update(categoryData);
      setEditingCategory(null);
      resetForm();
      setShowCreateForm(false);
      loadCategories();
      alert("Kategori başarıyla güncellendi!");
    } catch (error) {
      console.error("Kategori güncellenirken hata:", error);
      alert("Kategori güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      try {
        await categoryAPI.delete(categoryId);
        loadCategories();
        alert("Kategori başarıyla silindi!");
      } catch (error) {
        console.error("Kategori silinirken hata:", error);
        alert("Kategori silinirken bir hata oluştu. Bu kategoriye ait ürünler olabilir.");
      }
    }
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      imageUrl: "",
      isActive: category.isActive
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true
    });
    setEditingCategory(null);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kategori Yönetimi</h1>
        <Button
          color="primary"
          onPress={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          Yeni Kategori
        </Button>
      </div>

      {/* Arama */}
      <div className="flex gap-4">
        <Input
          placeholder="Kategori ara..."
          startContent={<SearchIcon className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Chip color="primary" variant="flat">
          {categories.length} kategori
        </Chip>
      </div>

      {/* Form */}
      {showCreateForm && (
        <Card className="p-6">
          <CardHeader>
            <h2 className="text-xl font-bold">
              {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Kategori Adı"
                placeholder="Kategori adını girin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Input
                label="Resim URL"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Açıklama"
                  placeholder="Kategori açıklamasını girin"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                >
                  Aktif Kategori
                </Switch>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                color="primary"
                onPress={editingCategory ? handleUpdateCategory : handleCreateCategory}
              >
                {editingCategory ? "Güncelle" : "Oluştur"}
              </Button>
              <Button
                variant="flat"
                onPress={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Kategoriler Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {category.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg line-clamp-2">{category.name}</h3>
                  <Chip size="sm" color={category.isActive ? "success" : "warning"}>
                    {category.isActive ? "Aktif" : "Pasif"}
                  </Chip>
                </div>
                
                {category.description && (
                  <p className="text-small text-default-500 line-clamp-3">
                    {category.description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    onPress={() => openEditForm(category)}
                    className="flex-1"
                  >
                    Düzenle
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    onPress={() => handleDeleteCategory(category.id)}
                    className="flex-1"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-lg text-default-500">
            {searchTerm ? "Arama sonucu bulunamadı." : "Henüz kategori bulunmuyor."}
          </p>
        </div>
      )}
    </div>
  );
}
