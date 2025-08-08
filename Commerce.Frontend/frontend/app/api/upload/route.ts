import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir' },
        { status: 400 }
      );
    }

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `product_${timestamp}_${randomString}.${fileExtension}`;

    // Bytes array'e dönüştür
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Upload dizinini oluştur
    const uploadDir = path.join(process.cwd(), 'public/images/products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosyayı kaydet
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL'i döndür
    const imageUrl = `/images/products/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: 'Resim başarıyla yüklendi'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Resim yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
