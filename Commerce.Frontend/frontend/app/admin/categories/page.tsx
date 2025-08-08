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
import { uploadImage, getImagePreview } from "@/lib/imageUpload";
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

  // Resim yükleme state'leri
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

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
      const response = await categoryAPI.getAll();
      if (response.success && response.data && Array.isArray(response.data)) {
        let filteredCategories = response.data;
        
        if (searchTerm) {
          filteredCategories = response.data.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setCategories(filteredCategories);
      }
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

      const response = await categoryAPI.create(categoryData);
      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        loadCategories();
        alert(response.message || "Kategori başarıyla oluşturuldu!");
      } else {
        alert(response.message || "Kategori oluşturulurken bir hata oluştu.");
      }
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

      const response = await categoryAPI.update(categoryData);
      if (response.success) {
        setEditingCategory(null);
        resetForm();
        setShowCreateForm(false);
        loadCategories();
        alert(response.message || "Kategori başarıyla güncellendi!");
      } else {
        alert(response.message || "Kategori güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kategori güncellenirken hata:", error);
      alert("Kategori güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      try {
        const response = await categoryAPI.delete(categoryId);
        if (response.success) {
          loadCategories();
          alert(response.message || "Kategori başarıyla silindi!");
        } else {
          alert(response.message || "Kategori silinirken bir hata oluştu.");
        }
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
      imageUrl: category.imageUrl || "",
      isActive: category.isActive
    });
    setShowCreateForm(true);
    // Mevcut resim varsa önizleme olarak göster
    if (category.imageUrl) {
      setImagePreview("");
      setSelectedFile(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true
    });
    setEditingCategory(null);
    setSelectedFile(null);
    setImagePreview("");
    setUploadingImage(false);
  };

  // Resim dosyası seçildiğinde
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Dosya boyutu kontrolü (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan büyük olamaz');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir');
        return;
      }

      setSelectedFile(file);
      
      // Önizleme oluştur
      const preview = await getImagePreview(file);
      setImagePreview(preview);

    } catch (error) {
      console.error('Dosya seçim hatası:', error);
      alert('Dosya seçilirken hata oluştu');
    }
  };

  // Resmi yükle
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(selectedFile);
      
      setFormData({ ...formData, imageUrl });
      alert('Resim başarıyla yüklendi!');
      
      // Dosya seçimini temizle ama preview'ı koru
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Resim yükleme hatası:', error);
      alert(error.message || 'Resim yüklenirken hata oluştu');
    } finally {
      setUploadingImage(false);
    }
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
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Kategori Resmi</label>
                  
                  {/* Resim Önizleme */}
                  {(imagePreview || formData.imageUrl) && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || formData.imageUrl}
                        alt="Kategori resmi"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Dosya Seçme */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="category-image-upload"
                    />
                    <label
                      htmlFor="category-image-upload"
                      className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Resim Seç
                    </label>
                    
                    {selectedFile && (
                      <Button
                        size="sm"
                        color="primary"
                        onClick={handleImageUpload}
                        isLoading={uploadingImage}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Yükleniyor...' : 'Yükle'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Manuel URL Girişi */}
                  <Input
                    label="Veya resim URL'si girin"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      if (e.target.value) {
                        setImagePreview("");
                        setSelectedFile(null);
                      }
                    }}
                    size="sm"
                  />
                </div>
              </div>
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
              <div className="w-full h-32 rounded-lg flex items-center justify-center overflow-hidden">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
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
