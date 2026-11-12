
import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import banner from "../assets/Banner.jpeg";

export default function Formulario() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        p: { xs: 2, sm: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #4CAF50 0%, #1E88E5 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* BANNER */}
        <Box
          component="img"
          src={banner}
          alt="Cuqui Calvano"
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 3,
            boxShadow: "0 8px 25px rgba(0,0,0,.35)",
          }}
        />

        {/* MENSAJE */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            textAlign: "center",
            color: "#fff",
            background:
              "linear-gradient(180deg, #1e293b, #0f172a)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "3.5rem", sm: "4.5rem" },
              mb: 1,
            }}
          >
            🏀
          </Typography>

          <Typography
            sx={{
              color: "#f97316",
              fontWeight: 900,
              fontSize: { xs: "1.8rem", sm: "2.3rem" },
              letterSpacing: 1,
              mb: 2,
            }}
          >
            ¡INSCRIPCIÓN CERRADA!
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.05rem", sm: "1.2rem" },
              fontWeight: "bold",
              mb: 2,
            }}
          >
            ¡Gracias por tu interés!
          </Typography>

          <Typography
            sx={{
              color: "#cbd5e1",
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              lineHeight: 1.8,
              mb: 3,
            }}
          >
            Actualmente completamos el cupo de inscriptos.
            <br />
            ¡Te esperamos para las próximas ediciones!
          </Typography>

          <Box
            sx={{
              height: 3,
              width: 70,
              mx: "auto",
              mb: 3,
              borderRadius: 5,
              background:
                "linear-gradient(90deg, #f97316, #fbbf24)",
            }}
          />

          <Typography
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              mb: 1,
            }}
          >
            ¡Mantenete al tanto!
          </Typography>

          <Typography
            sx={{
              color: "#cbd5e1",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              mb: 3,
            }}
          >
            Seguinos en las redes sociales de Cuqui Calvano
            o visitá nuestra página web para enterarte
            de las próximas novedades.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            href="https://cuquicalvano.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#fff",
              background:
                "linear-gradient(90deg, #f97316, #ea580c)",
              "&:hover": {
                background:
                  "linear-gradient(90deg, #ea580c, #c2410c)",
              },
            }}
          >
            VISITAR CUQUICALVANO.COM
          </Button>
        </Paper>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.75rem",
            textAlign: "center",
          }}
        >
          © Cuqui Calvano
        </Typography>
      </Box>
    </Box>
  );
}
