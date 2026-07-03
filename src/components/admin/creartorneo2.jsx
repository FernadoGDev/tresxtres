import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

import { useParams } from "react-router-dom";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import servicio from "../../services/servicio";

export default function ConfigurarTorneo() {
  const { id } = useParams();

  const [step, setStep] = useState(1);

  const [equipos, setEquipos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [cantidadZonas, setCantidadZonas] = useState(2);

  const [zonas, setZonas] = useState([]);

  const [modo, setModo] = useState("");

  const [animando, setAnimando] = useState(false);
  const [equipoActual, setEquipoActual] = useState(null);
useEffect(() => {
  traerEquipos();
}, [id]);

const traerEquipos = async () => {
  try {
    const response = await servicio.traerEquipos2(id);

    console.log(response);

    setEquipos(response || []);

    // opcional: seleccionar automáticamente los clasificados
    const clasificados = (response || []).filter(
      (x) => x.clasificado === 1 || x.clasificado === true
    );

    setSeleccionados(clasificados);

  } catch (error) {
    console.error(error);
  }
};




const confirmarInvitacion = async (idEquipo) => {
  try {
    await servicio.confirmarInvitacion({
      id_torneo: id,
      id_equipo: idEquipo,
    });

    await traerEquipos();

    alert("Equipo confirmado");
  } catch (error) {
    console.error(error);
    alert("Error al confirmar");
  }
};




  const toggleEquipo = (equipo) => {
    const existe = seleccionados.find(
      (e) => e.id === equipo.id
    );

    if (existe) {
      setSeleccionados(
        seleccionados.filter((e) => e.id !== equipo.id)
      );
    } else {
      setSeleccionados([...seleccionados, equipo]);
    }
  };

  const shuffle = (array) => {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  };

  const generarZonasFlex = (equipos, zonasCant) => {
    const total = equipos.length;

    const base = Math.floor(total / zonasCant);

    const extra = total % zonasCant;

    const resultado = [];

    let index = 0;

    for (let i = 0; i < zonasCant; i++) {
      const cantidad =
        base + (i < extra ? 1 : 0);

      resultado.push(
        equipos.slice(index, index + cantidad)
      );

      index += cantidad;
    }

    return resultado;
  };

  const hacerSorteo = async () => {
    setModo("random");

    setAnimando(true);

    const mezcla = shuffle(seleccionados);

    let nuevasZonas = Array.from(
      { length: cantidadZonas },
      () => []
    );

    for (let i = 0; i < mezcla.length; i++) {
      const equipo = mezcla[i];

      setEquipoActual(equipo);

      await new Promise((r) =>
        setTimeout(r, 700)
      );

      const zona = i % cantidadZonas;

      nuevasZonas[zona].push(equipo);

      setZonas([...nuevasZonas]);
    }

    setAnimando(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceZona = Number(
      result.source.droppableId
    );

    const destZona = Number(
      result.destination.droppableId
    );

    const sourceItems = [
      ...zonas[sourceZona],
    ];

    const destItems =
      sourceZona === destZona
        ? sourceItems
        : [...zonas[destZona]];

    const [moved] = sourceItems.splice(
      result.source.index,
      1
    );

    destItems.splice(
      result.destination.index,
      0,
      moved
    );

    const nuevas = [...zonas];

    nuevas[sourceZona] = sourceItems;
    nuevas[destZona] = destItems;

    setZonas(nuevas);
  };

  const guardarConfiguracion = async () => {
    try {
      const payload = {
        id_torneo: id,

        cantidad_zonas: cantidadZonas,

        zonas: zonas.map((z, i) => ({
          nombre: `Zona ${i + 1}`,

          equipos: z.map((eq) => ({
            id_equipo: eq.id,
          })),
        })),
      };

      console.log(payload);

      await servicio.guardarZonasTorneo(
        payload
      );

      alert(
        "Configuración guardada correctamente"
      );
    } catch (error) {
      console.error(error);

      alert("Error al guardar");
    }
  };

  const invitarEquipo = (idEquipo) => {
    console.log("Invitar", idEquipo);

    // después hacemos esto
    // servicio.invitarEquipo(id, idEquipo)
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Configurar Torneo
      </Typography>

      {step === 1 && (
        <>
          <Typography variant="h6" mb={2}>
            Equipos participantes
          </Typography>

          <Table component={Paper}>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Equipo</TableCell>
                <TableCell>
                  Confirmacion
                </TableCell>
                   <TableCell>
                  Confirmar
                </TableCell>
                <TableCell>
                  Invitación
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {equipos.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell>
                    <Checkbox
                      checked={seleccionados.some(
                        (x) => x.id === eq.id
                      )}
                      onChange={() =>
                        toggleEquipo(eq)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    {eq.nombre}
                  </TableCell>
<TableCell>
  <Typography
    color={
      eq.confirmado
        ? "success.main"
        : "error.main"
    }
    fontWeight="bold"
  >
    {eq.confirmado
      ? "Confirmado"
      : "Pendiente"}
  </Typography>
</TableCell>
<TableCell>
  {eq.confirmado ? (
    <Button
      color="success"
      variant="contained"
      disabled
    >
      Confirmado
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={() => confirmarInvitacion(eq.id)}
    >
      Confirmar
    </Button>
  )}
</TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        invitarEquipo(eq.id)
                      }
                    >
                      Invitar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            sx={{ mt: 3 }}
            variant="contained"
            disabled={
              seleccionados.length < 2
            }
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Typography variant="h6">
            Cantidad de zonas
          </Typography>

          <Box
            mt={2}
            mb={3}
            display="flex"
            gap={1}
            flexWrap="wrap"
          >
            {[2, 3, 4, 5, 6, 7, 8].map(
              (n) => (
                <Button
                  key={n}
                  variant={
                    cantidadZonas === n
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() =>
                    setCantidadZonas(n)
                  }
                >
                  {n}
                </Button>
              )
            )}
          </Box>

          <Button
            onClick={() => setStep(1)}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            onClick={() => setStep(3)}
          >
            Continuar
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <Typography variant="h6">
            Tipo de sorteo
          </Typography>

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={async () => {
                await hacerSorteo();
                setStep(4);
              }}
            >
              🎲 Sorteo automático
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setModo("manual");

                setZonas(
                  generarZonasFlex(
                    seleccionados,
                    cantidadZonas
                  )
                );

                setStep(4);
              }}
            >
              ✋ Manual
            </Button>
          </Box>
        </>
      )}

      {step === 4 && (
        <>
          {animando && (
            <Typography
              variant="h5"
              mb={3}
            >
              Sorteando:
              {" "}
              {equipoActual?.nombre}
            </Typography>
          )}

          <Typography
            variant="h5"
            mb={2}
          >
            Zonas
          </Typography>

          <DragDropContext
            onDragEnd={onDragEnd}
          >
            <Grid container spacing={2}>
              {zonas.map((zona, i) => (
                <Grid
                  item
                  xs={12}
                  md={4}
                  key={i}
                >
                  <Droppable
                    droppableId={i.toString()}
                  >
                    {(provided) => (
                      <Card
                        ref={
                          provided.innerRef
                        }
                        {...provided.droppableProps}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                          >
                            Zona {i + 1}
                          </Typography>

                          {zona.map(
                            (
                              equipo,
                              index
                            ) => (
                              <Draggable
                                key={
                                  equipo.id
                                }
                                draggableId={equipo.id.toString()}
                                index={
                                  index
                                }
                              >
                                {(
                                  provided
                                ) => (
                                  <Box
                                    ref={
                                      provided.innerRef
                                    }
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      p: 1,
                                      mt: 1,
                                      borderRadius: 1,
                                      background:
                                        "#1976d2",
                                      color:
                                        "white",
                                    }}
                                  >
                                    {
                                      equipo.nombre
                                    }
                                  </Box>
                                )}
                              </Draggable>
                            )
                          )}

                          {
                            provided.placeholder
                          }
                        </CardContent>
                      </Card>
                    )}
                  </Droppable>
                </Grid>
              ))}
            </Grid>
          </DragDropContext>

          <Box mt={3}>
            <Button
              onClick={() =>
                setStep(3)
              }
            >
              Volver
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={
                guardarConfiguracion
              }
            >
              Guardar Zonas
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}