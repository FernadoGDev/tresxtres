import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useParams } from "react-router-dom";
import servicio from "../../services/servicio";

export default function TablasTorneo() {
  const { id } = useParams();
  const [zonas, setZonas] = useState([]);

const [ultimo, setUltimo] = useState(null);


const traerTablas = async () => {
  try {
    const res = await servicio.traertablas(id);

    setZonas(res.zonas);
    setUltimo(res.ultimoPartido);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    traerTablas();
  }, [id]);
useEffect(() => {
  traerTablas();

  const interval = setInterval(() => {
    traerTablas();
  }, 15000); // 🔥 cada 10 segundos

  return () => clearInterval(interval); // limpieza
}, [id]);
  return (
    <>
    {ultimo && (
  <Box
    sx={{
      width: "100%",
      overflow: "hidden",
      whiteSpace: "nowrap",
      background: "#111",
      color: "#fff",
      py: 1,
      mb: 2,
    }}
  >
    <Box
      sx={{
        display: "inline-block",
        paddingLeft: "100%",
        animation: "scrollText 15s linear infinite",
      }}
    >
      ⚽ Último resultado: {ultimo.equipo1} {ultimo.goles1} - {ultimo.goles2} {ultimo.equipo2}
    </Box>

    <style>
      {`
        @keyframes scrollText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}
    </style>
  </Box>
)}
   <Box p={3}>
  <Typography variant="h4" mb={3}>
    Tabla de posiciones
  </Typography>

  <Box display="flex" flexWrap="wrap" gap={3}>
    {zonas.map((zona, index) => (
      <Paper
        key={index}
        sx={{
          p: 3,
          minWidth: 400,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" mb={2}>
          {zona.zona}
        </Typography>

        {/* 🟢 TABLA */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Equipo</TableCell>
              <TableCell>Pts</TableCell>
              <TableCell>JG</TableCell>
              <TableCell>GF</TableCell>
              <TableCell>GC</TableCell>
              <TableCell>DG</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {zona.tabla.map((e, i) => (
              <TableRow
                key={i}
                sx={{
                  backgroundColor:
                    i === 0
                      ? "#d4edda"
                      : i === 1
                      ? "#fff3cd"
                      : "transparent",
                }}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{e.equipo}</TableCell>
                <TableCell>{e.puntos}</TableCell>
                <TableCell>{e.jugados}</TableCell>
                <TableCell>{e.goles_favor}</TableCell>
                <TableCell>{e.goles_contra}</TableCell>
                <TableCell>{e.diferencia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 🔵 RESULTADOS (AHORA SÍ BIEN UBICADO) */}
        <Box mt={3}>
          <Typography variant="subtitle1" mb={1}>
            Resultados
          </Typography>

          {zona.partidos?.length > 0 ? (
            zona.partidos.map((p, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                sx={{
                  background: "#f5f5f5",
                  p: 1,
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <Typography sx={{ width: 120 }}>
                  {p.equipo1}
                </Typography>

                <Typography fontWeight="bold">
                  {p.goles1} - {p.goles2}
                </Typography>

                <Typography
                  sx={{ width: 120, textAlign: "right" }}
                >
                  {p.equipo2}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">
              Sin partidos cargados
            </Typography>
          )}
        </Box>
      </Paper>
    ))}
  </Box>
</Box>

</>
  );
}