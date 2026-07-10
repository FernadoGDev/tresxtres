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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { useParams } from "react-router-dom";
import servicio from "../../services/servicio";
import PlayoffView from "./playoffs";

export default function TorneoView() {
  const { id } = useParams();
const [clasificacion, setClasificacion] = useState(0);
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


const generarPlayoff = async () => {

  const posiciones = [];

  zonas.forEach((zona) => {

    const tabla = calcularTablaZona(zona);

    tabla.forEach((fila, index) => {

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

  // Ordena:
  // primero todos los primeros,
  // luego todos los segundos,
  // luego todos los terceros...
  posiciones.sort((a, b) => {

    if (a.puesto !== b.puesto)
      return a.puesto - b.puesto;

    if (b.puntos !== a.puntos)
      return b.puntos - a.puntos;

    if (b.dg !== a.dg)
      return b.dg - a.dg;

    return b.gf - a.gf;

  });

  const clasificados = posiciones.slice(0, clasificacion);

  const cruces = [];

  let izquierda = 0;
  let derecha = clasificados.length - 1;

  while (izquierda < derecha) {

    cruces.push({

      local: clasificados[izquierda].equipo.id,
      visitante: clasificados[derecha].equipo.id,

      nombre_local: clasificados[izquierda].equipo.nombre,
      nombre_visitante: clasificados[derecha].equipo.nombre,

      siembra_local: izquierda + 1,
      siembra_visitante: derecha + 1,

    });

    izquierda++;
    derecha--;

  }

  let libre = null;

  if (clasificados.length % 2 !== 0) {
    libre = clasificados[Math.floor(clasificados.length / 2)];
  }

  console.log("Clasificados");
  console.table(clasificados);

  console.log("Cruces");
  console.table(cruces);

  if (libre) {
    console.log("Libre:", libre.equipo.nombre);
  }

  await servicio.generarPlayoff({

    id_torneo: id,

    clasificados,

    cruces,

    libre,

  });

  alert("Playoff generado");

};
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
    const partidosActualizados = {};

zonasConEquipos.forEach((z) => {
  partidosActualizados[z.id] = z.partidos;
});

setPartidosPorZona(partidosActualizados);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    traerTorneo();
  }, [id]);


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

  zona.partidos.forEach((p) => {
    if (p.goles1 === "" || p.goles2 === "") return;

    const g1 = Number(p.goles1);
    const g2 = Number(p.goles2);

    const e1 = tabla[p.equipo1.id];
    const e2 = tabla[p.equipo2.id];

    e1.pj++;
    e2.pj++;

    e1.gf += g1;
    e1.gc += g2;

    e2.gf += g2;
    e2.gc += g1;

    if (g1 > g2) {
      e1.pg++;
      e2.pp++;
      e1.puntos += 3;
    } else if (g2 > g1) {
      e2.pg++;
      e1.pp++;
      e2.puntos += 3;
    } else {
      e1.pe++;
      e2.pe++;
      e1.puntos++;
      e2.puntos++;
    }

    e1.dg = e1.gf - e1.gc;
    e2.dg = e2.gf - e2.gc;
  });

  return Object.values(tabla).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
};

const obtenerClasificados = () => {

  const posiciones = [];

  zonas.forEach((zona) => {

    const tabla = calcularTablaZona(zona);

    tabla.forEach((fila, index) => {

      posiciones.push({
        puesto: index + 1,
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

  return new Set(
    posiciones
      .slice(0, clasificacion)
      .map((x) => x.equipo.id)
  );

};

const clasificados = obtenerClasificados();
const tablaGeneral = [];

zonas.forEach((zona) => {
  const tabla = calcularTablaZona({
    ...zona,
    partidos: partidosPorZona[zona.id] || zona.partidos,
  });

  tabla.forEach((fila, index) => {
    tablaGeneral.push({
      puesto: index + 1,
      equipo: fila.equipo,
      puntos: fila.puntos,
      dg: fila.dg,
      gf: fila.gf,
    });
  });
});

tablaGeneral.sort((a, b) => {
  if (a.puesto !== b.puesto)
    return a.puesto - b.puesto;

  if (b.puntos !== a.puntos)
    return b.puntos - a.puntos;

  if (b.dg !== a.dg)
    return b.dg - a.dg;

  return b.gf - a.gf;
});

const clasificadosGeneral =
  tablaGeneral.slice(0, clasificacion);

const crucesGeneral = [];

let izquierda = 0;
let derecha =
  clasificadosGeneral.length - 1;

while (izquierda < derecha) {
  crucesGeneral.push({
    local: clasificadosGeneral[izquierda],
    visitante:
      clasificadosGeneral[derecha],
  });

  izquierda++;
  derecha--;
}


  return (
    <Box p={3}>
  
  
<Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
>
  <Typography variant="h4">
    Zonas del torneo
  </Typography>
<Box display="flex" gap={2} alignItems="center">

<Select
    value={clasificacion}
    onChange={(e) => setClasificacion(Number(e.target.value))}
>
    <MenuItem value={2}>2</MenuItem>
    <MenuItem value={4}>4</MenuItem>
    <MenuItem value={8}>8</MenuItem>
    <MenuItem value={16}>16</MenuItem>
    <MenuItem value={32}>32</MenuItem>
</Select>

<Button
    variant="contained"
    onClick={async()=>{

        await servicio.guardarClasificacion({
            id_torneo:id,
            clasificacion
        });

        alert("Cantidad guardada");

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

</Box>
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
  <Box
  display="flex"
  gap={3}
  alignItems="flex-start"
>
  <Paper
  sx={{
    width: 380,
    p: 3,
    borderRadius: 3,
    boxShadow: 3,
    position: "sticky",
    top: 20,
  }}
>
  <Typography variant="h6" mb={2}>
    Clasificación General
  </Typography>

  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>#</TableCell>
        <TableCell>Equipo</TableCell>
        <TableCell align="center">
          Pts
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {clasificadosGeneral.map(
        (e, index) => (
          <TableRow
            key={e.equipo.id}
            sx={{
              background:
                index % 2 === 0
                  ? "#f8f9fa"
                  : "#fff",
            }}
          >
            <TableCell>
              {index + 1}
            </TableCell>

            <TableCell
              sx={{
                fontWeight: "bold",
              }}
            >
              {e.equipo.nombre}
            </TableCell>

            <TableCell align="center">
              {e.puntos}
            </TableCell>
          </TableRow>
        )
      )}
    </TableBody>
  </Table>

  <Typography
    variant="h6"
    mt={4}
    mb={2}
  >
    Cruces
  </Typography>

  {crucesGeneral.map((c, index) => (
    <Paper
      key={index}
      sx={{
        p: 1.5,
        mb: 1,
        background:
          "linear-gradient(90deg,#0f172a,#1e293b)",
        color: "#fff",
        borderRadius: 2,
      }}
    >
      <Typography
        fontWeight="bold"
        textAlign="center"
      >
        {index + 1}°
        {" "}
        {c.local.equipo.nombre}
      </Typography>

      <Typography
        textAlign="center"
        sx={{
          opacity: 0.7,
          my: 0.5,
        }}
      >
        VS
      </Typography>

      <Typography
        fontWeight="bold"
        textAlign="center"
      >
        {
          clasificadosGeneral.length -
          index
        }
        °
        {" "}
        {c.visitante.equipo.nombre}
      </Typography>
    </Paper>
  ))}
</Paper>
 {zonas.map((zona) => {

const tablaZona = calcularTablaZona({
  ...zona,
  partidos: partidosPorZona[zona.id] || zona.partidos,
});


  return (

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
            <TableCell>#</TableCell>
            <TableCell>Equipo</TableCell>
            <TableCell align="center">Pts</TableCell>
            <TableCell align="center">PJ</TableCell>
            <TableCell align="center">PG</TableCell>
            <TableCell align="center">PE</TableCell>
            <TableCell align="center">PP</TableCell>
            <TableCell align="center">GF</TableCell>
            <TableCell align="center">GC</TableCell>
            <TableCell align="center">DG</TableCell>
        </TableRow>
    </TableHead>

    <TableBody>

        {tablaZona.map((fila, index)=>(

            <TableRow
                key={fila.equipo.id}
                sx={{
                    backgroundColor: clasificados.has(fila.equipo.id)
                        ? "#c8e6c9"
                        : "inherit"
                }}
            >

                <TableCell>{index+1}</TableCell>

                <TableCell
                    sx={{
                        fontWeight: clasificados.has(fila.equipo.id)
                            ? "bold"
                            : "normal"
                    }}
                >
                    {fila.equipo.nombre}
                </TableCell>

                <TableCell align="center">{fila.puntos}</TableCell>
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
        await traerTorneo();
alert("Guardado");
        }}
      >
        💾
      </Button>
    </Paper>
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