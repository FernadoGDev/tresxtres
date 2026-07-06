import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import banner from "../assets/banner.jpeg";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import servicio1 from "../services/servicio"
const jugadorVacio = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
  barrio: "",
  direccion: "",
  fechaNacimiento: null,
  confirmado: false,
  editando: false,
};

export default function Formulario() {
  const [equipo, setEquipo] = useState("");
  const [jugadores, setJugadores] = useState([{ ...jugadorVacio }]);
const [seleccionCapitan, setSeleccionCapitan] = useState(false);
const [capitan, setCapitan] = useState(null);
const [errores, setErrores] = useState({});
  // 🎨 estilos inputs oscuros
const inputStyles = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "#020617",
    borderRadius: 2,

    "& input": {
      color: "#fff",           // texto de la fecha
      WebkitTextFillColor: "#fff", // necesario en algunos navegadores
    },

    "& fieldset": {
      borderColor: "#475569",
    },
    "&:hover fieldset": {
      borderColor: "#f97316",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#22c55e",
    },

    "& .MuiSvgIcon-root": {
      color: "#fff", // ícono del calendario
    },
  },

  "& .MuiInputLabel-root": {
    color: "#fff",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#22c55e",
  },

  "& .MuiFormHelperText-root": {
    color: "#cbd5e1",
  },
};
const handleChangeJugador = (index, field, value) => {
  const nuevos = [...jugadores];
  nuevos[index][field] = value;
  setJugadores(nuevos);

  setErrores(prev => ({
    ...prev,
    [index]: {
      ...prev[index],
      [field]: false,
    },
  }));
};
const confirmarJugador = async (index) => {
  const nuevos = [...jugadores];
  const j = nuevos[index];

const erroresJugador = {
  nombre: !j.nombre,
  apellido: !j.apellido,
  dni: !j.dni,
  telefono: !j.telefono,
  email: !j.email,
  barrio: !j.barrio,
  direccion: !j.direccion,
  fechaNacimiento: !j.fechaNacimiento,
};

  const tieneErrores = Object.values(erroresJugador).some(Boolean);

  if (tieneErrores) {
    setErrores(prev => ({
      ...prev,
      [index]: erroresJugador,
    }));
    return;
  }

  // si está todo bien quitamos los errores
  setErrores(prev => ({
    ...prev,
    [index]: {},
  }));
  // ============================
  // 1. Verificar repetido en el mismo equipo
  // ============================
  const repetido = jugadores.some(
    (jugador, i) =>
      i !== index &&
      jugador.confirmado &&
      jugador.dni === j.dni
  );

  if (repetido) {
    alert("Ese jugador ya fue agregado a este equipo.");
    return;
  }

  try {

    // ============================
    // 2. Verificar en la base de datos
    // ============================
    const existe = await servicio1.verificarJugador(j.dni);

    if (existe.registrado) {
      alert(
        `El Dni ya está registrado en otro equipo.`
      );
      return;
    }

    // ============================
    // Confirmar jugador
    // ============================
    nuevos[index].confirmado = true;
    nuevos[index].editando = false;

    if (jugadores.length < 5 && index === jugadores.length - 1) {
      nuevos.push({ ...jugadorVacio });
    }

    setJugadores(nuevos);

  } catch (error) {
    console.error(error);
    alert("No se pudo verificar el jugador.");
  }
};

  const editarJugador = (index) => {
    const nuevos = [...jugadores];
    nuevos[index].editando = true;
    setJugadores(nuevos);
  };

  const eliminarJugador = (index) => {
    const nuevos = jugadores.filter((_, i) => i !== index);

    // si borrás todos, dejamos uno vacío
    if (nuevos.length === 0) {
      setJugadores([{ ...jugadorVacio }]);
    } else {
      setJugadores(nuevos);
    }
  };

  const jugadoresConfirmados = jugadores.filter(j => j.confirmado).length;
const handleSubmit = async () => {
  if (jugadoresConfirmados < 3 || !equipo) return;

  try {
   const jugadoresValidos = jugadores
  .filter(j => j.confirmado)
  .map(j => ({
    nombre: j.nombre,
    apellido: j.apellido,
    dni: j.dni,
    fechaNacimiento: j.fechaNacimiento,
    telefono: j.telefono,
    email: j.email,
    barrio: j.barrio,
    direccion: j.direccion,
  }));

   const payload = {
  equipo,
  capitan,
  jugadores: jugadoresValidos,
};

    await servicio1.enviarequipo(payload);

  alert("Equipo registrado correctamente 🏀");

setEquipo("");
setJugadores([{ ...jugadorVacio }]);
setCapitan(null);
setSeleccionCapitan(false);

  } catch (error) {
  console.error(error);

  // ✅ error con detalle (DNIs duplicados)
  if (error?.detalle) {
    error.detalle.forEach(d => {
      alert(d.mensaje);
    });
    return;
  }

  // ✅ error simple del backend
  if (error?.error) {
    alert(error.error);
    return;
  }

  // ❌ fallback
  alert("Error al enviar el equipo");
}
};
if (seleccionCapitan) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        background:
          "linear-gradient(135deg, #4CAF50 0%, #1E88E5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
     <Typography
  sx={{
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "bold",
    mb: 1,
    textAlign: "center",
    animation: "fadeIn 0.8s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1.5,
  }}
