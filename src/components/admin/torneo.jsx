
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";

import { useParams } from "react-router-dom";
import servicio from "../../services/servicio";
import PlayoffView from "./playoffs";
const coloresZonas = [
  {
    fondo: "#F0F7FF",
    borde: "#90CAF9",
    encabezado: "#D6E9FF",
    texto: "#174A7E",
  },
  {
    fondo: "#F1F8F3",
    borde: "#81C784",
    encabezado: "#D9EFDC",
    texto: "#245B32",
  },
  {
    fondo: "#FFF8ED",
    borde: "#FFCC80",
    encabezado: "#FFE9C7",
    texto: "#895313",
  },
  {
    fondo: "#F8F2FC",
    borde: "#CE93D8",
    encabezado: "#EEDCF4",
    texto: "#653779",
  },
  {
    fondo: "#FFF2F2",
    borde: "#EF9A9A",
    encabezado: "#FFDDDD",
    texto: "#8B3030",
  },
  {
    fondo: "#F0F7F7",
    borde: "#80CBC4",
    encabezado: "#D3EBE8",
    texto: "#24645E",
  },
];
export default function TorneoView() {
  const { id } = useParams();

  const [clasificacion, setClasificacion] = useState(0);
  const [zonas, setZonas] = useState([]);

  const [partidosPorZona, setPartidosPorZona] = useState({});
  const [partidosInterzonales, setPartidosInterzonales] = useState([]);

  const [nuevoPartidoZona, setNuevoPartidoZona] = useState({});
  const [nuevoInterzonal, setNuevoInterzonal] = useState({
    equipo1: "",
    equipo2: "",
  });

  // ==========================================
  // GENERAR FIXTURE AUTOMÁTICO
  // ==========================================

  const generarPartidos = (equipos) => {
    const partidos = [];

    for (let i = 0; i < equipos.length; i++) {
      for (let j = i + 1; j < equipos.length; j++) {
        partidos.push({
          equipo1: equipos[i],
          equipo2: equipos[j],
          goles1: "",
          goles2: "",
        });
      }
    }

    return partidos;
  };

  // ==========================================
  // TRAER TORNEO
  // ==========================================

  const traerTorneo = async () => {
    try {
      const response = await servicio.traerTorneo(id);

      const {
        clasificacion = 0,
        zonas = [],
        participaciones = [],
        equipos = [],
        partidos = [],
      } = response;

      setClasificacion(clasificacion);

      const equiposPlanos = equipos.flatMap((e) =>
        Array.isArray(e) ? e : [e]
      );

      const equiposMap = {};

      equiposPlanos.forEach((e) => {
        equiposMap[Number(e.id)] = e;
      });

      const zonasConEquipos = zonas.map((zona) => {
        const equiposZona = participaciones
          .filter(
            (p) => Number(p.id_zona) === Number(zona.id)
          )
          .map((p) => equiposMap[Number(p.id_equipo)])
          .filter(Boolean);

        const partidosZonaBD = partidos.filter(
          (p) =>
            p.tipo_partido !== "interzonal" &&
            Number(p.id_zona) === Number(zona.id)
        );

        // Generar fixture normal
        const fixture = generarPartidos(equiposZona);

        const utilizados = new Set();

        // Asociar los resultados guardados al fixture
        const fixtureFinal = fixture.map((p) => {
          const existente = partidosZonaBD.find((bd) => {
            if (utilizados.has(bd.id)) return false;

            return (
              (
                Number(bd.id_equipo_1) === Number(p.equipo1.id) &&
                Number(bd.id_equipo_2) === Number(p.equipo2.id)
              ) ||
              (
                Number(bd.id_equipo_1) === Number(p.equipo2.id) &&
                Number(bd.id_equipo_2) === Number(p.equipo1.id)
              )
            );
          });

          if (!existente) return p;

          utilizados.add(existente.id);

          const invertido =
            Number(existente.id_equipo_1) !== Number(p.equipo1.id);

          return {
            ...p,
            goles1: String(
              invertido ? existente.goles_2 : existente.goles_1
            ),
            goles2: String(
              invertido ? existente.goles_1 : existente.goles_2
            ),
            id_partido: existente.id,
            yaGuardado: true,
          };
        });

        // Los partidos que quedaron sin asociar son adicionales.
        const adicionales = partidosZonaBD
          .filter((p) => !utilizados.has(p.id))
          .map((p) => ({
            equipo1: equiposMap[Number(p.id_equipo_1)],
            equipo2: equiposMap[Number(p.id_equipo_2)],
            goles1: String(p.goles_1 ?? ""),
            goles2: String(p.goles_2 ?? ""),
            id_partido: p.id,
            yaGuardado: true,
            adicional: true,
          }))
          .filter((p) => p.equipo1 && p.equipo2);

        return {
          ...zona,
          equipos: equiposZona,
          partidos: [...fixtureFinal, ...adicionales],
        };
      });

      setZonas(zonasConEquipos);

      const mapa = {};

      zonasConEquipos.forEach((z) => {
        mapa[z.id] = z.partidos;
      });

      setPartidosPorZona(mapa);

      // Recuperar interzonales
      const interzonales = partidos
        .filter((p) => p.tipo_partido === "interzonal")
        .map((p) => ({
          equipo1: equiposMap[Number(p.id_equipo_1)],
          equipo2: equiposMap[Number(p.id_equipo_2)],
          goles1: String(p.goles_1 ?? ""),
          goles2: String(p.goles_2 ?? ""),
          id_partido: p.id,
          yaGuardado: true,
          tipo_partido: "interzonal",
        }))
        .filter((p) => p.equipo1 && p.equipo2);

      setPartidosInterzonales(interzonales);

    } catch (error) {
      console.error("Error al traer torneo:", error);
    }
  };

  useEffect(() => {
    traerTorneo();
  }, [id]);

  // ==========================================
  // ACTUALIZAR MARCADOR
  // ==========================================

  const actualizarMarcador = (
    tipo,
    zonaId,
    index,
    campo,
    valor
  ) => {
    if (tipo === "interzonal") {
      setPartidosInterzonales((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, [campo]: valor } : p
        )
      );
      return;
    }

    setPartidosPorZona((prev) => ({
      ...prev,
      [zonaId]: prev[zonaId].map((p, i) =>
        i === index ? { ...p, [campo]: valor } : p
      ),
    }));
  };

  // ==========================================
  // GUARDAR PARTIDO
  // ==========================================

  const guardarPartido = async (
    partido,
    tipo,
    zonaId = null,
    index = null
  ) => {
    try {
      if (
        partido.goles1 === "" ||
        partido.goles2 === "" ||
        Number(partido.goles1) < 0 ||
        Number(partido.goles2) < 0 ||
        !Number.isInteger(Number(partido.goles1)) ||
        !Number.isInteger(Number(partido.goles2))
      ) {
        alert("Ingresá un resultado válido");
        return;
      }

      const payload = {
        id_partido: partido.id_partido || null,
        id_torneo: id,
        id_zona: tipo === "zona" ? zonaId : null,
        id_equipo_1: partido.equipo1.id,
        id_equipo_2: partido.equipo2.id,
        goles_1: Number(partido.goles1),
        goles_2: Number(partido.goles2),
        tipo_partido: tipo,
      };

      const response = await servicio.guardarPartido(payload);

      // Actualizar el ID del partido recién creado.
      const nuevoId =
        response?.id_partido ||
        response?.data?.id_partido;

      if (tipo === "interzonal") {
        setPartidosInterzonales((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  ...p,
                  id_partido: nuevoId || p.id_partido,
                  yaGuardado: true,
                }
              : p
          )
        );
      } else {
        setPartidosPorZona((prev) => ({
          ...prev,
          [zonaId]: prev[zonaId].map((p, i) =>
            i === index
              ? {
                  ...p,
                  id_partido: nuevoId || p.id_partido,
                  yaGuardado: true,
                }
              : p
          ),
        }));
      }

      alert("Partido guardado correctamente");

      await traerTorneo();

    } catch (error) {
      console.error(error);
      alert("Error al guardar el partido");
    }
  };

  // ==========================================
  // AGREGAR PARTIDO ADICIONAL EN UNA ZONA
  // ==========================================

  const agregarPartidoZona = (zona) => {
    const seleccion = nuevoPartidoZona[zona.id] || {};

    if (!seleccion.equipo1 || !seleccion.equipo2) {
      alert("Seleccioná los dos equipos");
      return;
    }

    if (seleccion.equipo1 === seleccion.equipo2) {
      alert("Los equipos deben ser diferentes");
      return;
    }

    const equipo1 = zona.equipos.find(
      (e) => Number(e.id) === Number(seleccion.equipo1)
    );

    const equipo2 = zona.equipos.find(
      (e) => Number(e.id) === Number(seleccion.equipo2)
    );

    if (!equipo1 || !equipo2) return;

    const nuevo = {
      equipo1,
      equipo2,
      goles1: "",
      goles2: "",
      adicional: true,
    };

    setPartidosPorZona((prev) => ({
      ...prev,
      [zona.id]: [...(prev[zona.id] || []), nuevo],
    }));

    setNuevoPartidoZona((prev) => ({
      ...prev,
      [zona.id]: {
        equipo1: "",
        equipo2: "",
      },
    }));
  };

  // ==========================================
  // AGREGAR INTERZONAL
  // ==========================================

  const agregarInterzonal = () => {
    const { equipo1, equipo2 } = nuevoInterzonal;

    if (!equipo1 || !equipo2) {
      alert("Seleccioná los dos equipos");
      return;
    }

    if (equipo1 === equipo2) {
      alert("Los equipos deben ser diferentes");
      return;
    }

    const todosLosEquipos = zonas.flatMap((z) => z.equipos);

    const e1 = todosLosEquipos.find(
      (e) => Number(e.id) === Number(equipo1)
    );

    const e2 = todosLosEquipos.find(
      (e) => Number(e.id) === Number(equipo2)
    );

    if (!e1 || !e2) return;

    const zona1 = zonas.find((z) =>
      z.equipos.some((e) => Number(e.id) === Number(equipo1))
    );

    const zona2 = zonas.find((z) =>
      z.equipos.some((e) => Number(e.id) === Number(equipo2))
    );

    if (!zona1 || !zona2 || zona1.id === zona2.id) {
      alert("El interzonal debe ser entre equipos de distintas zonas");
      return;
    }

    setPartidosInterzonales((prev) => [
      ...prev,
      {
        equipo1: e1,
        equipo2: e2,
        goles1: "",
        goles2: "",
        tipo_partido: "interzonal",
      },
    ]);

    setNuevoInterzonal({
      equipo1: "",
      equipo2: "",
    });
  };

  // ==========================================
  // CALCULAR TABLA DE ZONA
  // Incluye partidos normales, adicionales
  // e interzonales de sus equipos.
  // ==========================================

  const calcularTablaZona = (zona) => {
    const tabla = {};

    zona.equipos.forEach((e) => {
      tabla[e.id] = {
        equipo: e,
        puntos: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
      };
    });

    const partidosZona = partidosPorZona[zona.id] || [];


const todosLosPartidos = [
  ...partidosZona,
  ...partidosInterzonales.filter(
    (p) =>
      tabla[p.equipo1.id] ||
      tabla[p.equipo2.id]
  ),
];

todosLosPartidos.forEach((p) => {
  if (p.goles1 === "" || p.goles2 === "") return;

  const g1 = Number(p.goles1);
  const g2 = Number(p.goles2);

  const e1 = tabla[p.equipo1.id];
  const e2 = tabla[p.equipo2.id];

  // Actualizar equipo 1 si pertenece a esta zona
  if (e1) {
    e1.pj++;
    e1.gf += g1;
    e1.gc += g2;

    if (g1 > g2) {
      e1.pg++;
      e1.puntos += 3;
    } else if (g1 < g2) {
      e1.pp++;
    } else {
      e1.pe++;
      e1.puntos++;
    }
  }

  // Actualizar equipo 2 si pertenece a esta zona
  if (e2) {
    e2.pj++;
    e2.gf += g2;
    e2.gc += g1;

    if (g2 > g1) {
      e2.pg++;
      e2.puntos += 3;
    } else if (g2 < g1) {
      e2.pp++;
    } else {
      e2.pe++;
      e2.puntos++;
    }
  }
});


    Object.values(tabla).forEach((e) => {
      e.dg = e.gf - e.gc;
    });

    return Object.values(tabla).sort((a, b) => {
      if (b.puntos !== a.puntos)
        return b.puntos - a.puntos;

      if (b.dg !== a.dg)
        return b.dg - a.dg;

      return b.gf - a.gf;
    });
  };

  // ==========================================
  // CLASIFICACIÓN GENERAL
  // ==========================================

  const obtenerTablaGeneral = () => {
    const posiciones = [];

    zonas.forEach((zona) => {
      calcularTablaZona(zona).forEach((fila, index) => {
        posiciones.push({
          puesto: index + 1,
          zona: zona.id,
          equipo: fila.equipo,
          puntos: fila.puntos,
          dg: fila.dg,
          gf: fila.gf,
        });
      });
    });

    return posiciones.sort((a, b) => {
      if (a.puesto !== b.puesto)
        return a.puesto - b.puesto;

      if (b.puntos !== a.puntos)
        return b.puntos - a.puntos;

      if (b.dg !== a.dg)
        return b.dg - a.dg;

      return b.gf - a.gf;
    });
  };

  const tablaGeneral = obtenerTablaGeneral();

  const clasificadosGeneral = tablaGeneral.slice(
    0,
    clasificacion
  );

  const clasificados = new Set(
    clasificadosGeneral.map((e) => e.equipo.id)
  );

  const crucesGeneral = [];

  let izquierda = 0;
  let derecha = clasificadosGeneral.length - 1;

  while (izquierda < derecha) {
    crucesGeneral.push({
      local: clasificadosGeneral[izquierda],
      visitante: clasificadosGeneral[derecha],
    });

    izquierda++;
    derecha--;
  }

  // ==========================================
  // GENERAR PLAYOFF
  // ==========================================

  const generarPlayoff = async () => {
    const posiciones = [];

    zonas.forEach((zona) => {
      calcularTablaZona(zona).forEach((fila, index) => {
        posiciones.push({
          puesto: index + 1,
          zona: zona.id,
          equipo: fila.equipo,
          puntos: fila.puntos,
          dg: fila.dg,
          gf: fila.gf,
        });
      });
    });

    posiciones.sort((a, b) => {
      if (a.puesto !== b.puesto)
        return a.puesto - b.puesto;

      if (b.puntos !== a.puntos)
        return b.puntos - a.puntos;

      if (b.dg !== a.dg)
        return b.dg - a.dg;

      return b.gf - a.gf;
    });

    const clasificadosPlayoff = posiciones.slice(
      0,
      clasificacion
    );

    const cruces = [];

    let izq = 0;
    let der = clasificadosPlayoff.length - 1;

    while (izq < der) {
      cruces.push({
        local: clasificadosPlayoff[izq].equipo.id,
        visitante: clasificadosPlayoff[der].equipo.id,
        nombre_local: clasificadosPlayoff[izq].equipo.nombre,
        nombre_visitante: clasificadosPlayoff[der].equipo.nombre,
        siembra_local: izq + 1,
        siembra_visitante: der + 1,
      });

      izq++;
      der--;
    }

    const libre =
      clasificadosPlayoff.length % 2 !== 0
        ? clasificadosPlayoff[
            Math.floor(clasificadosPlayoff.length / 2)
          ]
        : null;

    await servicio.generarPlayoff({
      id_torneo: id,
      clasificados: clasificadosPlayoff,
      cruces,
      libre,
    });

    alert("Playoff generado");
  };

  // ==========================================
  // RENDERIZAR PARTIDO
  // ==========================================

  const renderPartido = (p, index, tipo, zonaId = null) => (
    <Paper
      key={p.id_partido || `${tipo}-${zonaId}-${index}`}
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 2,
        background: p.adicional ? "#fff8e1" : "#f8fafc",
        border: p.adicional
          ? "1px solid #ffcc80"
          : "1px solid #e5e7eb",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
      >
        <Typography
          sx={{
            width: "32%",
            fontSize: 13,
            fontWeight: 600,
            overflowWrap: "anywhere",
          }}
        >
          {p.equipo1.nombre}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5}>
          <input
            type="number"
            min="0"
            value={p.goles1}
            onChange={(e) =>
              actualizarMarcador(
                tipo,
                zonaId,
                index,
                "goles1",
                e.target.value
              )
            }
            style={{
              width: 42,
              height: 34,
              textAlign: "center",
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />

          <Typography fontWeight="bold">-</Typography>

          <input
            type="number"
            min="0"
            value={p.goles2}
            onChange={(e) =>
              actualizarMarcador(
                tipo,
                zonaId,
                index,
                "goles2",
                e.target.value
              )
            }
            style={{
              width: 42,
              height: 34,
              textAlign: "center",
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
        </Box>

        <Typography
          sx={{
            width: "32%",
            textAlign: "right",
            fontSize: 13,
            fontWeight: 600,
            overflowWrap: "anywhere",
          }}
        >
          {p.equipo2.nombre}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" mt={1}>
        <Button
          size="small"
          variant="contained"
          color={p.yaGuardado ? "success" : "primary"}
          onClick={() =>
            guardarPartido(p, tipo, zonaId, index)
          }
        >
          {p.yaGuardado ? "Actualizar resultado" : "Guardar partido"}
        </Button>
      </Box>
    </Paper>
  );

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4">
          Zonas del torneo
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Clasifican</InputLabel>

            <Select
              value={clasificacion}
              label="Clasifican"
              onChange={(e) =>
                setClasificacion(Number(e.target.value))
              }
            >
              {[2, 4, 8, 16, 32].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={async () => {
              await servicio.guardarClasificacion({
                id_torneo: id,
                clasificacion,
              });

              alert("Clasificación guardada");
            }}
          >
            Guardar
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={generarPlayoff}
          >
            Clasificar
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              window.location.href = `/tablastorneo/${id}`;
            }}
          >
            Ver tablas
          </Button>
        </Box>
      </Box>

      {/* =====================================
          CLASIFICACIÓN GENERAL
      ====================================== */}

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>
          Clasificación general
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Equipo</TableCell>
                <TableCell>Zona</TableCell>
                <TableCell align="center">Pts</TableCell>
                <TableCell align="center">DG</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {clasificadosGeneral.map((e, index) => (
                <TableRow key={e.equipo.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{e.equipo.nombre}</TableCell>
                  <TableCell>{e.zona}</TableCell>
                  <TableCell align="center">
                    {e.puntos}
                  </TableCell>
                  <TableCell align="center">
                    {e.dg}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Typography variant="h6" mt={3} mb={2}>
          Cruces generales
        </Typography>

        {crucesGeneral.map((c, index) => (
          <Paper
            key={index}
            sx={{
              p: 1.5,
              mb: 1,
              bgcolor: "#172554",
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography textAlign="center" fontWeight="bold">
              {c.local.equipo.nombre}
            </Typography>

            <Typography textAlign="center" my={0.5}>
              VS
            </Typography>

            <Typography textAlign="center" fontWeight="bold">
              {c.visitante.equipo.nombre}
            </Typography>
          </Paper>
        ))}
      </Paper>

      {/* =====================================
          PARTIDOS INTERZONALES
      ====================================== */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "2px solid #90caf9",
        }}
      >
        <Typography variant="h6" mb={1}>
          Partidos interzonales
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Seleccioná equipos de diferentes zonas. Los resultados
          suman puntos y goles a las tablas de ambas zonas.
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          mb={3}
        >
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Equipo 1</InputLabel>

            <Select
              value={nuevoInterzonal.equipo1}
              label="Equipo 1"
              onChange={(e) =>
                setNuevoInterzonal((prev) => ({
                  ...prev,
                  equipo1: e.target.value,
                }))
              }
            >
              {zonas.map((z) =>
                z.equipos.map((e) => (
                  <MenuItem
                    key={e.id}
                    value={e.id}
                    disabled={
                      Number(e.id) ===
                      Number(nuevoInterzonal.equipo2)
                    }
                  >
                    {e.nombre} - {z.nombre || `Zona ${z.id}`}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Typography fontWeight="bold">VS</Typography>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Equipo 2</InputLabel>

            <Select
              value={nuevoInterzonal.equipo2}
              label="Equipo 2"
              onChange={(e) =>
                setNuevoInterzonal((prev) => ({
                  ...prev,
                  equipo2: e.target.value,
                }))
              }
            >
              {zonas.map((z) =>
                z.equipos.map((e) => (
                  <MenuItem
                    key={e.id}
                    value={e.id}
                    disabled={
                      Number(e.id) ===
                      Number(nuevoInterzonal.equipo1)
                    }
                  >
                    {e.nombre} - {z.nombre || `Zona ${z.id}`}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="info"
            onClick={agregarInterzonal}
          >
            + Agregar interzonal
          </Button>
        </Box>

        {partidosInterzonales.length === 0 && (
          <Typography color="text.secondary">
            Todavía no hay partidos interzonales.
          </Typography>
        )}

        {partidosInterzonales.map((p, index) =>
          renderPartido(p, index, "interzonal")
        )}
      </Paper>

    
{/* =====================================
    ZONAS
====================================== */}

<Box
  sx={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 560px), 1fr))",
    gap: 3,
    alignItems: "start",
  }}
>
  {zonas.map((zona, index) => {
    const tablaZona = calcularTablaZona(zona);

    const seleccion = nuevoPartidoZona[zona.id] || {
      equipo1: "",
      equipo2: "",
    };

    const color = coloresZonas[index % coloresZonas.length];

    return (
      <Paper
        key={zona.id}
        elevation={3}
        sx={{
          minWidth: 0,
          overflow: "hidden",
          borderRadius: 3,
          backgroundColor: color.fondo,
          border: `1px solid ${color.borde}`,
          borderTop: `5px solid ${color.borde}`,
        }}
      >
        {/* ENCABEZADO DE ZONA */}

        <Box
          sx={{
            px: 2.5,
            py: 2,
            backgroundColor: color.encabezado,
            borderBottom: `1px solid ${color.borde}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: color.texto }}
            >
              {zona.nombre || `Zona ${zona.id}`}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: color.texto, opacity: 0.8 }}
            >
              {zona.equipos.length} equipos participantes
            </Typography>
          </Box>

          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.65)",
              color: color.texto,
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            ZONA {index + 1}
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* TABLA */}

          <Typography fontWeight="bold" mb={1.5} color={color.texto}>
            Tabla de posiciones
          </Typography>

          <Box
            sx={{
              overflowX: "auto",
              borderRadius: 2,
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
            }}
          >
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: color.encabezado }}>
                  {["#", "Equipo", "Pts", "PJ", "PG", "PE", "PP", "GF", "GC", "DG"].map(
                    (titulo) => (
                      <TableCell
                        key={titulo}
                        align={titulo === "Equipo" ? "left" : "center"}
                        sx={{
                          fontWeight: "bold",
                          color: color.texto,
                          whiteSpace: "nowrap",
                          px: 1,
                        }}
                      >
                        {titulo}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {tablaZona.map((fila, index) => (
                  <TableRow
                    key={fila.equipo.id}
                    sx={{
                      backgroundColor: clasificados.has(fila.equipo.id)
                        ? "#D8F3DC"
                        : "white",
                      "&:hover": {
                        backgroundColor: "#F5F5F5",
                      },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell sx={{ fontWeight: "bold", minWidth: 130 }}>
                      {fila.equipo.nombre}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {fila.puntos}
                    </TableCell>

                    <TableCell align="center">{fila.pj}</TableCell>
                    <TableCell align="center">{fila.pg}</TableCell>
                    <TableCell align="center">{fila.pe}</TableCell>
                    <TableCell align="center">{fila.pp}</TableCell>
                    <TableCell align="center">{fila.gf}</TableCell>
                    <TableCell align="center">{fila.gc}</TableCell>
                    <TableCell align="center">{fila.dg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: color.borde }} />

          {/* AGREGAR PARTIDO ADICIONAL */}

          <Typography fontWeight="bold" mb={1.5} color={color.texto}>
            Agregar partido adicional
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>Equipo 1</InputLabel>

            <Select
              value={seleccion.equipo1}
              label="Equipo 1"
              onChange={(e) =>
                setNuevoPartidoZona((prev) => ({
                  ...prev,
                  [zona.id]: {
                    ...seleccion,
                    equipo1: e.target.value,
                  },
                }))
              }
            >
              {zona.equipos.map((e) => (
                <MenuItem
                  key={e.id}
                  value={e.id}
                  disabled={Number(e.id) === Number(seleccion.equipo2)}
                >
                  {e.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>Equipo 2</InputLabel>

            <Select
              value={seleccion.equipo2}
              label="Equipo 2"
              onChange={(e) =>
                setNuevoPartidoZona((prev) => ({
                  ...prev,
                  [zona.id]: {
                    ...seleccion,
                    equipo2: e.target.value,
                  },
                }))
              }
            >
              {zona.equipos.map((e) => (
                <MenuItem
                  key={e.id}
                  value={e.id}
                  disabled={Number(e.id) === Number(seleccion.equipo1)}
                >
                  {e.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            onClick={() => agregarPartidoZona(zona)}
            sx={{
              backgroundColor: color.texto,
              "&:hover": {
                backgroundColor: color.texto,
                filter: "brightness(0.85)",
              },
            }}
          >
            + Agregar partido en esta zona
          </Button>

          <Divider sx={{ my: 2.5, borderColor: color.borde }} />

          {/* PARTIDOS */}

          <Typography fontWeight="bold" mb={2} color={color.texto}>
            Partidos de la zona ({(partidosPorZona[zona.id] || []).length})
          </Typography>

          {(partidosPorZona[zona.id] || []).map((p, index) => (
            <React.Fragment
              key={p.id_partido || `nuevo-${zona.id}-${index}`}
            >
              {p.adicional && (
                <Typography
                  variant="caption"
                  color="warning.dark"
                  fontWeight="bold"
                >
                  PARTIDO ADICIONAL / DESEMPATE
                </Typography>
              )}

              {renderPartido(p, index, "zona", zona.id)}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
    );
  })}
</Box>

      <PlayoffView id_torneo={id} />
    </Box>
  );
}
