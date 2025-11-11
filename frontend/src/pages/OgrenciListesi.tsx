import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ogrenciApi, hataApi } from '../services/api';

interface Ogrenci {
  id: number;
  ad: string;
  soyad: string;
  okul: string;
  sinif: string;
  telefon: string;
  email: string;
  kayit_tarihi: string;
}

interface OgrenciDetay {
  ogrenci: Ogrenci;
  toplam_hata: number;
  cozulmus_hata: number;
  cozulmemis_hata: number;
}

const OgrenciListesi: React.FC = () => {
  const [ogrenciler, setOgrenciler] = useState<Ogrenci[]>([]);
  const [selectedOgrenci, setSelectedOgrenci] = useState<Ogrenci | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ogrenciDetay, setOgrenciDetay] = useState<OgrenciDetay | null>(null);
  const [editFormData, setEditFormData] = useState<Ogrenci | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOgrenciler();
  }, []);

  const fetchOgrenciler = async () => {
    try {
      const response = await ogrenciApi.getAll();
      setOgrenciler(response.data);
      setLoading(false);
    } catch (err) {
      setError('Öğrenciler yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleViewDetail = async (ogrenci: Ogrenci) => {
    try {
      // Öğrencinin hatalarını al
      const hatalarResponse = await hataApi.getAll({ ogrenci_id: ogrenci.id });
      const hatalar = hatalarResponse.data;

      const detay: OgrenciDetay = {
        ogrenci,
        toplam_hata: hatalar.length,
        cozulmus_hata: hatalar.filter((h: any) => h.durum === 'çözüldü').length,
        cozulmemis_hata: hatalar.filter((h: any) => h.durum === 'çözülmedi').length,
      };

      setOgrenciDetay(detay);
      setSelectedOgrenci(ogrenci);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('Detay alınırken hata:', err);
    }
  };

  const handleEdit = (ogrenci: Ogrenci) => {
    setEditFormData({ ...ogrenci });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    try {
      await ogrenciApi.update(editFormData.id, editFormData);
      setSuccess('Öğrenci başarıyla güncellendi');
      setEditDialogOpen(false);
      fetchOgrenciler();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Güncelleme sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: number, ad: string, soyad: string) => {
    if (window.confirm(`${ad} ${soyad} adlı öğrenciyi silmek istediğinizden emin misiniz?`)) {
      try {
        await ogrenciApi.delete(id);
        setSuccess('Öğrenci başarıyla silindi');
        fetchOgrenciler();

        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Öğrenci Listesi
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Ad Soyad</strong></TableCell>
                <TableCell><strong>Okul</strong></TableCell>
                <TableCell><strong>Sınıf</strong></TableCell>
                <TableCell><strong>Telefon</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Kayıt Tarihi</strong></TableCell>
                <TableCell align="center"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ogrenciler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Henüz öğrenci kaydı bulunmuyor
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ogrenciler.map((ogrenci) => (
                  <TableRow key={ogrenci.id} hover>
                    <TableCell>{ogrenci.ad} {ogrenci.soyad}</TableCell>
                    <TableCell>{ogrenci.okul || '-'}</TableCell>
                    <TableCell>{ogrenci.sinif || '-'}</TableCell>
                    <TableCell>{ogrenci.telefon || '-'}</TableCell>
                    <TableCell>{ogrenci.email || '-'}</TableCell>
                    <TableCell>
                      {new Date(ogrenci.kayit_tarihi).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleViewDetail(ogrenci)}
                        title="Detay"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleEdit(ogrenci)}
                        title="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(ogrenci.id, ogrenci.ad, ogrenci.soyad)}
                        title="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detay Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {ogrenciDetay && (
          <>
            <DialogTitle>
              Öğrenci Detayları
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {ogrenciDetay.ogrenci.ad} {ogrenciDetay.ogrenci.soyad}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Okul
                    </Typography>
                    <Typography variant="body1">
                      {ogrenciDetay.ogrenci.okul || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sınıf
                    </Typography>
                    <Typography variant="body1">
                      {ogrenciDetay.ogrenci.sinif || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Telefon
                    </Typography>
                    <Typography variant="body1">
                      {ogrenciDetay.ogrenci.telefon || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {ogrenciDetay.ogrenci.email || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Hata İstatistikleri
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                      <Typography variant="h4">{ogrenciDetay.toplam_hata}</Typography>
                      <Typography variant="body2">Toplam Hata</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                      <Typography variant="h4">{ogrenciDetay.cozulmus_hata}</Typography>
                      <Typography variant="body2">Çözülen</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                      <Typography variant="h4">{ogrenciDetay.cozulmemis_hata}</Typography>
                      <Typography variant="body2">Bekleyen</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Düzenleme Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Öğrenci Düzenle</DialogTitle>
        <DialogContent>
          {editFormData && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ad"
                    name="ad"
                    value={editFormData.ad}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Soyad"
                    name="soyad"
                    value={editFormData.soyad}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Okul"
                    name="okul"
                    value={editFormData.okul || ''}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sınıf"
                    name="sinif"
                    value={editFormData.sinif || ''}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    name="telefon"
                    value={editFormData.telefon || ''}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={handleEditChange}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OgrenciListesi;
