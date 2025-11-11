import { supabase } from '../lib/supabase';

// Öğrenci API
export const ogrenciApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('ogrenciler')
      .select('*')
      .eq('aktif', true)
      .order('kayit_tarihi', { ascending: false });

    if (error) throw error;
    return { data };
  },

  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('ogrenciler')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data };
  },

  create: async (ogrenciData: any) => {
    const { data, error } = await supabase
      .from('ogrenciler')
      .insert([ogrenciData])
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  update: async (id: number, ogrenciData: any) => {
    const { data, error } = await supabase
      .from('ogrenciler')
      .update(ogrenciData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  delete: async (id: number) => {
    const { error } = await supabase
      .from('ogrenciler')
      .update({ aktif: false })
      .eq('id', id);

    if (error) throw error;
    return { data: { message: 'Öğrenci başarıyla silindi' } };
  },
};

// Konu API
export const konuApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('konular')
      .select('*')
      .order('kategori')
      .order('alt_konu');

    if (error) throw error;
    return { data };
  },

  create: async (konuData: any) => {
    const { data, error } = await supabase
      .from('konular')
      .insert([konuData])
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  delete: async (id: number) => {
    const { error } = await supabase
      .from('konular')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: { message: 'Ders/Konu başarıyla silindi' } };
  },
};

// Storage helper - Dosya upload
const uploadFile = async (file: File, folder: string = 'hatalar') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('hata-gorselleri')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('hata-gorselleri')
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    path: fileName
  };
};

// Hata API
export const hataApi = {
  getAll: async (params?: any) => {
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

    if (params?.ogrenci_id) {
      query = query.eq('ogrenci_id', params.ogrenci_id);
    }

    if (params?.konu_id) {
      query = query.eq('konu_id', params.konu_id);
    }

    if (params?.durum) {
      query = query.eq('durum', params.durum);
    }

    if (params?.search) {
      query = query.or(`baslik.ilike.%${params.search}%,aciklama.ilike.%${params.search}%`);
    }

    query = query.order('olusturma_tarihi', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Veriyi düzleştir (flatten)
    const formattedData = data?.map((hata: any) => ({
      ...hata,
      ogrenci_ad: hata.ogrenciler?.ad,
      ogrenci_soyad: hata.ogrenciler?.soyad,
      kategori: hata.konular?.kategori,
      alt_konu: hata.konular?.alt_konu,
    })) || [];

    return { data: formattedData };
  },

  getById: async (id: number) => {
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

    if (hataError) throw hataError;

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
    };

    return { data: formattedHata };
  },

  create: async (formData: FormData) => {
    const ogrenci_id = formData.get('ogrenci_id');
    const konu_id = formData.get('konu_id');
    const baslik = formData.get('baslik');
    const aciklama = formData.get('aciklama');
    const durum = formData.get('durum') || 'çözülmedi';
    const gorselFile = formData.get('gorsel') as File;

    let gorsel_url = null;
    let gorsel_s3_key = null;

    // Eğer görsel varsa upload et
    if (gorselFile && gorselFile.size > 0) {
      const uploadResult = await uploadFile(gorselFile, 'hatalar');
      gorsel_url = uploadResult.url;
      gorsel_s3_key = uploadResult.path;
    }

    const { data, error } = await supabase
      .from('hatalar')
      .insert([{
        ogrenci_id: Number(ogrenci_id),
        konu_id: konu_id ? Number(konu_id) : null,
        baslik,
        aciklama,
        gorsel_url,
        gorsel_s3_key,
        durum
      }])
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  update: async (id: number, hataData: any) => {
    const { data, error } = await supabase
      .from('hatalar')
      .update(hataData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  updateDurum: async (id: number, durum: string) => {
    const updateData: any = { durum };
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

    if (error) throw error;
    return { data };
  },

  delete: async (id: number) => {
    // Önce görseli sil
    const { data: hata } = await supabase
      .from('hatalar')
      .select('gorsel_s3_key')
      .eq('id', id)
      .single();

    if (hata?.gorsel_s3_key) {
      await supabase.storage
        .from('hata-gorselleri')
        .remove([hata.gorsel_s3_key]);
    }

    const { error } = await supabase
      .from('hatalar')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: { message: 'Hata başarıyla silindi' } };
  },

  addCozum: async (id: number, formData: FormData) => {
    const cozum_metni = formData.get('cozum_metni');
    const olusturan = formData.get('olusturan');
    const gorselFile = formData.get('gorsel') as File;

    let gorsel_url = null;
    let gorsel_s3_key = null;

    // Eğer görsel varsa upload et
    if (gorselFile && gorselFile.size > 0) {
      const uploadResult = await uploadFile(gorselFile, 'cozumler');
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
    return { data };
  },
};

// İstatistik API
export const istatistikApi = {
  getAll: async () => {
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

    return {
      data: {
        toplam_ogrenci: toplam_ogrenci || 0,
        toplam_hata: toplam_hata || 0,
        cozulmus_hata: cozulmus_hata || 0,
        cozulmemis_hata: cozulmemis_hata || 0,
      }
    };
  },
};
