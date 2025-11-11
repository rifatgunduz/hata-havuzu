# Supabase Kurulum Rehberi

Bu rehber, Hata Havuzu projesini Supabase ile kullanmak için gerekli adımları içermektedir.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) adresine gidin ve ücretsiz hesap oluşturun
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name**: hata-havuzu
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Size en yakın bölgeyi seçin (örn: Europe West)
4. "Create new project" butonuna tıklayın
5. Projeniz hazır olana kadar bekleyin (~2 dakika)

## 2. Veritabanı Tablolarını Oluşturma

### Yöntem 1: SQL Editor Kullanarak (Önerilen)

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. "New Query" butonuna tıklayın
3. Aşağıdaki SQL kodunu kopyalayıp yapıştırın:

```sql
-- Öğrenci Tablosu
CREATE TABLE IF NOT EXISTS ogrenciler (
    id BIGSERIAL PRIMARY KEY,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    okul VARCHAR(200),
    sinif VARCHAR(50),
    telefon VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktif BOOLEAN DEFAULT true
);

-- Konu Kategorileri Tablosu
CREATE TABLE IF NOT EXISTS konular (
    id BIGSERIAL PRIMARY KEY,
    kategori VARCHAR(100) NOT NULL,
    alt_konu VARCHAR(200),
    aciklama TEXT
);

-- Hatalar Tablosu
CREATE TABLE IF NOT EXISTS hatalar (
    id BIGSERIAL PRIMARY KEY,
    ogrenci_id BIGINT NOT NULL REFERENCES ogrenciler(id) ON DELETE CASCADE,
    konu_id BIGINT REFERENCES konular(id),
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    gorsel_url VARCHAR(500),
    gorsel_s3_key VARCHAR(500),
    durum VARCHAR(50) DEFAULT 'çözülmedi',
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cozum_tarihi TIMESTAMP,
    notlar TEXT
);

-- Çözümler Tablosu
CREATE TABLE IF NOT EXISTS cozumler (
    id BIGSERIAL PRIMARY KEY,
    hata_id BIGINT NOT NULL REFERENCES hatalar(id) ON DELETE CASCADE,
    cozum_metni TEXT NOT NULL,
    gorsel_url VARCHAR(500),
    gorsel_s3_key VARCHAR(500),
    olusturan VARCHAR(100),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_hatalar_ogrenci ON hatalar(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_hatalar_konu ON hatalar(konu_id);
CREATE INDEX IF NOT EXISTS idx_hatalar_durum ON hatalar(durum);
CREATE INDEX IF NOT EXISTS idx_hatalar_tarih ON hatalar(olusturma_tarihi);
CREATE INDEX IF NOT EXISTS idx_cozumler_hata ON cozumler(hata_id);

-- Örnek Konu Verileri
INSERT INTO konular (kategori, alt_konu, aciklama) VALUES
('Matematik', 'Cebir', 'Denklemler ve eşitsizlikler'),
('Matematik', 'Geometri', 'Alan ve hacim hesaplamaları'),
('Matematik', 'Trigonometri', 'Sinüs, kosinüs ve tanjant'),
('Fizik', 'Hareket', 'Düz ve eğrisel hareket'),
('Fizik', 'Kuvvet', 'Newton kanunları'),
('Kimya', 'Atomlar', 'Atom yapısı ve periyodik sistem'),
('Türkçe', 'Dil Bilgisi', 'Fiiller ve isimler'),
('İngilizce', 'Grammar', 'Tenses ve zamanlar')
ON CONFLICT DO NOTHING;
```

4. "Run" butonuna tıklayın
5. Başarılı mesajını görmelisiniz

### Yöntem 2: Table Editor Kullanarak

Table Editor'dan manuel olarak tablolar oluşturabilirsiniz, ancak SQL Editor daha hızlıdır.

## 3. Storage (Dosya Depolama) Ayarları

1. Supabase Dashboard'da **Storage** sekmesine gidin
2. "Create a new bucket" butonuna tıklayın
3. Bucket bilgilerini doldurun:
   - **Name**: `hata-gorselleri`
   - **Public bucket**: ✅ Açık (görsellere public erişim için)
4. "Create bucket" butonuna tıklayın

### Storage Politikalarını Ayarlama (Önemli!)

Görsellerin yüklenmesi ve görüntülenmesi için storage politikalarını ayarlamanız gerekir:

1. `hata-gorselleri` bucket'ına tıklayın
2. "Policies" sekmesine gidin
3. "New Policy" butonuna tıklayın

#### Upload Politikası:
```sql
-- Policy Name: Allow authenticated uploads
-- Operation: INSERT
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hata-gorselleri');
```

#### Read Politikası:
```sql
-- Policy Name: Allow public read
-- Operation: SELECT
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hata-gorselleri');
```

#### Delete Politikası:
```sql
-- Policy Name: Allow authenticated deletes
-- Operation: DELETE
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hata-gorselleri');
```

**Alternatif Basit Yöntem:** "Use a template" seçeneğinden "Allow public read access" ve "Allow authenticated uploads and deletes" şablonlarını seçebilirsiniz.

