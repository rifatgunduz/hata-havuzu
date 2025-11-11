# Hata Havuzu - Kurulum Rehberi

## Adım 1: PostgreSQL Kurulumu ve Veritabanı Oluşturma

### macOS için PostgreSQL Kurulumu

```bash
# Homebrew ile PostgreSQL kur (yoksa)
brew install postgresql@14

# PostgreSQL'i başlat
brew services start postgresql@14
```

### Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
psql postgres

# Veritabanı oluştur
CREATE DATABASE hata_havuzu;

# Veritabanından çık
\q
```

### Veritabanı Şemasını Yükle

```bash
# Proje dizinine git
cd ~/Desktop/claude/hata-havuzu

# Şemayı yükle
psql hata_havuzu < backend/database.sql
```

## Adım 2: Backend Konfigürasyonu

Backend `.env` dosyası zaten oluşturuldu. PostgreSQL şifrenizi değiştirmeniz gerekiyorsa:

```bash
# Backend dizinine git
cd backend

# .env dosyasını düzenle
nano .env
```

`DB_PASSWORD` satırını kendi PostgreSQL şifrenizle güncelleyin.

## Adım 3: Uygulamayı Başlatma

### Terminal 1 - Backend Başlat

```bash
cd ~/Desktop/claude/hata-havuzu/backend
npm start
```

Backend şu adreste çalışacak: `http://localhost:5000`

### Terminal 2 - Frontend Başlat

```bash
cd ~/Desktop/claude/hata-havuzu/frontend
npm start
```

Frontend şu adreste çalışacak: `http://localhost:3000`

Tarayıcınız otomatik olarak açılacak. Açılmazsa manuel olarak `http://localhost:3000` adresine gidin.

## Adım 4: İlk Kullanım

1. **Dashboard** sayfasında sistemi görüntüleyin
2. **Öğrenci Kayıt** sayfasından ilk öğrencinizi ekleyin
3. **Hata Ekle** sayfasından örnek bir hata ekleyin
4. **Hata Listesi** sayfasından hataları görüntüleyin

## AWS S3 Kurulumu (İsteğe Bağlı)

Eğer görselleri AWS S3'te saklamak istiyorsanız:

1. AWS Console'dan S3 bucket oluşturun
2. IAM kullanıcısı oluşturup S3 erişim izni verin
3. Access Key ve Secret Key'i `.env` dosyasına ekleyin:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_BUCKET_NAME=your-bucket-name
```

## Sorun Giderme

### PostgreSQL bağlantı hatası
- PostgreSQL'in çalıştığından emin olun: `brew services list`
- Şifrenizi kontrol edin
- Port numarasını kontrol edin (varsayılan: 5432)

### Frontend çalışmıyor
- `npm install` komutunu çalıştırdığınızdan emin olun
- Port 3000'in başka bir uygulama tarafından kullanılmadığını kontrol edin

### Backend çalışmıyor
- `npm install` komutunu çalıştırdığınızdan emin olun
- `.env` dosyasının doğru yapılandırıldığından emin olun
- Veritabanı şemasının yüklendiğinden emin olun

## Geliştirme Modu

Backend'i otomatik yeniden başlatma ile çalıştırmak için:

```bash
# Backend dizininde
npm install -g nodemon
npm run dev
```

## Test Verisi Ekleme

Veritabanı şeması otomatik olarak bazı örnek konular ekler. Daha fazla test verisi için:

```sql
-- PostgreSQL'e bağlan
psql hata_havuzu

-- Örnek öğrenci ekle
INSERT INTO ogrenciler (ad, soyad, okul, sinif, email)
VALUES ('Ahmet', 'Yılmaz', 'İstanbul Lisesi', '10-A', 'ahmet@example.com');
```

## Faydalı Komutlar

```bash
# Tüm tabloları görüntüle
psql hata_havuzu -c "\dt"

# Öğrencileri listele
psql hata_havuzu -c "SELECT * FROM ogrenciler;"

# Hataları listele
psql hata_havuzu -c "SELECT * FROM hatalar;"
```

---

**Başarılar!** Herhangi bir sorun yaşarsanız README.md dosyasına bakın veya hata mesajlarını kontrol edin.
