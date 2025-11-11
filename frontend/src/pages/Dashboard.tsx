import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { istatistikApi, ogrenciApi, hataApi } from '../services/api';

interface Istatistikler {
  toplam_ogrenci: number;
  toplam_hata: number;
  cozulmus_hata: number;
  cozulmemis_hata: number;
}

const Dashboard: React.FC = () => {
  const [istatistikler, setIstatistikler] = useState<Istatistikler>({
    toplam_ogrenci: 0,
    toplam_hata: 0,
    cozulmus_hata: 0,
    cozulmemis_hata: 0,
  });
  const [ogrenciler, setOgrenciler] = useState<any[]>([]);
  const [selectedOgrenci, setSelectedOgrenci] = useState<string>('');
  const [ogrenciHatalari, setOgrenciHatalari] = useState({
    toplam: 0,
    cozulmus: 0,
    cozulmemis: 0,
  });

  useEffect(() => {
    fetchIstatistikler();
    fetchOgrenciler();
  }, []);

  useEffect(() => {
    if (selectedOgrenci) {
      fetchOgrenciHatalari(parseInt(selectedOgrenci));
    }
  }, [selectedOgrenci]);

  const fetchIstatistikler = async () => {
    try {
      const response = await istatistikApi.getAll();
      setIstatistikler(response.data);
    } catch (err) {
      console.error('İstatistikler yüklenirken hata:', err);
    }
  };

  const fetchOgrenciler = async () => {
    try {
      const response = await ogrenciApi.getAll();
      setOgrenciler(response.data);
    } catch (err) {
      console.error('Öğrenciler yüklenirken hata:', err);
    }
  };

  const fetchOgrenciHatalari = async (ogrenciId: number) => {
    try {
      const response = await hataApi.getAll({ ogrenci_id: ogrenciId });
      const hatalar = response.data;

      setOgrenciHatalari({
        toplam: hatalar.length,
        cozulmus: hatalar.filter((h: any) => h.durum === 'çözüldü').length,
        cozulmemis: hatalar.filter((h: any) => h.durum === 'çözülmedi').length,
      });
    } catch (err) {
      console.error('Öğrenci hataları yüklenirken hata:', err);
    }
  };

  const handleOgrenciChange = (event: SelectChangeEvent) => {
    setSelectedOgrenci(event.target.value);
  };

  const cozumOrani =
    istatistikler.toplam_hata > 0
      ? ((istatistikler.cozulmus_hata / istatistikler.toplam_hata) * 100).toFixed(1)
      : '0';

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h3" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hata Havuzu - Dashboard
      </Typography>

      {/* Öğrenci Seçimi */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ maxWidth: 400 }}>
          <InputLabel>Öğrenci Seç (Opsiyonel)</InputLabel>
          <Select
            value={selectedOgrenci}
            onChange={handleOgrenciChange}
            label="Öğrenci Seç (Opsiyonel)"
          >
            <MenuItem value="">
              <em>Tüm Öğrenciler</em>
            </MenuItem>
            {ogrenciler.map((ogrenci) => (
              <MenuItem key={ogrenci.id} value={ogrenci.id}>
                {ogrenci.ad} {ogrenci.soyad}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Öğrenci"
            value={istatistikler.toplam_ogrenci}
            icon={<PeopleIcon sx={{ fontSize: 30, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Hata"
            value={istatistikler.toplam_hata}
            icon={<ErrorIcon sx={{ fontSize: 30, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Çözülen Hatalar"
            value={istatistikler.cozulmus_hata}
            icon={<CheckCircleIcon sx={{ fontSize: 30, color: 'success.main' }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bekleyen Hatalar"
            value={istatistikler.cozulmemis_hata}
            icon={<PendingIcon sx={{ fontSize: 30, color: 'error.main' }} />}
            color="error"
          />
        </Grid>

        {/* Çözüm Oranı */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Çözüm Oranı
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h2" color="primary" sx={{ mr: 2 }}>
                %{cozumOrani}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                hata çözüldü
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Öğrenci Bazlı İstatistikler */}
        {selectedOgrenci && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
                Seçili Öğrenci İstatistikleri -{' '}
                {ogrenciler.find((o) => o.id === parseInt(selectedOgrenci))?.ad}{' '}
                {ogrenciler.find((o) => o.id === parseInt(selectedOgrenci))?.soyad}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <StatCard
                title="Toplam Hata"
                value={ogrenciHatalari.toplam}
                icon={<ErrorIcon sx={{ fontSize: 30, color: 'warning.main' }} />}
                color="warning"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StatCard
                title="Çözülen Hatalar"
                value={ogrenciHatalari.cozulmus}
                icon={<CheckCircleIcon sx={{ fontSize: 30, color: 'success.main' }} />}
                color="success"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StatCard
                title="Bekleyen Hatalar"
                value={ogrenciHatalari.cozulmemis}
                icon={<PendingIcon sx={{ fontSize: 30, color: 'error.main' }} />}
                color="error"
              />
            </Grid>
          </>
        )}

        {/* Hoşgeldin Mesajı */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: 'primary.light' }}>
            <Typography variant="h5" gutterBottom>
              Hata Havuzu Yönetim Sistemi
            </Typography>
            <Typography variant="body1">
              Bu sistem öğrencilerin yaptığı hataları kaydetmek, takip etmek ve çözmek için
              geliştirilmiştir. Sol menüden işlemlerinizi gerçekleştirebilirsiniz.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
