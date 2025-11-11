const multer = require('multer');
const supabase = require('./db');
require('dotenv').config();

// Multer memory storage yapılandırması (Supabase'e yüklemeden önce bellekte tutar)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Sadece resim dosyalarına izin ver
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  },
});

// Supabase Storage'a dosya yükleme fonksiyonu
async function uploadToSupabase(file, folder = 'hatalar') {
  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uniqueSuffix}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'hata-gorselleri')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Public URL oluştur
    const { data: urlData } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'hata-gorselleri')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Supabase Storage yükleme hatası:', error);
    throw error;
  }
}

// Supabase Storage'dan dosya silme fonksiyonu
async function deleteFromSupabase(filePath) {
  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'hata-gorselleri')
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Supabase Storage silme hatası:', error);
    throw error;
  }
}

module.exports = { upload, uploadToSupabase, deleteFromSupabase };
