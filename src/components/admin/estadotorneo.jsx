import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import servicio from "../../services/servicio";

import CrearZonas from "./creartorneo2";
import VerZonas from "./torneo";

export default function TorneoAdmin() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [tieneZonas, setTieneZonas] = useState(false);

  useEffect(() => {
    cargarEstado();
  }, [id]);

  const cargarEstado = async () => {
    try {
      const response = await servicio.verificarEstadoTorneo(id);

      setTieneZonas(response.tieneZonas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {tieneZonas ? (
        <VerZonas idTorneo={id} />
      ) : (
        <CrearZonas idTorneo={id} />
      )}
    </>
  );
}