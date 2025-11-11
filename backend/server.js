const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const supabase = require('./db');
const { upload, uploadToSupabase, deleteFromSupabase } = require('./storageConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ÖĞRENCİ API ENDPOINTS ====================

// Tüm öğrencileri listele
app.get('/api/ogrenciler', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ogrenciler')
      .select('*')
      .eq('aktif', true)
      .order('kayit_tarihi', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Öğrenciler listelenirken hata oluştu' });
  }
});

// Tek bir öğrenci getir
app.get('/api/ogrenciler/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ogrenciler')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Öğrenci bulunamadı' });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Öğrenci getirilirken hata oluştu' });
  }
});

// Yeni öğrenci kaydet
app.post('/api/ogrenciler', async (req, res) => {
  try {
    const { ad, soyad, okul, sinif, telefon, email } = req.body;

    // Email kontrolü
    if (email) {
      const { data: emailCheck } = await supabase
        .from('ogrenciler')
        .select('id')
        .eq('email', email)
        .single();

      if (emailCheck) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
      }
    }

    const { data, error } = await supabase
      .from('ogrenciler')
      .insert([{ ad, soyad, okul, sinif, telefon, email }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Öğrenci kaydedilirken hata oluştu' });
  }
});

// Öğrenci güncelle
app.put('/api/ogrenciler/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ad, soyad, okul, sinif, telefon, email } = req.body;

    const { data, error } = await supabase
      .from('ogrenciler')
      .update({ ad, soyad, okul, sinif, telefon, email })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Öğrenci bulunamadı' });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Öğrenci güncellenirken hata oluştu' });
  }
});

// Öğrenci sil (soft delete)
app.delete('/api/ogrenciler/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ogrenciler')
      .update({ aktif: false })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Öğrenci başarıyla silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Öğrenci silinirken hata oluştu' });
  }
});

// ==================== KONU API ENDPOINTS ====================

// Tüm konuları listele
app.get('/api/konular', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('konular')
      .select('*')
      .order('kategori')
      .order('alt_konu');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Konular listelenirken hata oluştu' });
  }
});

