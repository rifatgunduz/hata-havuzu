# Hata Havuzu - Öğrenci Hata Takip Sistemi

Öğrencilerin yaptığı hataları kaydetmek, takip etmek ve çözmek için geliştirilmiş modern, serverless web uygulaması.

## 🚀 Özellikler

- **Öğrenci Yönetimi**: Öğrenci kayıt ve bilgi yönetimi
- **Hata Kayıt**: Ekran görüntüsü ile hata ekleme
- **Hata Listesi**: Filtreleme, arama ve detaylı görüntüleme
- **Dashboard**: İstatistikler ve genel bakış
- **Cloud Storage**: Supabase Storage ile görsel saklama
- **Serverless**: Backend'siz, tamamen Supabase API kullanımı
- **Responsive Design**: Mobil uyumlu modern arayüz

## 📋 Teknolojiler

### Frontend
- React 18 (TypeScript)
- Material-UI (MUI)
- React Router
- Supabase JS Client

### Backend & Database
- Supabase (PostgreSQL + Storage + API)
- Serverless - Backend kodu yok!

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v16+)
- Supabase Hesabı (Ücretsiz)

### 1. Supabase Kurulumu

Detaylı kurulum için `SUPABASE_SETUP.md` dosyasına bakın.

**Hızlı Başlangıç:**
1. [Supabase](https://supabase.com)'de ücretsiz hesap oluşturun
2. Yeni proje oluşturun
3. SQL Editor'dan `backend/database.sql` dosyasını çalıştırın
4. Storage'da `hata-gorselleri` bucket'ı oluşturun (public)
5. RLS'yi devre dışı bırakın:
```sql
ALTER TABLE ogrenciler DISABLE ROW LEVEL SECURITY;
ALTER TABLE konular DISABLE ROW LEVEL SECURITY;
ALTER TABLE hatalar DISABLE ROW LEVEL SECURITY;
ALTER TABLE cozumler DISABLE ROW LEVEL SECURITY;
```
6. API Keys'leri kopyalayın

### 2. Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Frontend'i başlatın:

```bash
npm start
```

Frontend varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## 🌐 Deployment (Vercel)

### Otomatik Deployment

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com)'e gidin
3. "Import Project" seçin
4. GitHub repository'nizi seçin
5. Root directory: `frontend`
6. Environment Variables ekleyin:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
7. Deploy!

### Manuel Deployment

```bash
cd frontend
npm run build
npx vercel --prod
```

## 📖 API Kullanımı

Bu proje backend API kullanmaz. Tüm işlemler frontend'den direkt Supabase'e yapılır:

- **Database**: Supabase PostgreSQL API
- **Storage**: Supabase Storage API
- **Auth**: Supabase Auth (opsiyonel - gelecekte eklenebilir)

## 🎨 Kullanım

1. **Dashboard**: Ana sayfada genel istatistikleri görüntüleyin
2. **Öğrenci Kayıt**: Yeni öğrenci ekleyin
3. **Hata Ekle**: Öğrenci seçin, ekran görüntüsü yükleyin ve hatayı kaydedin
4. **Hata Listesi**: Tüm hataları görüntüleyin, filtreleyin ve yönetin

## 🔐 Güvenlik

- Dosya yükleme için boyut sınırı (5MB)
- Sadece resim dosyalarına izin verilir
- Supabase RLS (Row Level Security) - Production için aktif edilmeli
- Environment variables ile hassas bilgi saklama

## 📝 Veritabanı Şeması

- **ogrenciler**: Öğrenci bilgileri
- **konular**: Konu kategorileri
- **hatalar**: Hata kayıtları
- **cozumler**: Hata çözümleri

## 📊 Proje Mimarisi

```
┌─────────────┐
│   Vercel    │  ← Frontend (React)
│  (Frontend) │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│        Supabase             │
│  ┌─────────────────────┐   │
│  │   PostgreSQL DB     │   │
│  │   (ogrenciler,      │   │
│  │    hatalar, etc.)   │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │   Storage (S3-like) │   │
│  │   (hata-gorselleri) │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │   Auto REST API     │   │
│  │   (otomatik)        │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

## 📚 Dokümantasyon

- **`SUPABASE_SETUP.md`**: Detaylı Supabase kurulum rehberi
- **`SUPABASE_MIGRATION.md`**: Backend'den Supabase'e geçiş raporu
- **`PROJE_OZETI.md`**: Proje özeti ve özellikler

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

ISC

## 🐛 Sorun Bildirme

Sorunları GitHub Issues üzerinden bildirebilirsiniz.

## 🎯 Roadmap

- [ ] Kullanıcı girişi ve yetkilendirme (Supabase Auth)
- [ ] RLS politikaları (Production için)
- [ ] Öğrenci paneli (kendi hatalarını görme)
- [ ] Email bildirimleri
- [ ] Raporlama ve dışa aktarma
- [ ] Mobil uygulama (React Native)

## 📧 İletişim

Sorularınız için GitHub Issues

---

**Not**: Bu proje Supabase'in ücretsiz planı ile çalışır. Production ortamına deploy etmeden önce RLS politikalarını aktif edin ve güvenlik ayarlarını gözden geçirin.

## 🌟 Demo

**Live Demo**: [Vercel URL buraya gelecek]

**Supabase Project**: `hata-havuzu`

---

**Geliştirme Tarihi**: 2024
**Durum**: Production Ready
**Versiyon**: 2.0.0 (Serverless)
