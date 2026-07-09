import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useParams } from "react-router-dom";
import servicio from "../../services/servicio";

export default function PlayoffView(props) {
  const { id_torneo } = useParams();

  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    cargarPlayoff();
  }, []);

  const cargarPlayoff = async () => {
    try {
      const res = await servicio.traerplayoffs(
        props.id_torneo || id_torneo
      );

      setPartidos(res);
    } catch (error) {
      console.log(error);
    }
  };

  const rondas = [
    "16vos",
    "8vos",
    "Cuartos",
    "Semifinal",
    "Final"
  ];

  const obtenerRonda = (nombre) =>
    partidos.filter(
      (p) => p.instancia === nombre
    );

  return (
    <Box
      sx={{
        p: 3,
        background:
          "linear-gradient(180deg,#0f172a,#111827)",
        minHeight: "100vh",
        color: "white"
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: "bold",
          textAlign: "center"
        }}
      >
        🏆 Playoffs Torneo {id_torneo}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          alignItems: "flex-start",
          pb: 2
        }}
      >
        {rondas.map((ronda) => {
          const lista =
            obtenerRonda(ronda);

          if (!lista.length)
            return null;

          return (
            <Box
              key={ronda}
              sx={{
                minWidth: 280
              }}
            >
              <Typography
                align="center"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  fontSize: 20
                }}
              >
                {ronda}
              </Typography>

              {lista.map((p) => (
                <Paper
                  key={p.id}
                  sx={{
                    p: 2,
                    mb: 3,
                    background:
                      "#1e293b",
                    color: "white",
                    borderRadius: 3,
                    border:
                      p.estado ===
                      "Finalizado"
                        ? "1px solid #22c55e"
                        : "1px solid #334155"
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        "#94a3b8",
                      fontSize: 12,
                      mb: 1
                    }}
                  >
                    Partido{" "}
                    {
                      p.numero_partido
                    }
                  </Typography>

                  <Box
                    sx={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      mb: 1
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight:
                          p.ganador ===
                          p.id_equipo_local
                            ? "bold"
                            : "normal",
                        color:
                          p.ganador ===
                          p.id_equipo_local
                            ? "#22c55e"
                            : "white"
                      }}
                    >
                      {p.nombre_local ||
                        "Por definir"}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight:
                          "bold"
                      }}
                    >
                      {p.goles_local ??
                        "-"}
                    </Typography>
                  </Box>

                  <Divider
                    sx={{
                      my: 1,
                      background:
                        "#475569"
                    }}
                  />

                  <Box
                    sx={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between"
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight:
                          p.ganador ===
                          p.id_equipo_visitante
                            ? "bold"
                            : "normal",
                        color:
                          p.ganador ===
                          p.id_equipo_visitante
                            ? "#22c55e"
                            : "white"
                      }}
                    >
                      {p.nombre_visitante ||
                        "Por definir"}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight:
                          "bold"
                      }}
                    >
                      {p.goles_visitante ??
                        "-"}
                    </Typography>
                  </Box>

                  {p.estado ===
                    "Finalizado" && (
                    <Box
                      sx={{
                        mt: 2,
                        display:
                          "flex",
                        justifyContent:
                          "center"
                      }}
                    >
                      <Chip
                        icon={
                          <EmojiEventsIcon />
                        }
                        label={
                          p.nombre_ganador
                        }
                        color="success"
                      />
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}