>
 
   ⓒ


  Elegí el Capitán del Equipo
</Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.75rem",
          textAlign: "center",
          mb: 4,
          maxWidth: 400,
        }}
      >
        El capitán será responsable del equipo y de transmitir
        la información de los partidos a sus compañeros.
      </Typography>

      {jugadores
        .filter(j => j.confirmado)
        .map((j, index) => (
          <Paper
            key={index}
            onClick={() => setCapitan(j.dni)}
            sx={{
              width: "100%",
              maxWidth: 500,
              p: 2,
              mb: 2,
              cursor: "pointer",
              borderRadius: 4,
              textAlign: "center",

              background:
                capitan === j.dni
                  ? "linear-gradient(90deg,#f59e0b,#f97316)"
                  : "linear-gradient(180deg,#1e293b,#0f172a)",

              color: "#fff",

              transform:
                capitan === j.dni
                  ? "scale(1.05)"
                  : "scale(1)",

              transition: "all .3s",

              animation: `fadeIn .5s ease ${index * 0.1}s both`,
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {j.nombre} {j.apellido}
            </Typography>

            {capitan === j.dni && (
              <Typography
                sx={{
                  color: "#fff",
                  mt: 1,
                  fontWeight: "bold",
                }}
              >
                ⓒ CAPITÁN
              </Typography>
            )}
          </Paper>
        ))}

      <Button
        variant="contained"
        disabled={!capitan}
        onClick={handleSubmit}
        sx={{
          mt: 3,
          bgcolor: "#f97316",
          px: 5,
          py: 1.5,
          fontSize: "1.1rem",
        }}
      >
        Confirmar equipo
      </Button>
      <Button
  variant="outlined"
  onClick={() => {
    setSeleccionCapitan(false);
    setCapitan(null); // opcional
  }}
  sx={{
    mt: 2,
    borderColor: "#fff",
    color: "#fff",
    px: 5,
    py: 1.5,
    fontSize: "1rem",
    "&:hover": {
      borderColor: "#f97316",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
  }}
>
  ← Volver a editar
</Button>
    </Box>
  );
}
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: "100vh",
          p: 2,
          background: "linear-gradient(135deg, #4CAF50 0%, #1E88E5 100%)",

          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          "@keyframes pulse": {
            "0%": { transform: "scale(1)", opacity: 1 },
            "50%": { transform: "scale(1.1)", opacity: 0.7 },
            "100%": { transform: "scale(1)", opacity: 1 },
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 500,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* TITULO */}
       <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    mb: 2,
  }}
>
  <Box
    component="img"
    src={banner}
    alt="Banner"
    sx={{
      width: "100%",
      maxWidth: 500,
      height: "auto",
      borderRadius: 3,
      boxShadow: "0 8px 25px rgba(0,0,0,.35)",
    }}
  />
</Box>

          {/* EQUIPO */}
        <Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    py: 1,
    background: "linear-gradient(135deg, #4CAF50 0%, #1E88E5 100%)",
  }}
>
  <TextField
    label="Nombre del equipo"
    value={equipo}
    onChange={(e) => setEquipo(e.target.value)}
    fullWidth
    
    sx={inputStyles}
  />
