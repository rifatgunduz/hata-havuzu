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
import AddIcon from '@mui/icons-material/Add';
import { konuApi } from '../services/api';

const KonuEkle: React.FC = () => {
  const [kategori, setKategori] = useState('');
  const [altKonu, setAltKonu] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validasyon
    if (!kategori || !altKonu) {
      setError('Tüm alanlar zorunludur');
      setLoading(false);
      return;
    }

    try {
      await konuApi.create({
        kategori: kategori.trim(),
        alt_konu: altKonu.trim(),
      });

      setSuccess(true);
      setKategori('');
      setAltKonu('');

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Konu eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Yeni Konu Ekle
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Konu başarıyla eklendi!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Kategori"
                name="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                disabled={loading}
                placeholder="Örn: Matematik, Fizik, Kimya"
                helperText="Ana konu başlığı"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Alt Konu"
                name="alt_konu"
                value={altKonu}
                onChange={(e) => setAltKonu(e.target.value)}
                disabled={loading}
                placeholder="Örn: Türev, Limit, İntegral"
                helperText="Alt konu başlığı"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={loading}
              >
                {loading ? 'Ekleniyor...' : 'Konu Ekle'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default KonuEkle;
