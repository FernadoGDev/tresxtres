import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider
} from "@mui/material";

import { useParams } from "react-router-dom";
import servicio from "../../services/servicio";


export default function PlayoffView(props) {

  const { id_torneo } = useParams();

  const [partidos,setPartidos] = useState([]);


  useEffect(()=>{

    cargarPlayoff();

  },[]);



  const cargarPlayoff = async()=>{

    try {
console.log("Cargando playoffs para el torneo:", id_torneo);
console.log(props.id_torneo)
      const res = await servicio.traerplayoffs(props.id_torneo || id_torneo);

      setPartidos(res);

    } catch(error){
      console.log(error);
    }

  }



 const guardarResultado = async (partido) => {
  try {
    await servicio.guardarresultadoPlayoff({
      id_partido: partido.id,
      goles_local: Number(partido.goles_local),
      goles_visitante: Number(partido.goles_visitante)
    });

    cargarPlayoff();
  } catch (error) {
    console.log(error);
  }
};


  const cambiarResultado=(id,campo,valor)=>{


    setPartidos(prev=>
      prev.map(p=>
        p.id===id
        ?
        {
          ...p,
          [campo]:valor
        }
        :
        p
      )
    )

  }



  const rondas=[
    "16vos",
    "8vos",
    "Cuartos",
    "Semifinal",
    "Final"
  ];


  const obtenerRonda=(nombre)=>{

    return partidos.filter(
      p=>p.instancia===nombre
    );

  }



  return (

<Box
sx={{
padding:3,
background:"#101010",
minHeight:"100vh",
color:"white"
}}
>


<Typography
variant="h4"
sx={{
mb:4,
fontWeight:"bold"
}}
>
🏆 Playoffs Torneo {id_torneo}
</Typography>



<Box
sx={{
display:"flex",
gap:3,
overflowX:"auto",
alignItems:"center"
}}
>


{
rondas.map(ronda=>{


const lista=obtenerRonda(ronda);


return (

<Box
key={ronda}
sx={{
minWidth:260
}}
>


<Typography
align="center"
sx={{
fontWeight:"bold",
mb:2,
fontSize:20
}}
>
{ronda}
</Typography>



{
lista.map(p=>{


return (

<Paper
key={p.id}
sx={{
padding:2,
mb:3,
background:"#1e1e1e",
color:"white",
borderRadius:3,
boxShadow:3
}}
>


<Typography
fontSize={13}
color="gray"
>
Partido {p.numero_partido}
</Typography>



<Box
sx={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<Typography
sx={{
fontWeight:
p.ganador===p.id_equipo_local
?"bold"
:"normal",

color:
p.ganador===p.id_equipo_local
?"#4caf50"
:"white"
}}
>
{p.nombre_local || "Por definir"}
</Typography>


<TextField

size="small"

value={
p.goles_local ?? ""
}

onChange={(e)=>
cambiarResultado(
p.id,
"goles_local",
e.target.value
)
}

sx={{
width:55,
input:{
color:"white"
}
}}

/>


</Box>




<Divider
sx={{
my:1,
background:"gray"
}}
/>



<Box
sx={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<Typography

sx={{
fontWeight:
p.ganador===p.id_equipo_visitante
?"bold"
:"normal",

color:
p.ganador===p.id_equipo_visitante
?"#4caf50"
:"white"
}}

>

{p.nombre_visitante || "Por definir"}

</Typography>


<TextField

size="small"

value={
p.goles_visitante ?? ""
}

onChange={(e)=>
cambiarResultado(
p.id,
"goles_visitante",
e.target.value
)
}

sx={{
width:55,
input:{
color:"white"
}
}}

/>


</Box>



<Button

fullWidth

variant="contained"

sx={{
mt:2
}}

onClick={()=>
guardarResultado(p)
}

>

Guardar

</Button>



{
p.nombre_ganador &&
<Typography
align="center"
sx={{
mt:1,
color:"#4caf50",
fontWeight:"bold"
}}
>
🏆 {p.nombre_ganador}
</Typography>
}



</Paper>


)


})
}



</Box>


)

})
}



</Box>


</Box>


  )
}