</Box>

          {/* JUGADORES */}
          {jugadores.map((jugador, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                borderRadius: 4,
                background: "linear-gradient(180deg, #1e293b, #0f172a)",
                opacity: jugador.confirmado && !jugador.editando ? 0.6 : 1,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
              }}
            >
              {/* BOTÓN BORRAR */}
              <IconButton
                onClick={() => eliminarJugador(index)}
                sx={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  color: "#ef4444",
                  zIndex: 3,
                }}
              >
                <DeleteIcon />
              </IconButton>

              <Typography sx={{ color: "#f97316", mb: 1 }}>
                Jugador {index + 1}
              </Typography>

              {/* OVERLAY */}
              {jugador.confirmado && !jugador.editando && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(3px)",
                    animation: "fadeIn 0.4s ease",
                    zIndex: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#22c55e",
                      fontWeight: "bold",
                      fontSize: "2rem",
                      textAlign: "center",
                      animation: "pulse 1.2s infinite",
                    }}
                  >
                    ✔ REGISTRADO
                  </Typography>
                </Box>
              )}

              <Box display="flex" flexDirection="column" gap={1}>
                <TextField
                  label="Nombre"
                  value={jugador.nombre}
                  onChange={(e) =>
                    handleChangeJugador(index, "nombre", e.target.value)
                  }
                   error={errores[index]?.nombre}
  helperText={errores[index]?.nombre ? "Ingrese el nombre" : ""}
                  disabled={jugador.confirmado && !jugador.editando}
                  fullWidth
                  sx={inputStyles}
                />

                <TextField
                  label="Apellido"
                  value={jugador.apellido}
                  onChange={(e) =>
                    handleChangeJugador(index, "apellido", e.target.value)
                  }
                   error={errores[index]?.apellido}
  helperText={errores[index]?.apellido ? "Ingrese el apellido" : ""}
                  disabled={jugador.confirmado && !jugador.editando}
                  fullWidth
                  sx={inputStyles}
                />

                <TextField
                  label="DNI"
                  type="number"
                  value={jugador.dni}
                  onChange={(e) =>
                    handleChangeJugador(index, "dni", e.target.value)
                  }
                   error={errores[index]?.dni}
  helperText={errores[index]?.dni ? "Ingrese el DNI" : ""}
                  disabled={jugador.confirmado && !jugador.editando}
                  fullWidth
                  sx={inputStyles}
                />

         <DatePicker
  label="Fecha de nacimiento"
  value={jugador.fechaNacimiento}
  onChange={(newValue) =>
    handleChangeJugador(index, "fechaNacimiento", newValue)
  }
  format="DD/MM/YYYY"
  disabled={jugador.confirmado && !jugador.editando}
  slotProps={{
    textField: {
      variant: "outlined",
      fullWidth: true,
      error: errores[index]?.fechaNacimiento,
      helperText: errores[index]?.fechaNacimiento
        ? "Seleccione la fecha de nacimiento"
        : "",
      sx: {
        ...inputStyles,
        "& .MuiOutlinedInput-root": {
          backgroundColor: "#020617",
          color: "#fff",
          "& input": {
            color: "#fff",
            WebkitTextFillColor: "#fff",
          },
          "& fieldset": {
            borderColor: "#475569",
          },
          "&:hover fieldset": {
            borderColor: "#f97316",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#22c55e",
          },
        },
        "& .MuiSvgIcon-root": {
          color: "#fff",
        },
      },
    },
  }}
/><br />
    <TextField
                  label="Telefono de contacto"
                  type="number"
                  value={jugador.telefono}
                  onChange={(e) =>
                    handleChangeJugador(index, "telefono", e.target.value)
                  }
                   error={errores[index]?.telefono} 
  helperText={errores[index]?.telefono ? "Ingrese el teléfono" : ""}
                  disabled={jugador.confirmado && !jugador.editando}
                  fullWidth
                  sx={inputStyles}
                />
<TextField
  label="Barrio"
  value={jugador.barrio}
  onChange={(e) =>
    handleChangeJugador(index, "barrio", e.target.value)
  }
   error={errores[index]?.barrio}
  disabled={jugador.confirmado && !jugador.editando}
  fullWidth
  inputProps={{ maxLength: 140 }}
helperText={
  errores[index]?.barrio
    ? "Ingrese el barrio"
    : `${jugador.barrio.length}/140`
}
  sx={inputStyles}
/>

<TextField
  label="Dirección"
  value={jugador.direccion}
  onChange={(e) =>
    handleChangeJugador(index, "direccion", e.target.value)
  }
    error={errores[index]?.direccion}
  disabled={jugador.confirmado && !jugador.editando}
  fullWidth
  inputProps={{ maxLength: 140 }}
  helperText={
    errores[index]?.direccion
      ? "Ingrese la dirección"
      : `${jugador.direccion.length}/140`
  }
  sx={inputStyles}
/>

                <TextField
  label="Email"
  type="email"
  value={jugador.email}
  onChange={(e) =>
    handleChangeJugador(index, "email", e.target.value)
  }
   error={errores[index]?.email}
  helperText={errores[index]?.email ? "Ingrese el email" : ""}
  disabled={jugador.confirmado && !jugador.editando}
  fullWidth
  sx={inputStyles}
/>



                {/* BOTONES */}
                {!jugador.confirmado || jugador.editando ? (
                  <Button
                    variant="contained"
                    onClick={() => confirmarJugador(index)}
                    sx={{
                      bgcolor: "#f97316",
                      "&:hover": { bgcolor: "#ea580c" },
                    }}
                  >
                    {jugador.editando
                      ? "Guardar cambios"
                      : "Confirmar jugador"}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => editarJugador(index)}
                    sx={{
                      borderColor: "#22c55e",
                      color: "#22c55e",
                    }}
                  >
                    Editar
                  </Button>
                )}
              </Box>
            </Paper>
          ))}

          {/* FINAL */}
<Button
  variant="contained"
  disabled={jugadoresConfirmados < 3 || !equipo}
  onClick={() => setSeleccionCapitan(true)}
>
  Finalizar equipo ({jugadoresConfirmados}/5)
</Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}