import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import servicio from "../../services/servicio";

export default function CrearTorneo() {
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
const navigate = useNavigate();
  const guardarTorneo = async () => {
  if (!nombre.trim()) {
    alert("Ingrese el nombre del torneo");
    return;
  }

  try {
    setGuardando(true);

    const response = await servicio.crearTorneosolo({
      nombre,
    });

    console.log(response);

    alert("Torneo creado correctamente");

    navigate("/admintorneos");

  } catch (error) {
    console.error(error);
    alert("Error al crear torneo");
  } finally {
    setGuardando(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 500,
          p: 4,
        }}
      >
        <Typography variant="h4" mb={3}>
          Crear Torneo
        </Typography>

        <TextField
          fullWidth
          label="Nombre del torneo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={guardarTorneo}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Crear Torneo"}
        </Button>
      </Paper>
    </Box>
  );
}