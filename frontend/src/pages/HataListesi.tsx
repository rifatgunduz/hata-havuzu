import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import PrintIcon from '@mui/icons-material/Print';
import { hataApi, konuApi, ogrenciApi } from '../services/api';

interface Hata {
  id: number;
  baslik: string;
  aciklama: string;
  gorsel_url: string;
  durum: string;
  olusturma_tarihi: string;
  ogrenci_ad: string;
  ogrenci_soyad: string;
  kategori: string;
  alt_konu: string;
  cozumler?: any[];
}

const HataListesi: React.FC = () => {
  const [hatalar, setHatalar] = useState<Hata[]>([]);
  const [filteredHatalar, setFilteredHatalar] = useState<Hata[]>([]);
  const [ogrenciler, setOgrenciler] = useState<any[]>([]);
  const [konular, setKonular] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [ogrenciFilter, setOgrenciFilter] = useState('');
  const [dersFilter, setDersFilter] = useState('');
  const [konuFilter, setKonuFilter] = useState('');
  const [durumFilter, setDurumFilter] = useState('');
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [selectedHata, setSelectedHata] = useState<Hata | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const filterHatalar = () => {
    let filtered = hatalar;

    if (search) {
      filtered = filtered.filter(
        (hata) =>
          hata.baslik.toLowerCase().includes(search.toLowerCase()) ||
          hata.aciklama?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (ogrenciFilter) {
      filtered = filtered.filter(
        (hata) =>
          `${hata.ogrenci_ad} ${hata.ogrenci_soyad}`.toLowerCase().includes(ogrenciFilter.toLowerCase())
      );
    }

    if (dersFilter) {
      filtered = filtered.filter((hata) => hata.kategori === dersFilter);
    }

    if (konuFilter) {
      filtered = filtered.filter((hata) => hata.alt_konu === konuFilter);
    }

    if (durumFilter) {
      filtered = filtered.filter((hata) => hata.durum === durumFilter);
    }

    if (baslangicTarihi) {
      filtered = filtered.filter((hata) => {
        const hataTarihi = new Date(hata.olusturma_tarihi);
        const baslangic = new Date(baslangicTarihi);
        return hataTarihi >= baslangic;
      });
    }

    if (bitisTarihi) {
      filtered = filtered.filter((hata) => {
        const hataTarihi = new Date(hata.olusturma_tarihi);
        const bitis = new Date(bitisTarihi);
        bitis.setHours(23, 59, 59, 999); // Günün sonuna kadar
        return hataTarihi <= bitis;
      });
    }

    setFilteredHatalar(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterHatalar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hatalar, search, ogrenciFilter, dersFilter, konuFilter, durumFilter, baslangicTarihi, bitisTarihi]);

  const fetchData = async () => {
    try {
      const [hataResponse, ogrenciResponse, konuResponse] = await Promise.all([
        hataApi.getAll(),
        ogrenciApi.getAll(),
        konuApi.getAll(),
      ]);

      setHatalar(hataResponse.data);
      setFilteredHatalar(hataResponse.data);
      setOgrenciler(ogrenciResponse.data);
      setKonular(konuResponse.data);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error(err);
    }
  };

  const handleViewDetail = async (hataId: number) => {
    try {
      const response = await hataApi.getById(hataId);
      setSelectedHata(response.data);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('Hata detayı alınırken hata:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu hatayı silmek istediğinizden emin misiniz?')) {
      try {
        await hataApi.delete(id);
        setHatalar(hatalar.filter((h) => h.id !== id));
        setDetailDialogOpen(false);
      } catch (err) {
        console.error('Hata silinirken hata:', err);
      }
    }
  };

  const handleDurumChange = async (id: number, yeniDurum: string) => {
    try {
      await hataApi.updateDurum(id, yeniDurum);
      setHatalar(
        hatalar.map((h) => (h.id === id ? { ...h, durum: yeniDurum } : h))
      );
      if (selectedHata && selectedHata.id === id) {
        setSelectedHata({ ...selectedHata, durum: yeniDurum });
      }
    } catch (err) {
      console.error('Durum güncellenirken hata:', err);
    }
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'çözüldü':
        return 'success';
      case 'inceleniyor':
        return 'warning';
      case 'çözülmedi':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setOgrenciFilter('');
    setDersFilter('');
    setKonuFilter('');
    setDurumFilter('');
    setBaslangicTarihi('');
    setBitisTarihi('');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hata Listesi - Yazdır</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
            color: #1976d2;
            margin-bottom: 30px;
          }
          .filter-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
          }
          .filter-info p {
            margin: 5px 0;
          }
          .hata-item {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            background-color: #fff;
          }
          .hata-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 10px;
          }
          .hata-baslik {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .hata-durum {
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 12px;
          }
          .durum-cozuldu {
            background-color: #4caf50;
            color: white;
          }
          .durum-inceleniyor {
            background-color: #ff9800;
            color: white;
          }
          .durum-cozulmedi {
            background-color: #f44336;
            color: white;
          }
          .hata-info {
            margin: 10px 0;
          }
          .hata-info p {
            margin: 5px 0;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .hata-gorsel {
            max-width: 100%;
            margin: 15px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .toplam {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px;
            background-color: #e3f2fd;
            border-radius: 5px;
          }
          @media print {
            .hata-item {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <h1>Hata Havuzu - Filtrelenmiş Hata Listesi</h1>

        <div class="filter-info">
          <p><strong>Rapor Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
          ${search ? `<p><strong>Arama:</strong> ${search}</p>` : ''}
          ${ogrenciFilter ? `<p><strong>Öğrenci:</strong> ${ogrenciFilter}</p>` : ''}
          ${dersFilter ? `<p><strong>Ders:</strong> ${dersFilter}</p>` : ''}
          ${konuFilter ? `<p><strong>Konu:</strong> ${konuFilter}</p>` : ''}
          ${durumFilter ? `<p><strong>Durum:</strong> ${durumFilter}</p>` : ''}
          ${baslangicTarihi ? `<p><strong>Başlangıç Tarihi:</strong> ${new Date(baslangicTarihi).toLocaleDateString('tr-TR')}</p>` : ''}
          ${bitisTarihi ? `<p><strong>Bitiş Tarihi:</strong> ${new Date(bitisTarihi).toLocaleDateString('tr-TR')}</p>` : ''}
        </div>

        <div class="toplam">
          Toplam ${filteredHatalar.length} hata bulundu
        </div>

        ${filteredHatalar.map((hata) => `
          <div class="hata-item">
            <div class="hata-header">
              <div class="hata-baslik">${hata.baslik}</div>
              <div class="hata-durum durum-${hata.durum === 'çözüldü' ? 'cozuldu' : hata.durum === 'inceleniyor' ? 'inceleniyor' : 'cozulmedi'}">
                ${hata.durum.toUpperCase()}
              </div>
            </div>

            <div class="hata-info">
              <p><span class="label">Öğrenci:</span> ${hata.ogrenci_ad} ${hata.ogrenci_soyad}</p>
              ${hata.kategori ? `<p><span class="label">Ders-Konu:</span> ${hata.kategori} - ${hata.alt_konu}</p>` : ''}
              <p><span class="label">Tarih:</span> ${new Date(hata.olusturma_tarihi).toLocaleString('tr-TR')}</p>
              ${hata.aciklama ? `<p><span class="label">Açıklama:</span> ${hata.aciklama}</p>` : ''}
            </div>

            ${hata.gorsel_url ? `<img src="${hata.gorsel_url}" alt="${hata.baslik}" class="hata-gorsel" />` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Görsellerin yüklenmesini bekle
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hata Havuzu
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtreleme Bölümü */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ara"
              placeholder="Başlık veya açıklama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Öğrenci</InputLabel>
              <Select
                value={ogrenciFilter}
                onChange={(e: SelectChangeEvent) => setOgrenciFilter(e.target.value)}
                label="Öğrenci"
              >
                <MenuItem value="">Tümü</MenuItem>
                {ogrenciler.map((ogrenci) => (
                  <MenuItem key={ogrenci.id} value={`${ogrenci.ad} ${ogrenci.soyad}`}>
                    {ogrenci.ad} {ogrenci.soyad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ders</InputLabel>
              <Select
                value={dersFilter}
                onChange={(e: SelectChangeEvent) => setDersFilter(e.target.value)}
                label="Ders"
              >
                <MenuItem value="">Tümü</MenuItem>
                {Array.from(new Set(konular.map((k) => k.kategori))).map((kategori) => (
                  <MenuItem key={kategori} value={kategori}>
                    {kategori}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Konu</InputLabel>
              <Select
                value={konuFilter}
                onChange={(e: SelectChangeEvent) => setKonuFilter(e.target.value)}
                label="Konu"
              >
                <MenuItem value="">Tümü</MenuItem>
                {Array.from(new Set(
                  konular
                    .filter((k) => !dersFilter || k.kategori === dersFilter)
                    .map((k) => k.alt_konu)
                )).map((altKonu) => (
                  <MenuItem key={altKonu} value={altKonu}>
                    {altKonu}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={durumFilter}
                onChange={(e: SelectChangeEvent) => setDurumFilter(e.target.value)}
                label="Durum"
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="çözülmedi">Çözülmedi</MenuItem>
                <MenuItem value="inceleniyor">İnceleniyor</MenuItem>
                <MenuItem value="çözüldü">Çözüldü</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Başlangıç Tarihi"
              type="date"
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Bitiş Tarihi"
              type="date"
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ height: '56px' }}
            >
              Filtreleri Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sonuç Sayısı ve Yazdırma Butonu */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2">
          {filteredHatalar.length} hata bulundu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={filteredHatalar.length === 0}
        >
          Yazdır
        </Button>
      </Box>

      {/* Hata Kartları */}
      <Grid container spacing={3}>
        {filteredHatalar.map((hata) => (
          <Grid item xs={12} sm={6} md={4} key={hata.id}>
            <Card>
              {hata.gorsel_url && (
                <CardMedia
                  component="img"
                  height="200"
                  image={hata.gorsel_url}
                  alt={hata.baslik}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip
                    label={hata.durum}
                    color={getDurumColor(hata.durum) as any}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(hata.olusturma_tarihi).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>

                <Typography variant="h6" component="h2" gutterBottom>
                  {hata.baslik}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Öğrenci: {hata.ogrenci_ad} {hata.ogrenci_soyad}
                </Typography>

                {hata.kategori && (
                  <Typography variant="body2" color="text.secondary">
                    Konu: {hata.kategori} - {hata.alt_konu}
                  </Typography>
                )}

                {hata.aciklama && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {hata.aciklama.substring(0, 100)}
                    {hata.aciklama.length > 100 ? '...' : ''}
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewDetail(hata.id)}
                >
                  Detay
                </Button>
                {hata.durum !== 'çözüldü' && (
                  <Button
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    color="success"
                    onClick={() => handleDurumChange(hata.id, 'çözüldü')}
                  >
                    Çözüldü
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detay Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedHata && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedHata.baslik}
                <Chip
                  label={selectedHata.durum}
                  color={getDurumColor(selectedHata.durum) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedHata.gorsel_url && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img
                    src={selectedHata.gorsel_url}
                    alt={selectedHata.baslik}
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                </Box>
              )}

              <Typography variant="body1" paragraph>
                <strong>Öğrenci:</strong> {selectedHata.ogrenci_ad} {selectedHata.ogrenci_soyad}
              </Typography>

              {selectedHata.kategori && (
                <Typography variant="body1" paragraph>
                  <strong>Konu:</strong> {selectedHata.kategori} - {selectedHata.alt_konu}
                </Typography>
              )}

              <Typography variant="body1" paragraph>
                <strong>Tarih:</strong>{' '}
                {new Date(selectedHata.olusturma_tarihi).toLocaleString('tr-TR')}
              </Typography>

              {selectedHata.aciklama && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Açıklama
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedHata.aciklama}
                  </Typography>
                </>
              )}

              {selectedHata.cozumler && selectedHata.cozumler.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Çözümler
                  </Typography>
                  {selectedHata.cozumler.map((cozum: any) => (
                    <Paper key={cozum.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {cozum.olusturan} -{' '}
                        {new Date(cozum.olusturma_tarihi).toLocaleString('tr-TR')}
                      </Typography>
                      <Typography variant="body1">{cozum.cozum_metni}</Typography>
                      {cozum.gorsel_url && (
                        <Box sx={{ mt: 1 }}>
                          <img
                            src={cozum.gorsel_url}
                            alt="Çözüm görseli"
                            style={{ maxWidth: '100%', borderRadius: '4px' }}
                          />
                        </Box>
                      )}
                    </Paper>
                  ))}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
              {selectedHata.durum !== 'çözüldü' && (
                <Button
                  color="success"
                  onClick={() => {
                    handleDurumChange(selectedHata.id, 'çözüldü');
                  }}
                >
                  Çözüldü Olarak İşaretle
                </Button>
              )}
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(selectedHata.id)}
              >
                Sil
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default HataListesi;
