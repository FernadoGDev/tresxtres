import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import servicio from "../../services/servicio";

import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

export default function CrearTorneo() {
  const [step, setStep] = useState(1);

  const [nombre, setNombre] = useState("");
  const [equipos, setEquipos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [usarTodos, setUsarTodos] = useState(true);

  const [cantidadZonas, setCantidadZonas] = useState(2);
  const [zonas, setZonas] = useState([]);
  const [modo, setModo] = useState(null);
  const [animando, setAnimando] = useState(false);

  // 🎱 NUEVO (bolillero)
  const [equipoActual, setEquipoActual] = useState(null);
  const [mostrarBola, setMostrarBola] = useState(false);

  useEffect(() => {
    traerEquipos();
  }, []);

  const traerEquipos = async () => {
    const res = await servicio.traerEquipos();
    const data = res || [];
    setEquipos(data);
    setSeleccionados(data);
  };

  const equiposFinal = usarTodos ? equipos : seleccionados;

  const shuffle = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generarZonasFlex = (equipos, zonasCant) => {
    const total = equipos.length;
    const base = Math.floor(total / zonasCant);
    const extra = total % zonasCant;

    const zonas = [];
    let index = 0;

    for (let i = 0; i < zonasCant; i++) {
      const size = base + (i < extra ? 1 : 0);
      zonas.push(equipos.slice(index, index + size));
      index += size;
    }

    return zonas;
  };
const guardarTorneo = async () => {
  try {
    const payload = {
      nombre,
      zonas: zonas.map((z, i) => ({
        nombre: `Zona ${i + 1}`,
        equipos: z.map(eq => ({
          id: eq.id
        }))
      }))
    };

    await servicio.crearTorneo(payload);

    alert("Torneo guardado completo 🔥");
  } catch (error) {
    console.error(error);
    alert("Error al guardar torneo");
  }
};
  // 🎬 SORTEO CON ANIMACIÓN REAL
  const hacerSorteo = async () => {
    setModo("random");
    setAnimando(true);

    const mezcla = shuffle(equiposFinal);
    let nuevasZonas = Array.from({ length: cantidadZonas }, () => []);

    for (let i = 0; i < mezcla.length; i++) {
      const equipo = mezcla[i];

      // mostrar bola
      setEquipoActual(equipo);
      setMostrarBola(true);

      await new Promise(res => setTimeout(res, 900));

      // asignar equipo
      const zonaIndex = i % cantidadZonas;
      nuevasZonas[zonaIndex].push(equipo);
      setZonas([...nuevasZonas]);

      // ocultar bola
      setMostrarBola(false);

      await new Promise(res => setTimeout(res, 250));
    }

    setAnimando(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceZona = parseInt(result.source.droppableId);
    const destZona = parseInt(result.destination.droppableId);

    const sourceItems = [...zonas[sourceZona]];
    const destItems = [...zonas[destZona]];

    const [moved] = sourceItems.splice(result.source.index, 1);
    destItems.splice(result.destination.index, 0, moved);

    const nuevas = [...zonas];
    nuevas[sourceZona] = sourceItems;
    nuevas[destZona] = destItems;

    setZonas(nuevas);
  };

  const toggleEquipo = (eq) => {
    if (seleccionados.find(e => e.id === eq.id)) {
      setSeleccionados(seleccionados.filter(e => e.id !== eq.id));
    } else {
      setSeleccionados([...seleccionados, eq]);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
        p: { xs: 2, md: 4 }
      }}
    >
      {/* 🎨 CSS DEL BOMBO */}
      <style>
        {`
        .bombo {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, #444, #111);
          display: flex;
          justify-content: center;
          align-items: center;
          margin: auto;
          margin-bottom: 20px;
        }

        .bola {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffcc00, #ff9900);
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          font-weight: bold;
          color: black;
          padding: 8px;
          animation: rebote 0.8s ease;
        }

        @keyframes rebote {
          0% { transform: translateY(60px) scale(0.4); opacity: 0; }
          40% { transform: translateY(-20px) scale(1.1); }
          70% { transform: translateY(10px); }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}
      </style>

      <Typography variant="h4" mb={2}>
        Crear Torneo
      </Typography>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <TextField
            label="Nombre del torneo"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            sx={{
              mb: 2,
              input: { color: "white" },
              label: { color: "#ccc" }
            }}
          />

          <Typography>Equipos disponibles: {equipos.length}</Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={usarTodos}
                onChange={(e) => {
                  setUsarTodos(e.target.checked);
                  setSeleccionados(e.target.checked ? equipos : []);
                }}
              />
            }
            label="Participan todos"
          />

          <Button variant="contained" onClick={() => setStep(2)}>
            Siguiente
          </Button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && !usarTodos && (
        <>
          <Typography>Seleccionar equipos</Typography>

          <Grid container spacing={1} mt={1}>
            {equipos.map((eq) => (
              <Grid item key={eq.id}>
                <Button
                  variant={seleccionados.find(e => e.id === eq.id) ? "contained" : "outlined"}
                  onClick={() => toggleEquipo(eq)}
                >
                  {eq.nombre}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Typography mt={2}>
            Seleccionados: {seleccionados.length}
          </Typography>

          <Button onClick={() => setStep(1)}>Volver</Button>
          <Button
            variant="contained"
            disabled={seleccionados.length < 4}
            onClick={() => setStep(3)}
          >
            Siguiente
          </Button>
        </>
      )}

      {/* STEP 3 */}
      {(step === 2 && usarTodos) || step === 3 ? (
        <>
          <Typography mt={3}>Cantidad de zonas</Typography>

          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {[2,3,4,5,6,7,8].map((n) => (
              <Button
                key={n}
                variant={cantidadZonas === n ? "contained" : "outlined"}
                onClick={() => setCantidadZonas(n)}
              >
                {n}
              </Button>
            ))}
          </Box>

          <Typography mt={2}>
            {equiposFinal.length} equipos serán distribuidos
          </Typography>

          <Button onClick={() => setStep(2)}>Volver</Button>
          <Button variant="contained" onClick={() => setStep(4)}>
            Confirmar
          </Button>
        </>
      ) : null}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <Typography mt={3}>Modo de distribución</Typography>

          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => {
                hacerSorteo();
                setStep(5);
              }}
            >
              🎲 Random
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setModo("manual");
                setZonas(generarZonasFlex(equiposFinal, cantidadZonas));
                setStep(5);
              }}
            >
              ✋ Manual
            </Button>
          </Box>

          <Button onClick={() => setStep(3)}>Volver</Button>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          {modo === "random" && animando && (
            <Box className="bombo">
              {mostrarBola && (
                <Box className="bola">
                  {equipoActual?.nombre}
                </Box>
              )}
            </Box>
          )}

          <Typography mt={3}>
            Zonas ({modo}) {animando && "🎱 Sorteando..."}
          </Typography>

          <DragDropContext onDragEnd={onDragEnd}>
            <Grid container spacing={2} mt={2}>
              {zonas.map((zona, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Droppable droppableId={i.toString()}>
                    {(provided) => (
                      <Card ref={provided.innerRef} {...provided.droppableProps}>
                        <CardContent>
                          <Typography variant="h6">
                            Zona {i + 1} ({zona.length})
                          </Typography>

                          {zona.map((eq, index) => (
                            <Draggable
                              key={eq.id}
                              draggableId={eq.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    p: 1,
                                    m: 1,
                                    borderRadius: 2,
                                    background: "#00c6ff"
                                  }}
                                >
                                  {eq.nombre}
                                </Box>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}
                        </CardContent>
                      </Card>
                    )}
                  </Droppable>
                </Grid>
              ))}
            </Grid>
          </DragDropContext>

          <Button onClick={() => setStep(4)}>Volver</Button>
          <Button
  variant="contained"
  color="success"
  sx={{ mt: 3 }}
  onClick={guardarTorneo}
>
  💾 Guardar Torneo
</Button>
        </>
      )}
    </Box>
  );
}