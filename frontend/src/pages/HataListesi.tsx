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
import { hataApi, ogrenciApi, konuApi } from '../services/api';

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
  const [konuFilter, setKonuFilter] = useState('');
  const [durumFilter, setDurumFilter] = useState('');
  const [selectedHata, setSelectedHata] = useState<Hata | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterHatalar();
  }, [hatalar, search, ogrenciFilter, konuFilter, durumFilter]);

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
    } finally {
      setLoading(false);
    }
  };

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

    if (konuFilter) {
      filtered = filtered.filter((hata) => hata.kategori === konuFilter);
    }

    if (durumFilter) {
      filtered = filtered.filter((hata) => hata.durum === durumFilter);
    }

    setFilteredHatalar(filtered);
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
            <TextField
              fullWidth
              label="Öğrenci"
              placeholder="Öğrenci adı..."
              value={ogrenciFilter}
              onChange={(e) => setOgrenciFilter(e.target.value)}
            />
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
        </Grid>
      </Paper>

      {/* Sonuç Sayısı */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        {filteredHatalar.length} hata bulundu
      </Typography>

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
