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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@mui/material";
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
const descargarExcel = () => {
  const datos = jugadores.map((j) => ({
    "Nombre y Apellido": `${j.nombre} ${j.apellido}`,
    DNI: j.dni || "",
    Telefono: j.telefono || "",
    Direccion: j.direccion || "",
    Equipo: j.equipo || "",
    Capitan: Number(j.capitan) === 1 ? "Sí" : "No",
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Jugadores");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(fileData, "jugadores.xlsx");
};
  return (
    <Box p={3}>
   <Box
  mb={2}
  display="flex"
  justifyContent="space-between"
  alignItems="center"
>
  <Typography variant="h4">
    Lista de Jugadores
  </Typography>

  <Button
    variant="contained"
    color="success"
    onClick={descargarExcel}
  >
    Descargar Excel
  </Button>
</Box>

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
              <b>Telefono</b>
            </TableCell>
               <TableCell>
              <b>Direccion</b>
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
                  {jugador.telefono || "-"}
                </TableCell>
                <TableCell>
                  {jugador.direccion || "-"}
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