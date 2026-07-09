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

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Equipos
      </Typography>

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