## 4. API Keys ve Environment Variables

1. Supabase Dashboard'da **Settings** > **API** sekmesine gidin
2. Aşağıdaki bilgileri not alın:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: Frontend için (güvenli, sınırlı erişim)
   - **service_role** key: Backend için (tam erişim - GİZLİ TUTUN!)

3. Backend klasöründe `.env` dosyası oluşturun:

```bash
cd backend
cp .env.example .env
```

4. `.env` dosyasını düzenleyin:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_STORAGE_BUCKET=hata-gorselleri

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (opsiyonel)
JWT_SECRET=your_jwt_secret_key_change_this
```

5. Frontend için `.env` dosyası oluşturun (opsiyonel - şu an backend üzerinden):

```bash
cd ../frontend
nano .env
```

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 5. Bağımlılıkları Yükleme ve Projeyi Başlatma

### Backend:

```bash
cd backend
npm install
npm start
```

Başarılı bağlantı mesajını görmelisiniz:
```
✓ Supabase veritabanına bağlantı başarılı
Server http://localhost:5000 adresinde çalışıyor
```

### Frontend:

```bash
cd ../frontend
npm install
npm start
```

Tarayıcınızda otomatik olarak `http://localhost:3000` açılacaktır.

## 6. Test Etme

1. **Öğrenci Ekle**: Öğrenci Kayıt sayfasından yeni bir öğrenci ekleyin
2. **Hata Ekle**: Hata Ekle sayfasından görsel ile birlikte hata ekleyin
3. **Kontrol**: Supabase Dashboard'dan verileri kontrol edin:
   - **Table Editor**: Veritabanı kayıtları
   - **Storage**: Yüklenen görseller

## Yaygın Sorunlar ve Çözümleri

### 1. "Failed to fetch" Hatası

**Sebep**: CORS veya API bağlantı sorunu

**Çözüm**:
- Backend'in çalıştığından emin olun
- `.env` dosyasındaki `SUPABASE_URL` değerini kontrol edin
- Supabase Dashboard'dan API'nin aktif olduğunu doğrulayın

### 2. "Permission denied" / "Row level security" Hatası

**Sebep**: Supabase RLS (Row Level Security) aktif

**Çözüm**:
- Geliştirme aşamasında RLS'yi kapatabilirsiniz (önerilmez)
- Veya politikaları ayarlayın (yukarıdaki adımlar 3'e bakın)

```sql
-- RLS'yi kapatmak için (sadece geliştirme):
ALTER TABLE ogrenciler DISABLE ROW LEVEL SECURITY;
ALTER TABLE konular DISABLE ROW LEVEL SECURITY;
ALTER TABLE hatalar DISABLE ROW LEVEL SECURITY;
ALTER TABLE cozumler DISABLE ROW LEVEL SECURITY;
```

### 3. "Storage bucket not found"

**Sebep**: Storage bucket oluşturulmamış

**Çözüm**:
- Adım 3'ü tekrar kontrol edin
- Bucket isminin `.env` dosyasındaki ile eşleştiğinden emin olun

### 4. "Invalid JWT" veya Authentication Hatası

**Sebep**: Yanlış API key

**Çözüm**:
- Backend'de **service_role** key kullanıldığından emin olun (anon key değil!)
- API keylerini Supabase Dashboard'dan kontrol edin

## Supabase'in Avantajları

✅ **Ücretsiz Plan**: 500MB veritabanı + 1GB storage
✅ **Otomatik API**: REST ve GraphQL API otomatik oluşturulur
✅ **Real-time**: Websocket desteği ile anlık güncellemeler
✅ **Authentication**: Kullanıcı girişi hazır (gelecekte eklenebilir)
✅ **Dashboard**: Kolay veritabanı ve dosya yönetimi
✅ **Backup**: Otomatik yedekleme
✅ **Ölçeklenebilir**: Projeniz büyüdükçe kolayca ölçeklenebilir

## Önemli Notlar

⚠️ **Güvenlik**:
- `service_role` key'i asla frontend'de kullanmayın
- `.env` dosyasını Git'e commit etmeyin (`.gitignore`'da olmalı)
- Production'da mutlaka RLS politikalarını ayarlayın

📊 **Limitler** (Ücretsiz Plan):
- 500MB veritabanı
- 1GB storage
- 2GB bant genişliği/ay
- 50MB dosya boyutu limiti (ayarlanabilir)

🚀 **Production'a Geçiş**:
- Frontend'i Vercel/Netlify'a deploy edin
- Backend'i Heroku/Railway/Render'a deploy edin
- Environment variables'ları production ortamında ayarlayın
- CORS ayarlarını production URL'leri ile güncelleyin

## Ek Kaynaklar

- 📚 [Supabase Dokümantasyonu](https://supabase.com/docs)
- 🎥 [Supabase YouTube Kanalı](https://www.youtube.com/@supabase)
- 💬 [Supabase Discord Topluluğu](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Hazırlayan**: Claude AI
**Tarih**: 2024
**Proje**: Hata Havuzu - Öğrenci Takip Sistemi
