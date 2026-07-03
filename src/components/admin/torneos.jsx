import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import servicio from "../../services/servicio";

export default function TorneosAdmin() {
  const [torneos, setTorneos] = useState([]);
  const navigate = useNavigate();

  const traerTorneos = async () => {
    try {
      const response = await servicio.traerTorneos();
      console.log("Torneos traídos:", response);
      setTorneos(response);
    } catch (error) {
      console.error("Error al traer torneos:", error);
    }
  };

  useEffect(() => {
    traerTorneos();
  }, []);

  return (
 <Box
  sx={{
    minHeight: "100vh",
    backgroundImage: "url('/fondo.jpg')", // 👈 tu imagen
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    p: 3,
  }}
>
<Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
>
  <Typography variant="h4" color="#fff">
    🏆 Torneos
  </Typography>

  <Button
    variant="contained"
    color="warning"
    onClick={() => navigate("/admincreartorneo")}
  >
    + Crear Torneo
  </Button>
</Box>

      {/* Tabla */}
     <Box display="flex" flexWrap="wrap" gap={3}>
  {torneos.length > 0 ? (
    torneos.map((torneo) => (
      <Paper
        key={torneo.id}
        sx={{
          width: 280,
          p: 2,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "#fff",
          boxShadow: 4,
          transition: "0.3s",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: 8,
          },
        }}
      >
        <Typography variant="h6" mb={1}>
          {torneo.nombre || "Sin nombre"}
        </Typography>

        <Typography variant="body2" mb={2} sx={{ opacity: 0.8 }}>
          Torneo activo
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={() => navigate(`/admintorneo/${torneo.id}`)}
          >
            Ver
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{ color: "#fff", borderColor: "#fff" }}
            onClick={() => navigate(`/tablastorneo/${torneo.id}`)}
          >
            Tablas
          </Button>
        </Box>
      </Paper>
    ))
  ) : (
    <Typography color="#fff">No hay torneos</Typography>
  )}
</Box>
    </Box>
  );
}