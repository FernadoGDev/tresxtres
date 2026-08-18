import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
} from "@mui/material";

import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LogoutIcon from "@mui/icons-material/Logout";

import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const botones = [
    {
      texto: "Torneos",
      ruta: "/admintorneos",
      icono: <EmojiEventsIcon />,
    },
    {
      texto: "Equipos",
      ruta: "/adminequipos",
      icono: <GroupsIcon />,
    },
    {
      texto: "Jugadores",
      ruta: "/adminjugadores",
      icono: <PersonIcon />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("loggedNoteAppUser");

    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background:
          "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
      }}
    >
      <Toolbar>

        {/* Logo / título */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            gap: 1,
          }}
        >
          <SportsBasketballIcon />

          <Typography fontWeight="bold">
            Liga de Básquet
          </Typography>
        </Box>

        {/* Botones */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >

          {botones.map((b) => (
            <Button
              key={b.ruta}
              startIcon={b.icono}
              onClick={() => navigate(b.ruta)}
              variant={
                location.pathname === b.ruta
                  ? "contained"
                  : "text"
              }
              sx={{
                borderRadius: 3,
                color: "#fff",
                bgcolor:
                  location.pathname === b.ruta
                    ? "#f97316"
                    : "transparent",

                "&:hover": {
                  bgcolor: "#ea580c",
                },
              }}
            >
              {b.texto}
            </Button>
          ))}

          {/* Logout */}
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              color: "#fff",
              ml: 1,
              border: "1px solid rgba(255,255,255,0.3)",

              "&:hover": {
                bgcolor: "#dc2626",
                borderColor: "#dc2626",
              },
            }}
          >
            Salir
          </Button>

        </Box>

      </Toolbar>
    </AppBar>
  );
}