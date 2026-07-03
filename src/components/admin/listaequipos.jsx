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
                  <TableCell>#</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {equipo.jugadores && equipo.jugadores.length > 0 ? (
                  equipo.jugadores.map((jugador) => (
                    <TableRow key={jugador.id}>
                      <TableCell>{jugador.numero || "-"}</TableCell>
                      <TableCell>{jugador.nombre}</TableCell>
                      <TableCell>
                        <Button size="small">Editar</Button>
                        <Button size="small" color="error">
                          Eliminar
                        </Button>
                      </TableCell>
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