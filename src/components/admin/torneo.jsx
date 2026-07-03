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
  Button
} from "@mui/material";
import { useParams } from "react-router-dom";
import servicio from "../../services/servicio";

export default function TorneoView() {
  const { id } = useParams();

  const [zonas, setZonas] = useState([]);
  const [partidosPorZona, setPartidosPorZona] = useState({});

  // 🔥 generar combinaciones
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

  const traerTorneo = async () => {
  try {
    const response = await servicio.traerTorneo(id);

    const {
      zonas = [],
      participaciones = [],
      equipos = [],
      partidos = [], // 👈 nuevo
    } = response;

    const equiposPlanos = equipos.flatMap((e) =>
      Array.isArray(e) ? e : [e]
    );

    const equiposMap = {};
    equiposPlanos.forEach((e) => {
      equiposMap[Number(e.id)] = e;
    });

    // 🔥 mapa de partidos existentes
    const partidosMap = {};
    partidos.forEach((p) => {
      const key = `${p.id_zona}-${p.id_equipo_1}-${p.id_equipo_2}`;
      partidosMap[key] = p;
    });

    const zonasConEquipos = zonas.map((zona) => {
      const equiposZona = participaciones
        .filter((p) => Number(p.id_zona) === Number(zona.id))
        .map((p) => equiposMap[Number(p.id_equipo)])
        .filter(Boolean);

      // 🔥 generar partidos
      const partidosGenerados = generarPartidos(equiposZona);

      // 🔥 merge con los guardados
      const partidosFinales = partidosGenerados.map((p) => {
        const key = `${zona.id}-${p.equipo1.id}-${p.equipo2.id}`;
        const existente = partidosMap[key];

        if (existente) {
          return {
            ...p,
            goles1: existente.goles_1,
            goles2: existente.goles_2,
            yaGuardado: true, // 🔥 flag clave
          };
        }

        return p;
      });

      return {
        ...zona,
        equipos: equiposZona,
        partidos: partidosFinales,
      };
    });

    setZonas(zonasConEquipos);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    traerTorneo();
  }, [id]);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Zonas del torneo
      </Typography>
<Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
>
  <Typography variant="h4">
    Zonas del torneo
  </Typography>

  <Button
    variant="contained"
    color="success"
    onClick={() => {
      window.location.href = `/tablastorneo/${id}`;
    }}
  >
    Ver tablas
  </Button>
</Box>
      <Box display="flex" flexWrap="wrap" gap={3}>
        {zonas.map((zona) => (
         <Paper
  key={zona.id}
  sx={{
    p: 3,
    minWidth: 350,
    borderRadius: 3,
    boxShadow: 3,
    transition: "0.2s",
    "&:hover": {
      boxShadow: 6,
    },
  }}
>
            <Typography variant="h6" mb={2}>
              {zona.nombre || `Zona ${zona.id}`}
            </Typography>

            {/* TABLA DE EQUIPOS */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Equipo</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {zona.equipos?.length > 0 ? (
                  zona.equipos.map((equipo, index) => (
                    <TableRow key={equipo?.id || index}>
                      <TableCell>
                        {equipo?.nombre || "Sin nombre"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>Sin equipos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* BOTÓN GENERAR PARTIDOS */}
            <Box mt={2}>
            <Button
  fullWidth
  variant="outlined"
  onClick={() => {
    const nuevos = generarPartidos(zona.equipos);

    // 🔥 merge con los del backend
    const partidosMezclados = nuevos.map((p) => {
      const existente = zonas
        .find((z) => z.id === zona.id)
        ?.partidos?.find(
          (pp) =>
            pp.equipo1.id === p.equipo1.id &&
            pp.equipo2.id === p.equipo2.id
        );

      if (existente) {
        return {
          ...p,
          goles1: existente.goles1,
          goles2: existente.goles2,
          id_partido: existente.id_partido || existente.id, // opcional
        };
      }

      return p;
    });

    setPartidosPorZona((prev) => ({
      ...prev,
      [zona.id]: partidosMezclados,
    }));
  }}
>
  Generar partidos
</Button>
            </Box>

            {/* PARTIDOS */}
           <Box mt={3}>
  {partidosPorZona[zona.id]?.map((p, index) => (
    <Paper
      key={index}
      sx={{
        p: 1,
        mb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography sx={{ width: 120, fontWeight: 500 }}>
        {p.equipo1.nombre}
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <input
          style={{
            width: 40,
            textAlign: "center",
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
          value={p.goles1}
          onChange={(e) => {
            const val = e.target.value;

            setPartidosPorZona((prev) => {
              const copia = [...prev[zona.id]];
              copia[index].goles1 = val;
              return { ...prev, [zona.id]: copia };
            });
          }}
        />

        <Typography fontWeight="bold">-</Typography>

        <input
          style={{
            width: 40,
            textAlign: "center",
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
          value={p.goles2}
          onChange={(e) => {
            const val = e.target.value;

            setPartidosPorZona((prev) => {
              const copia = [...prev[zona.id]];
              copia[index].goles2 = val;
              return { ...prev, [zona.id]: copia };
            });
          }}
        />
      </Box>

      <Typography sx={{ width: 120, fontWeight: 500 }}>
        {p.equipo2.nombre}
      </Typography>

      <Button
        variant="contained"
        size="small"
        sx={{ ml: 1 }}
        onClick={async () => {
          const partido = partidosPorZona[zona.id][index];

          const payload = {
            id_torneo: id,
            id_zona: zona.id,
            id_equipo_1: partido.equipo1.id,
            id_equipo_2: partido.equipo2.id,
            goles_1: partido.goles1,
            goles_2: partido.goles2,
          };

          await servicio.guardarPartido(payload);
          alert("Guardado");
        }}
      >
        💾
      </Button>
    </Paper>
  ))}
</Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}