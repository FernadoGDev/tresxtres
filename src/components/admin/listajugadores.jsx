import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import servicio from "../../services/servicio";

export default function JugadoresAdmin() {
  const [jugadores, setJugadores] = useState([]);

  const traerJugadores = async () => {
    try {
      const response = await servicio.traerJugadores();

      console.log("Jugadores traídos:", response);

      setJugadores(response);
    } catch (error) {
      console.error("Error al traer jugadores:", error);
    }
  };

  useEffect(() => {
    traerJugadores();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Lista de Jugadores
      </Typography>

      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Nombre y Apellido</b>
            </TableCell>

            <TableCell>
              <b>DNI</b>
            </TableCell>

            <TableCell>
              <b>Equipo</b>
            </TableCell>

            <TableCell>
              <b>Capitán</b>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {jugadores.length > 0 ? (
            jugadores.map((jugador) => (
              <TableRow key={jugador.id}>
                <TableCell>
                  {jugador.nombre} {jugador.apellido}
                </TableCell>

                <TableCell>
                  {jugador.dni || "-"}
                </TableCell>

                <TableCell>
                  {jugador.equipo || "-"}
                </TableCell>

                <TableCell>
                  {Number(jugador.capitan) === 1 ? "✅" : "-"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                No hay jugadores cargados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}