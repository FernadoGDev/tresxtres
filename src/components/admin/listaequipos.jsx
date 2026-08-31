
import React, { useEffect, useMemo, useState } from "react";
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
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import servicio from "../../services/servicio";

export default function EquiposAdmin() {
  const [equipos, setEquipos] = useState([]);
  const [edicionSeleccionada, setEdicionSeleccionada] = useState("Primera");

  const traerEquipos = async () => {
    try {
      const response = await servicio.traerEquipos();
      setEquipos(response);
    } catch (error) {
      console.error("Error al traer equipos:", error);
    }
  };

  useEffect(() => {
    traerEquipos();
  }, []);

  // ==========================================
  // CANTIDADES POR EDICIÓN
  // ==========================================

  const equiposPrimera = useMemo(
    () => equipos.filter((e) => e.edicion === "Primera"),
    [equipos]
  );

  const equiposSegunda = useMemo(
    () => equipos.filter((e) => e.edicion === "Segunda"),
    [equipos]
  );

  const jugadoresPrimera = useMemo(
    () =>
      equiposPrimera.reduce(
        (total, equipo) => total + (equipo.jugadores?.length || 0),
        0
      ),
    [equiposPrimera]
  );

  const jugadoresSegunda = useMemo(
    () =>
      equiposSegunda.reduce(
        (total, equipo) => total + (equipo.jugadores?.length || 0),
        0
      ),
    [equiposSegunda]
  );

  // ==========================================
  // EQUIPOS MOSTRADOS SEGÚN FILTRO
  // ==========================================

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(
      (equipo) => equipo.edicion === edicionSeleccionada
    );
  }, [equipos, edicionSeleccionada]);

  // ==========================================
  // CAMBIAR EDICIÓN
  // ==========================================

  const cambiarEdicion = (event, nuevaEdicion) => {
    if (nuevaEdicion !== null) {
      setEdicionSeleccionada(nuevaEdicion);
    }
  };

  // ==========================================
  // DESCARGAR EXCEL
  // ==========================================

  const descargarExcel = () => {
    // Usamos solamente los equipos de la edición seleccionada
    const equiposExcel = equiposFiltrados.map((e) => ({
      Equipo: e.nombre,
      Edicion: e.edicion || "-",
      Ciudad: e.ciudad || "-",
      Cantidad_Jugadores: e.jugadores?.length || 0,
    }));

    const jugadoresExcel = [];

    equiposFiltrados.forEach((equipo) => {
      equipo.jugadores?.forEach((j) => {
        jugadoresExcel.push({
          Equipo: equipo.nombre,
          Edicion: equipo.edicion || "-",
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

    const fecha = new Date()
      .toLocaleDateString("es-AR")
      .replace(/\//g, "-");

    saveAs(
      blob,
      `Equipos_${edicionSeleccionada}_${fecha}.xlsx`
    );
  };

  return (
    <Box p={3}>
      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold">
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
          Descargar {edicionSeleccionada}
        </Button>
      </Box>

      {/* ==========================================
          FILTRO DE EDICIONES
      ========================================== */}

      <ToggleButtonGroup
        value={edicionSeleccionada}
        exclusive
        onChange={cambiarEdicion}
        fullWidth
        sx={{
          mb: 4,
          display: "flex",
          gap: 2,
          "& .MuiToggleButton-root": {
            border: "1px solid #ddd !important",
            borderRadius: "12px !important",
            py: 2,
            textTransform: "none",
          },
        }}
      >
        {/* PRIMERA */}

        <ToggleButton value="Primera">
          <Card
            elevation={0}
            sx={{
              width: "100%",
              background: "transparent",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
              >
                Primera
              </Typography>

              <Box
                display="flex"
                justifyContent="center"
                gap={4}
              >
                <Box>
                  <GroupsIcon />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                  >
                    {equiposPrimera.length}
                  </Typography>

                  <Typography color="text.secondary">
                    Equipos
                  </Typography>
                </Box>

                <Box>
                  <PersonIcon />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                  >
                    {jugadoresPrimera}
                  </Typography>

                  <Typography color="text.secondary">
                    Jugadores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </ToggleButton>

        {/* SEGUNDA */}

        <ToggleButton value="Segunda">
          <Card
            elevation={0}
            sx={{
              width: "100%",
              background: "transparent",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
              >
                Segunda
              </Typography>

              <Box
                display="flex"
                justifyContent="center"
                gap={4}
              >
                <Box>
                  <GroupsIcon />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                  >
                    {equiposSegunda.length}
                  </Typography>

                  <Typography color="text.secondary">
                    Equipos
                  </Typography>
                </Box>

                <Box>
                  <PersonIcon />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                  >
                    {jugadoresSegunda}
                  </Typography>

                  <Typography color="text.secondary">
                    Jugadores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* ==========================================
          TÍTULO DEL LISTADO
      ========================================== */}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Equipos - {edicionSeleccionada}
        </Typography>

        <Typography color="text.secondary">
          {equiposFiltrados.length} equipos ·{" "}
          {equiposFiltrados.reduce(
            (total, equipo) =>
              total + (equipo.jugadores?.length || 0),
            0
          )}{" "}
          jugadores
        </Typography>
      </Box>

      {/* ==========================================
          LISTADO DE EQUIPOS
      ========================================== */}

      {equiposFiltrados.map((equipo) => (
        <Accordion key={equipo.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              pr={2}
              gap={2}
            >
              <Typography fontWeight="bold">
                {equipo.nombre} (
                {equipo.jugadores?.length || 0})
              </Typography>

              <Typography color="text.secondary">
                {equipo.edicion || "-"}
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
                  <TableCell>DNI</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Barrio</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {equipo.jugadores &&
                equipo.jugadores.length > 0 ? (
                  equipo.jugadores.map((jugador) => (
                    <TableRow key={jugador.id}>
                      <TableCell>
                        {jugador.dni || "-"}
                      </TableCell>

                      <TableCell>
                        {jugador.apellido}{" "}
                        {jugador.nombre || "-"}
                      </TableCell>

                      <TableCell>
                        {jugador.telefono || "-"}
                      </TableCell>

                      <TableCell>
                        {jugador.direccion || "-"}
                      </TableCell>

                      <TableCell>
                        {jugador.edad || "-"}
                      </TableCell>

                      <TableCell>
                        {jugador.barrio || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      Sin jugadores
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* ==========================================
          SIN EQUIPOS
      ========================================== */}

      {equiposFiltrados.length === 0 && (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            mt: 2,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
          >
            No hay equipos inscriptos en {edicionSeleccionada}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

