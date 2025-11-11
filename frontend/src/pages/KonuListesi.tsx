import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { konuApi, hataApi } from '../services/api';

interface Konu {
  id: number;
  kategori: string;
  alt_konu: string;
}

const KonuListesi: React.FC = () => {
  const [konular, setKonular] = useState<Konu[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKonular();
  }, []);

  const fetchKonular = async () => {
    try {
      const response = await konuApi.getAll();
      setKonular(response.data);
      setLoading(false);
    } catch (err) {
      setError('Ders/Konular yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const checkIfUsed = async (konuId: number): Promise<boolean> => {
    try {
      const response = await hataApi.getAll({ konu_id: konuId });
      return response.data.length > 0;
    } catch (err) {
      return false;
    }
  };

  const handleDelete = async (id: number, ders: string, konu: string) => {
    try {
      // Önce kullanılıp kullanılmadığını kontrol et
      const isUsed = await checkIfUsed(id);

      if (isUsed) {
        setError(`"${ders} - ${konu}" daha önce kullanıldığı için silinemez`);
        setTimeout(() => setError(''), 5000);
        return;
      }

      if (window.confirm(`${ders} - ${konu} silinecek. Emin misiniz?`)) {
        await konuApi.delete(id);
        setSuccess('Ders/Konu başarıyla silindi');
        fetchKonular(); // Listeyi yenile

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Silme sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ders ve Konu Listesi
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
                <TableCell><strong>Ders</strong></TableCell>
                <TableCell><strong>Konu</strong></TableCell>
                <TableCell align="center"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Yükleniyor...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : konular.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Henüz ders/konu kaydı bulunmuyor
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                konular.map((konu) => (
                  <TableRow key={konu.id} hover>
                    <TableCell>
                      <Chip label={konu.kategori} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{konu.alt_konu}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(konu.id, konu.kategori, konu.alt_konu)}
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
    </Container>
  );
};

export default KonuListesi;
