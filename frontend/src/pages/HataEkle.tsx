import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CropIcon from '@mui/icons-material/Crop';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ogrenciApi, konuApi, hataApi } from '../services/api';

interface HataFormData {
  ogrenci_id: string;
  konu_id: string;
  baslik: string;
  aciklama: string;
  durum: string;
}

const HataEkle: React.FC = () => {
  const [formData, setFormData] = useState<HataFormData>({
    ogrenci_id: '',
    konu_id: '',
    baslik: '',
    aciklama: '',
    durum: 'çözülmedi',
  });

  const [gorsel, setGorsel] = useState<File | null>(null);
  const [gorselPreview, setGorselPreview] = useState<string>('');
  const [ogrenciler, setOgrenciler] = useState<any[]>([]);
  const [konular, setKonular] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kırpma için state'ler
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchOgrenciler();
    fetchKonular();
  }, []);

  const fetchOgrenciler = async () => {
    try {
      const response = await ogrenciApi.getAll();
      setOgrenciler(response.data);
    } catch (err) {
      console.error('Öğrenciler yüklenirken hata:', err);
    }
  };

  const fetchKonular = async () => {
    try {
      const response = await konuApi.getAll();
      setKonular(response.data);
    } catch (err) {
      console.error('Konular yüklenirken hata:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGorselChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Önce orijinal görseli göster, kırpmaya hazırla
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async () => {
    const croppedFile = await getCroppedImg();
    if (croppedFile) {
      setGorsel(croppedFile);

      // Önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setGorselPreview(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
    }
    setCropDialogOpen(false);
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setOriginalImage('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleRemoveImage = () => {
    setGorsel(null);
    setGorselPreview('');
    setOriginalImage('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validasyon
    if (!formData.ogrenci_id || !formData.baslik) {
      setError('Öğrenci ve Başlık alanları zorunludur');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('ogrenci_id', formData.ogrenci_id);
      submitData.append('konu_id', formData.konu_id);
      submitData.append('baslik', formData.baslik);
      submitData.append('aciklama', formData.aciklama);
      submitData.append('durum', formData.durum);

      if (gorsel) {
        submitData.append('gorsel', gorsel);
      }

      await hataApi.create(submitData);
      setSuccess(true);

      // Formu temizle
      setFormData({
        ogrenci_id: '',
        konu_id: '',
        baslik: '',
        aciklama: '',
        durum: 'çözülmedi',
      });
      setGorsel(null);
      setGorselPreview('');

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Hata eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, pb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Yeni Hata Ekle
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Hata başarıyla eklendi!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Öğrenci</InputLabel>
                <Select
                  name="ogrenci_id"
                  value={formData.ogrenci_id}
                  onChange={handleSelectChange}
                  disabled={loading}
                  label="Öğrenci"
                >
                  {ogrenciler.map((ogrenci) => (
                    <MenuItem key={ogrenci.id} value={ogrenci.id}>
                      {ogrenci.ad} {ogrenci.soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ders-Konu</InputLabel>
                <Select
                  name="konu_id"
                  value={formData.konu_id}
                  onChange={handleSelectChange}
                  disabled={loading}
                  label="Ders-Konu"
                >
                  {konular.map((konu) => (
                    <MenuItem key={konu.id} value={konu.id}>
                      {konu.kategori} - {konu.alt_konu}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Başlık"
                name="baslik"
                value={formData.baslik}
                onChange={handleChange}
                disabled={loading}
                placeholder="Hatanın kısa açıklaması"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={4}
                placeholder="Hata hakkında detaylı bilgi..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                disabled={loading}
              >
                {gorsel ? gorsel.name : 'Ekran Görüntüsü Yükle'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleGorselChange}
                />
              </Button>
            </Grid>

            {gorselPreview && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">
                      Önizleme:
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveImage}
                      disabled={loading}
                    >
                      Görseli Kaldır
                    </Button>
                  </Box>
                  <img
                    src={gorselPreview}
                    alt="Görsel önizleme"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="durum"
                  value={formData.durum}
                  onChange={handleSelectChange}
                  disabled={loading}
                  label="Durum"
                >
                  <MenuItem value="çözülmedi">Çözülmedi</MenuItem>
                  <MenuItem value="çözüldü">Çözüldü</MenuItem>
                  <MenuItem value="inceleniyor">İnceleniyor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? 'Ekleniyor...' : 'Hata Ekle'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Kırpma Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={handleCropCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CropIcon />
            <Typography variant="h6">Görseli Kırp</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {originalImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imgRef}
                  src={originalImage}
                  alt="Kırpılacak görsel"
                  style={{ maxWidth: '100%' }}
                />
              </ReactCrop>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCropCancel}>İptal</Button>
          <Button
            onClick={handleCropComplete}
            variant="contained"
            disabled={!completedCrop}
          >
            Kırpmayı Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HataEkle;
