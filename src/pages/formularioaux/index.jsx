import React from "react";

import Formulario from "../../components/form";
import Lleno from "../../components/formulariolleno";
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
const HeroSection = () => {
    const navigate = useNavigate();
  return (
   <>
  
   <Formulario/>
   </>
  );
};

export default HeroSection;