-- Hata Havuzu Veritabanı Şeması

-- Öğrenci Tablosu
CREATE TABLE IF NOT EXISTS ogrenciler (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    kategori VARCHAR(100) NOT NULL,
    alt_konu VARCHAR(200),
    aciklama TEXT
);

-- Hatalar Tablosu
CREATE TABLE IF NOT EXISTS hatalar (
    id SERIAL PRIMARY KEY,
    ogrenci_id INTEGER NOT NULL REFERENCES ogrenciler(id) ON DELETE CASCADE,
    konu_id INTEGER REFERENCES konular(id),
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
    id SERIAL PRIMARY KEY,
    hata_id INTEGER NOT NULL REFERENCES hatalar(id) ON DELETE CASCADE,
    cozum_metni TEXT NOT NULL,
    gorsel_url VARCHAR(500),
    gorsel_s3_key VARCHAR(500),
    olusturan VARCHAR(100),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX idx_hatalar_ogrenci ON hatalar(ogrenci_id);
CREATE INDEX idx_hatalar_konu ON hatalar(konu_id);
CREATE INDEX idx_hatalar_durum ON hatalar(durum);
CREATE INDEX idx_hatalar_tarih ON hatalar(olusturma_tarihi);
CREATE INDEX idx_cozumler_hata ON cozumler(hata_id);

-- Örnek Konu Verileri
INSERT INTO konular (kategori, alt_konu, aciklama) VALUES
('Matematik', 'Cebir', 'Denklemler ve eşitsizlikler'),
('Matematik', 'Geometri', 'Alan ve hacim hesaplamaları'),
('Matematik', 'Trigonometri', 'Sinüs, kosinüs ve tanjant'),
('Fizik', 'Hareket', 'Düz ve eğrisel hareket'),
('Fizik', 'Kuvvet', 'Newton kanunları'),
('Kimya', 'Atomlar', 'Atom yapısı ve periyodik sistem'),
('Türkçe', 'Dil Bilgisi', 'Fiiller ve isimler'),
('İngilizce', 'Grammar', 'Tenses ve zamanlar');