// Yeni konu ekle
app.post('/api/konular', async (req, res) => {
  try {
    const { kategori, alt_konu, aciklama } = req.body;
    const { data, error } = await supabase
      .from('konular')
      .insert([{ kategori, alt_konu, aciklama }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Konu eklenirken hata oluştu' });
  }
});

// ==================== HATA API ENDPOINTS ====================

// Tüm hataları listele (filtreleme ile)
app.get('/api/hatalar', async (req, res) => {
  try {
    const { ogrenci_id, konu_id, durum, search } = req.query;

    let query = supabase
      .from('hatalar')
      .select(`
        *,
        ogrenciler!hatalar_ogrenci_id_fkey (
          ad,
          soyad
        ),
        konular!hatalar_konu_id_fkey (
          kategori,
          alt_konu
        )
      `);

    if (ogrenci_id) {
      query = query.eq('ogrenci_id', ogrenci_id);
    }

    if (konu_id) {
      query = query.eq('konu_id', konu_id);
    }

    if (durum) {
      query = query.eq('durum', durum);
    }

    if (search) {
      query = query.or(`baslik.ilike.%${search}%,aciklama.ilike.%${search}%`);
    }

    query = query.order('olusturma_tarihi', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Veriyi düzleştir (flatten) - frontend'in beklediği formata çevir
    const formattedData = data.map(hata => ({
      ...hata,
      ogrenci_ad: hata.ogrenciler?.ad,
      ogrenci_soyad: hata.ogrenciler?.soyad,
      kategori: hata.konular?.kategori,
      alt_konu: hata.konular?.alt_konu,
      ogrenciler: undefined,
      konular: undefined
    }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hatalar listelenirken hata oluştu' });
  }
});

// Tek bir hata getir
app.get('/api/hatalar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: hata, error: hataError } = await supabase
      .from('hatalar')
      .select(`
        *,
        ogrenciler!hatalar_ogrenci_id_fkey (
          ad,
          soyad
        ),
        konular!hatalar_konu_id_fkey (
          kategori,
          alt_konu
        )
      `)
      .eq('id', id)
      .single();

    if (hataError) {
      if (hataError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Hata bulunamadı' });
      }
      throw hataError;
    }

    // Çözümleri de getir
    const { data: cozumler } = await supabase
      .from('cozumler')
      .select('*')
      .eq('hata_id', id)
      .order('olusturma_tarihi', { ascending: false });

    // Veriyi düzleştir
    const formattedHata = {
      ...hata,
      ogrenci_ad: hata.ogrenciler?.ad,
      ogrenci_soyad: hata.ogrenciler?.soyad,
      kategori: hata.konular?.kategori,
      alt_konu: hata.konular?.alt_konu,
      cozumler: cozumler || [],
      ogrenciler: undefined,
      konular: undefined
    };

    res.json(formattedHata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hata getirilirken hata oluştu' });
  }
});

// Yeni hata ekle (görsel ile)
app.post('/api/hatalar', upload.single('gorsel'), async (req, res) => {
  try {
    const { ogrenci_id, konu_id, baslik, aciklama, durum } = req.body;

    let gorsel_url = null;
    let gorsel_s3_key = null;

    // Eğer dosya yüklendiyse Supabase Storage'a yükle
    if (req.file) {
      const uploadResult = await uploadToSupabase(req.file, 'hatalar');
      gorsel_url = uploadResult.url;
      gorsel_s3_key = uploadResult.path;
    }

    const { data, error } = await supabase
      .from('hatalar')
      .insert([{
        ogrenci_id,
        konu_id,
        baslik,
        aciklama,
        gorsel_url,
        gorsel_s3_key,
        durum: durum || 'çözülmedi'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hata eklenirken hata oluştu: ' + err.message });
  }
});

// Hata güncelle
app.put('/api/hatalar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { konu_id, baslik, aciklama, durum, notlar } = req.body;

    const { data, error } = await supabase
      .from('hatalar')
      .update({ konu_id, baslik, aciklama, durum, notlar })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Hata bulunamadı' });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hata güncellenirken hata oluştu' });
  }
});

// Hata durumunu güncelle
app.patch('/api/hatalar/:id/durum', async (req, res) => {
  try {
    const { id } = req.params;
    const { durum } = req.body;

    const updateData = { durum };
    if (durum === 'çözüldü') {
      updateData.cozum_tarihi = new Date().toISOString();
    } else {
      updateData.cozum_tarihi = null;
    }

    const { data, error } = await supabase
      .from('hatalar')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Hata bulunamadı' });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hata durumu güncellenirken hata oluştu' });
  }
});

// Hata sil
app.delete('/api/hatalar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Önce görseli sil
    const { data: hata } = await supabase
      .from('hatalar')
      .select('gorsel_s3_key')
      .eq('id', id)
      .single();

    if (hata?.gorsel_s3_key) {
      await deleteFromSupabase(hata.gorsel_s3_key);
    }

    const { error } = await supabase
      .from('hatalar')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Hata başarıyla silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hata silinirken hata oluştu' });
  }
});

// ==================== ÇÖZÜM API ENDPOINTS ====================

// Hataya çözüm ekle
app.post('/api/hatalar/:id/cozumler', upload.single('gorsel'), async (req, res) => {
  try {
    const { id } = req.params;
    const { cozum_metni, olusturan } = req.body;

    let gorsel_url = null;
    let gorsel_s3_key = null;

    // Eğer dosya yüklendiyse Supabase Storage'a yükle
    if (req.file) {
      const uploadResult = await uploadToSupabase(req.file, 'cozumler');
      gorsel_url = uploadResult.url;
      gorsel_s3_key = uploadResult.path;
    }

    const { data, error } = await supabase
      .from('cozumler')
      .insert([{
        hata_id: id,
        cozum_metni,
        gorsel_url,
        gorsel_s3_key,
        olusturan
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Çözüm eklenirken hata oluştu' });
  }
});

// ==================== İSTATİSTİK ENDPOINTS ====================

// Genel istatistikler
app.get('/api/istatistikler', async (req, res) => {
  try {
    const { count: toplam_ogrenci } = await supabase
      .from('ogrenciler')
      .select('*', { count: 'exact', head: true })
      .eq('aktif', true);

    const { count: toplam_hata } = await supabase
      .from('hatalar')
      .select('*', { count: 'exact', head: true });

    const { count: cozulmus_hata } = await supabase
      .from('hatalar')
      .select('*', { count: 'exact', head: true })
      .eq('durum', 'çözüldü');

    const { count: cozulmemis_hata } = await supabase
      .from('hatalar')
      .select('*', { count: 'exact', head: true })
      .eq('durum', 'çözülmedi');

    res.json({
      toplam_ogrenci: toplam_ogrenci || 0,
      toplam_hata: toplam_hata || 0,
      cozulmus_hata: cozulmus_hata || 0,
      cozulmemis_hata: cozulmemis_hata || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'İstatistikler getirilirken hata oluştu' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası oluştu' });
});

// Server başlat
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});
