import React, { useEffect } from "react";
import Nav from "../../components/admin/Nav";
import Formulario from "../../components/admin/torneos";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("loggedNoteAppUser");

    // No está logueado
    if (!usuarioGuardado) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);

      // No tiene nivel 11
      if (Number(usuario.nivel) !== 11) {
        localStorage.removeItem("loggedNoteAppUser");
        navigate("/login", { replace: true });
      }

    } catch (error) {
      console.error("Error leyendo usuario:", error);

      localStorage.removeItem("loggedNoteAppUser");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <Nav />
      <Formulario />
    </>
  );
};

export default HeroSection;