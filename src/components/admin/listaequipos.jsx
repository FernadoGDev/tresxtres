import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";
import servicio from "../../services/servicio";

export default function EquiposAdmin() {
  const [equipos, setEquipos] = useState([]);

  const traerEquipos = async () => {
    try {
      const response = await servicio.traerEquipos();
      setEquipos(response); // 👈 importante
    } catch (error) {
      console.error("Error al traer equipos:", error);
    }
  };

  useEffect(() => {
    traerEquipos();
  }, []);


  const descargarExcel = () => {
  // Hoja de equipos
  const equiposExcel = equipos.map((e) => ({
    Equipo: e.nombre,
    Ciudad: e.ciudad || "-",
    Cantidad_Jugadores: e.jugadores?.length || 0,
  }));

  // Hoja de jugadores
  const jugadoresExcel = [];

  equipos.forEach((equipo) => {
    equipo.jugadores?.forEach((j) => {
      jugadoresExcel.push({
        Equipo: equipo.nombre,
        DNI: j.dni || "",
        Apellido: j.apellido || "",
        Nombre: j.nombre || "",
        Telefono: j.telefono || "",
        Direccion: j.direccion || "",
        Barrio: j.barrio || "",
        Edad: j.edad || "",
      });
    });
  });

  const wb = XLSX.utils.book_new();

  const wsEquipos = XLSX.utils.json_to_sheet(equiposExcel);
  const wsJugadores = XLSX.utils.json_to_sheet(jugadoresExcel);

  XLSX.utils.book_append_sheet(wb, wsEquipos, "Equipos");
  XLSX.utils.book_append_sheet(wb, wsJugadores, "Jugadores");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fecha = new Date().toLocaleDateString("es-AR").replace(/\//g, "-");

  saveAs(blob, `Equipos_${fecha}.xlsx`);
};

  return (
    <Box p={3}>
      <Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
>
  <Typography variant="h4">
    Equipos
  </Typography>

  <Button
    variant="contained"
    color="success"
    startIcon={<DownloadIcon />}
    onClick={descargarExcel}
    sx={{
      borderRadius: 3,
      px: 3,
      boxShadow: 3,
      fontWeight: "bold",
    }}
  >
    Descargar Inscriptos
  </Button>
</Box>

      {equipos.map((equipo) => (
        <Accordion key={equipo.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Typography>
                {equipo.nombre} ({equipo.jugadores?.length || 0})
              </Typography>

              <Typography color="text.secondary">
                {equipo.ciudad || "-"}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Table component={Paper}>
              <TableHead>
                <TableRow>
                
                   <TableCell>Dni</TableCell>
                  <TableCell>Nombre</TableCell>
 <TableCell>Telefono</TableCell>
                  <TableCell>Direccion</TableCell>
                  <TableCell>Edad</TableCell>
                    <TableCell>Barrio</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {equipo.jugadores && equipo.jugadores.length > 0 ? (
                  equipo.jugadores.map((jugador) => (
                    <TableRow key={jugador.id}>
                      <TableCell> {jugador.dni || "-"}</TableCell>
                      <TableCell>{jugador.apellido}  {jugador.nombre || "-"}</TableCell>
                      <TableCell>{jugador.telefono || "-"}</TableCell>
                      <TableCell>{jugador.direccion || "-"}</TableCell>
                      <TableCell>{jugador.edad || "-"}</TableCell>
                 <TableCell>{jugador.barrio || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      Sin jugadores
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}