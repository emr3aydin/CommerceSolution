// Resim yükleme utility fonksiyonları

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Dosya boyutu kontrolü (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Dosya boyutu 5MB\'dan büyük olamaz');
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece resim dosyaları yüklenebilir');
    }

    // FormData oluştur
    const formData = new FormData();
    formData.append('file', file);

    // API'ye gönder
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Resim yüklenirken hata oluştu');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Resim önizleme için base64 dönüştürme
export const getImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Dosya okunurken hata oluştu'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Resim boyutlarını kontrol etme
export const validateImageDimensions = (file: File, maxWidth = 1920, maxHeight = 1080): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width <= maxWidth && img.height <= maxHeight);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
};
