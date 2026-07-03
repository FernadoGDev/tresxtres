import React from "react";
import Nav from "../../components/admin/Nav";

import Formulario from "../../components/admin/listaequipos";
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
const HeroSection = () => {
    const navigate = useNavigate();
  return (
   <>
    <Nav/>

   <Formulario/>
   </>
  );
};

export default HeroSection;