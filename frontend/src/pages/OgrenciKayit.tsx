import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { ogrenciApi } from '../services/api';

interface OgrenciFormData {
  ad: string;
  soyad: string;
  okul: string;
  sinif: string;
  telefon: string;
  email: string;
}

const OgrenciKayit: React.FC = () => {
  const [formData, setFormData] = useState<OgrenciFormData>({
    ad: '',
    soyad: '',
    okul: '',
    sinif: '',
    telefon: '',
    email: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validasyon
    if (!formData.ad || !formData.soyad) {
      setError('Ad ve Soyad alanları zorunludur');
      setLoading(false);
      return;
    }

    try {
      await ogrenciApi.create(formData);
      setSuccess(true);
      // Formu temizle
      setFormData({
        ad: '',
        soyad: '',
        okul: '',
        sinif: '',
        telefon: '',
        email: '',
      });

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Öğrenci kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Öğrenci Kayıt Formu
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Öğrenci başarıyla kaydedildi!
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
              <TextField
                required
                fullWidth
                label="Ad"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Soyad"
                name="soyad"
                value={formData.soyad}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Okul"
                name="okul"
                value={formData.okul}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sınıf"
                name="sinif"
                value={formData.sinif}
                onChange={handleChange}
                placeholder="Örn: 10-A"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="0500 000 00 00"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Öğrenci Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default OgrenciKayit;
