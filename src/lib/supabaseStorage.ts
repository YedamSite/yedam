import { supabase } from './supabaseAuth';

const BUCKET_NAME = 'cheotnun-images';

export async function uploadImage(file: File, folder: string = 'general'): Promise<string | null> {
  if (!supabase) {
    return fallbackUpload(file);
  }

  try {
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return fallbackUpload(file);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Upload failed:', err);
    return fallbackUpload(file);
  }
}

async function fallbackUpload(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
          return;
        }
        resolve(e.target?.result as string || '');
      };
      img.onerror = () => {
        resolve(e.target?.result as string || '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export async function deleteImage(url: string): Promise<boolean> {
  if (!supabase || !url || url.startsWith('data:')) return false;

  try {
    const path = url.split(`${BUCKET_NAME}/`)[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    return !error;
  } catch {
    return false;
  }
}
