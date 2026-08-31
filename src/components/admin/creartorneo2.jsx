import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  Grid,
  Card,
  CardContent
} from "@mui/material";

import { useParams } from "react-router-dom";

import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

import servicio from "../../services/servicio";

export default function ConfigurarTorneo() {
  const { id } = useParams();

  const [step, setStep] = useState(1);

  const [equipos, setEquipos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [cantidadZonas, setCantidadZonas] = useState(2);

  const [zonas, setZonas] = useState([]);

  const [modo, setModo] = useState("");

  // ================================
  // ANIMACIÓN
  // ================================

  const [animando, setAnimando] = useState(false);
  const [equipoActual, setEquipoActual] = useState(null);
  const [zonaActual, setZonaActual] = useState(null);

  const [faseAnimacion, setFaseAnimacion] =
    useState("idle");

  const [sorteoTerminado, setSorteoTerminado] =
    useState(false);

  // =====================================
  // TRAER EQUIPOS
  // =====================================

  useEffect(() => {
    traerEquipos();
  }, [id]);

  const traerEquipos = async () => {
    try {
      const response =
        await servicio.traerEquipos2(id);

      console.log(response);

      setEquipos(response || []);

      // Seleccionar automáticamente
      // los clasificados
      const clasificados = (response || []).filter(
        (x) =>
          x.clasificado === 1 ||
          x.clasificado === true
      );

      setSeleccionados(clasificados);
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================
  // CONFIRMAR INVITACIÓN
  // =====================================

  const confirmarInvitacion = async (idEquipo) => {
    try {
      await servicio.confirmarInvitacion({
        id_torneo: id,
        id_equipo: idEquipo
      });

      await traerEquipos();

      alert("Equipo confirmado");
    } catch (error) {
      console.error(error);
      alert("Error al confirmar");
    }
  };

  // =====================================
  // SELECCIONAR / DESELECCIONAR
  // =====================================

  const toggleEquipo = (equipo) => {
    const existe = seleccionados.find(
      (e) => e.id === equipo.id
    );

    if (existe) {
      setSeleccionados(
        seleccionados.filter(
          (e) => e.id !== equipo.id
        )
      );
    } else {
      setSeleccionados([
        ...seleccionados,
        equipo
      ]);
    }
  };

  // =====================================
  // RANDOM
  // =====================================

  const shuffle = (array) => {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [arr[i], arr[j]] = [
        arr[j],
        arr[i]
      ];
    }

    return arr;
  };

  // =====================================
  // GENERAR ZONAS MANUAL
  // =====================================

  const generarZonasFlex = (
    equiposLista,
    zonasCant
  ) => {
    const total = equiposLista.length;

    const base = Math.floor(
      total / zonasCant
    );

    const extra = total % zonasCant;

    const resultado = [];

    let index = 0;

    for (let i = 0; i < zonasCant; i++) {
      const cantidad =
        base + (i < extra ? 1 : 0);

      resultado.push(
        equiposLista.slice(
          index,
          index + cantidad
        )
      );

      index += cantidad;
    }

    return resultado;
  };

  // =====================================
  // ESPERAR
  // =====================================

  const esperar = (ms) =>
    new Promise((resolve) =>
      setTimeout(resolve, ms)
    );

  // =====================================
  // SORTEO ANIMADO
  // =====================================

  const hacerSorteo = async () => {
    setModo("random");
    setAnimando(true);
    setSorteoTerminado(false);

    const mezcla = shuffle(seleccionados);

    const nuevasZonas = Array.from(
      { length: cantidadZonas },
      () => []
    );

    setZonas(nuevasZonas);

    // Esperamos un poco para que
    // aparezca la pantalla de sorteo
    await esperar(500);

    for (
      let i = 0;
      i < mezcla.length;
      i++
    ) {
      const equipo = mezcla[i];

      const zona =
        i % cantidadZonas;

      // ---------------------------------
      // EQUIPO ACTUAL
      // ---------------------------------

      setEquipoActual(equipo);
      setZonaActual(zona);

      // Reiniciar animación
      setFaseAnimacion("entrada");

      // ---------------------------------
      // PELOTA ENTRA
      // ---------------------------------

      await esperar(1200);

      // ---------------------------------
      // PELOTA SE DETIENE
      // ---------------------------------

      setFaseAnimacion("pelota");

      await esperar(700);

      // ---------------------------------
      // TRANSFORMAR PELOTA EN NOMBRE
      // ---------------------------------

      setFaseAnimacion("nombre");

      await esperar(1200);

      // ---------------------------------
      // PELOTA / NOMBRE VIAJA AL ARO
      // ---------------------------------

      setFaseAnimacion("viajando");

      await esperar(1100);

      // ---------------------------------
      // COLOCAR EQUIPO
      // ---------------------------------

      nuevasZonas[zona].push(equipo);

      setZonas(
        nuevasZonas.map((z) => [...z])
      );

      // ---------------------------------
      // GOL / ARO
      // ---------------------------------

      setFaseAnimacion("gol");

      await esperar(700);

      // ---------------------------------
      // LIMPIAR
      // ---------------------------------

      setFaseAnimacion("idle");

      await esperar(300);
    }

    // =====================================
    // FIN
    // =====================================

    setEquipoActual(null);
    setZonaActual(null);

    setAnimando(false);
    setSorteoTerminado(true);
    setFaseAnimacion("terminado");
  };

  // =====================================
  // DRAG & DROP
  // =====================================

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceZona = Number(
      result.source.droppableId
    );

    const destZona = Number(
      result.destination.droppableId
    );

    const sourceItems = [
      ...zonas[sourceZona]
    ];

    const destItems =
      sourceZona === destZona
        ? sourceItems
        : [...zonas[destZona]];

    const [moved] =
      sourceItems.splice(
        result.source.index,
        1
      );

    destItems.splice(
      result.destination.index,
      0,
      moved
    );

    const nuevas = [...zonas];

    nuevas[sourceZona] = sourceItems;
    nuevas[destZona] = destItems;

    setZonas(nuevas);
  };

  // =====================================
  // GUARDAR
  // =====================================

  const guardarConfiguracion =
    async () => {
      try {
        const payload = {
          id_torneo: id,

          cantidad_zonas:
            cantidadZonas,

          zonas: zonas.map(
            (z, i) => ({
              nombre: `Zona ${
                i + 1
              }`,

              equipos: z.map(
                (eq) => ({
                  id_equipo: eq.id
                })
              )
            })
          )
        };

        console.log(payload);

        await servicio.guardarZonasTorneo(
          payload
        );

        alert(
          "Configuración guardada correctamente"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Error al guardar"
        );
      }
    };

  // =====================================
  // INVITAR
  // =====================================

  const invitarEquipo = (
    idEquipo
  ) => {
    console.log(
      "Invitar",
      idEquipo
    );

    // Después:
    // servicio.invitarEquipo(id, idEquipo)
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <Box className="torneo-container">
      <style>
        {`

        * {
          box-sizing: border-box;
        }

        .torneo-container {
          min-height: 100vh;
          padding: 30px;
          background:
            radial-gradient(
              circle at top,
              #173d4d 0%,
              #08161c 55%,
              #04090c 100%
            );
          color: white;
          overflow-x: hidden;
        }

        /* =====================================
           TITULOS
        ===================================== */

        .titulo-torneo {
          font-weight: 900 !important;
          letter-spacing: 1px;
        }

        /* =====================================
           PANTALLA DEL SORTEO
        ===================================== */

        .sorteo-stage {
          position: relative;
          width: 100%;
          height: 430px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 30px;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,.08),
              rgba(0,0,0,.25)
            );

          border: 1px solid
            rgba(255,255,255,.08);

          box-shadow:
            inset 0 0 80px
              rgba(0,0,0,.5),
            0 20px 70px
              rgba(0,0,0,.35);

          margin-bottom: 30px;
        }

        .sorteo-luces {
          position: absolute;
          width: 500px;
          height: 500px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255,140,0,.12),
              transparent 65%
            );

          animation:
            pulsoLuz 2s infinite;
        }

        @keyframes pulsoLuz {

          0%,100% {
            transform: scale(.9);
            opacity: .5;
          }

          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        /* =====================================
           PELOTA
        ===================================== */

        .pelota-container {
          position: relative;

          width: 145px;
          height: 145px;

          z-index: 20;
        }

        .pelota {
          width: 145px;
          height: 145px;

          border-radius: 50%;

          position: relative;

          background:
            radial-gradient(
              circle at 30% 25%,
              #ffcc75 0%,
              #f7941d 18%,
              #e76b00 58%,
              #9d3500 100%
            );

          box-shadow:
            inset -15px -20px 30px
              rgba(0,0,0,.35),

            inset 12px 10px 20px
              rgba(255,255,255,.18),

            0 20px 35px
              rgba(0,0,0,.55);

          overflow: hidden;
        }

        /* textura de la pelota */

        .pelota::before {
          content: "";

          position: absolute;

          inset: 0;

          border-radius: 50%;

          background-image:
            radial-gradient(
              rgba(0,0,0,.18) 1px,
              transparent 1px
            );

          background-size: 5px 5px;

          opacity: .35;
        }

        /* líneas del balón */

        .linea-1 {
          position: absolute;

          width: 180px;
          height: 80px;

          border: 7px solid #171717;

          border-radius: 50%;

          top: 32px;
          left: -18px;

          transform: rotate(-15deg);
        }

        .linea-2 {
          position: absolute;

          width: 65px;
          height: 180px;

          border: 7px solid #171717;

          border-radius: 50%;

          top: -18px;
          left: 40px;

          transform: rotate(25deg);
        }

        .linea-3 {
          position: absolute;

          width: 170px;
          height: 60px;

          border: 7px solid #171717;

          border-radius: 50%;

          top: 62px;
          left: -12px;

          transform: rotate(25deg);
        }

        /* =====================================
           ANIMACIÓN ENTRADA
        ===================================== */

        .anim-entrada {
          animation:
            pelotaEntrada
            1.2s
            cubic-bezier(.2,.8,.3,1);
        }

        @keyframes pelotaEntrada {

          0% {
            transform:
              translateY(-400px)
              rotate(-720deg)
              scale(.4);

            opacity: 0;
          }

          55% {
            transform:
              translateY(40px)
              rotate(360deg)
              scale(1.1);

            opacity: 1;
          }

          75% {
            transform:
              translateY(-25px)
              rotate(500deg)
              scale(.95);
          }

          90% {
            transform:
              translateY(10px)
              rotate(620deg)
              scale(1.02);
          }

          100% {
            transform:
              translateY(0)
              rotate(720deg)
              scale(1);
          }
        }

        /* =====================================
           ROTACIÓN
        ===================================== */

        .anim-pelota {
          animation:
            rotacionPelota
            .9s
            linear infinite;
        }

        @keyframes rotacionPelota {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        /* =====================================
           EXPLOSIÓN
        ===================================== */

        .explosion {
          position: absolute;

          width: 220px;
          height: 220px;

          border-radius: 50%;

          border:
            5px solid
            rgba(255,145,0,.8);

          animation:
            explosion
            .7s
            ease-out
            forwards;
        }

        @keyframes explosion {

          0% {
            transform: scale(.2);
            opacity: 1;
          }

          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        /* =====================================
           NOMBRE DEL EQUIPO
        ===================================== */

        .equipo-revelado {
          position: relative;

          z-index: 30;

          padding:
            20px 45px;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #e9eef0
            );

          color: #071014;

          font-size:
            clamp(24px, 4vw, 48px);

          font-weight: 900;

          text-transform: uppercase;

          text-align: center;

          box-shadow:
            0 15px 45px
              rgba(0,0,0,.55);

          animation:
            revelarNombre
            .8s
            cubic-bezier(.2,1.4,.4,1);
        }

        @keyframes revelarNombre {

          0% {
            transform:
              scale(.1)
              rotateY(180deg);

            opacity: 0;
          }

          60% {
            transform:
              scale(1.15)
              rotateY(-10deg);

            opacity: 1;
          }

          100% {
            transform:
              scale(1)
              rotateY(0deg);

            opacity: 1;
          }
        }

        /* =====================================
           PELOTA / NOMBRE VIAJANDO
        ===================================== */

        .viajando {
          animation:
            viajarAro
            1.1s
            cubic-bezier(.5,0,.8,.3)
            forwards;
        }

        @keyframes viajarAro {

          0% {
            transform:
              translateY(0)
              scale(1);
            opacity: 1;
          }

          45% {
            transform:
              translate(
                0,
                -100px
              )
              scale(.8);

            opacity: 1;
          }

          100% {
            transform:
              translate(
                0,
                170px
              )
              scale(.25);

            opacity: 0;
          }
        }

        /* =====================================
           ARO PRINCIPAL
        ===================================== */

        .aro-wrapper {
          position: relative;

          width: 210px;
          height: 190px;

          margin:
            10px
            auto
            20px;

          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tablero {
          width: 120px;
          height: 85px;

          border:
            7px solid white;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.22),
              rgba(255,255,255,.04)
            );

          position: absolute;

          top: 0;

          box-shadow:
            0 5px 15px
              rgba(0,0,0,.4);
        }

        .tablero-cuadro {
          position: absolute;

          width: 55px;
          height: 35px;

          border:
            4px solid white;

          left: 50%;
          bottom: 12px;

          transform:
            translateX(-50%);
        }

        .aro {
          position: absolute;

          top: 68px;

          width: 115px;
          height: 28px;

          border:
            7px solid
            #ff5b22;

          border-radius: 50%;

          box-shadow:
            0 0 20px
              rgba(255,91,34,.5);

          z-index: 5;
        }

        /* red */

        .red {
          position: absolute;

          top: 80px;

          width: 95px;
          height: 85px;

          border-left:
            2px solid
            rgba(255,255,255,.75);

          border-right:
            2px solid
            rgba(255,255,255,.75);

          clip-path:
            polygon(
              0 0,
              100% 0,
              82% 100%,
              18% 100%
            );

          background:
            repeating-linear-gradient(
              90deg,
              transparent 0,
              transparent 10px,
              rgba(255,255,255,.45) 11px,
              transparent 12px
            );

          z-index: 2;
        }

        /* =====================================
           ARO CUANDO RECIBE EQUIPO
        ===================================== */

        .aro-gol {
          animation:
            aroGol
            .7s
            ease;
        }

        @keyframes aroGol {

          0% {
            transform:
              scale(1);
          }

          30% {
            transform:
              scale(1.25)
              rotate(-3deg);
          }

          60% {
            transform:
              scale(.9)
              rotate(3deg);
          }

          100% {
            transform:
              scale(1);
          }
        }

        /* =====================================
           CARDS DE ZONA
        ===================================== */

        .zona-card {
          min-height: 280px;

          border-radius: 20px !important;

          background:
            linear-gradient(
              180deg,
              #173b47,
              #0b2028
            ) !important;

          border:
            1px solid
            rgba(255,255,255,.1);

          color: white !important;

          box-shadow:
            0 15px 40px
              rgba(0,0,0,.3);
        }

        .zona-titulo {
          font-weight: 900 !important;

          text-align: center;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        /* =====================================
           EQUIPO DENTRO DE ZONA
        ===================================== */

        .equipo-zona {
          padding: 12px;

          margin-top: 8px;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #00c6ff,
              #0072ff
            );

          color: white;

          font-weight: 800;

          text-align: center;

          box-shadow:
            0 5px 15px
              rgba(0,0,0,.25);

          cursor: grab;

          animation:
            entrarEquipoZona
            .5s
            ease;
        }

        @keyframes entrarEquipoZona {

          0% {
            transform:
              translateY(-40px)
              scale(.5);

            opacity: 0;
          }

          70% {
            transform:
              translateY(8px)
              scale(1.05);
          }

          100% {
            transform:
              translateY(0)
              scale(1);

            opacity: 1;
          }
        }

        /* =====================================
           TEXTO SORTEANDO
        ===================================== */

        .sorteando-texto {
          font-size: 18px;

          font-weight: 700;

          margin-top: 15px;

          animation:
            textoPulso
            1s
            infinite;
        }

        @keyframes textoPulso {

          0%,100% {
            opacity: .5;
          }

          50% {
            opacity: 1;
          }
        }

        /* =====================================
           ESTRELLAS / PARTICULAS
        ===================================== */

        .particula {
          position: absolute;

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            #ff9d00;

          box-shadow:
            0 0 12px
              #ff9d00;

          animation:
            particula
            1.5s
            infinite;
        }

        .p1 {
          left: 15%;
          top: 30%;
        }

        .p2 {
          left: 80%;
          top: 25%;

          animation-delay:
            .3s;
        }

        .p3 {
          left: 20%;
          top: 75%;

          animation-delay:
            .6s;
        }

        .p4 {
          left: 75%;
          top: 70%;

          animation-delay:
            .9s;
        }

        @keyframes particula {

          0% {
            transform:
              scale(.5)
              translateY(0);

            opacity: 0;
          }

          50% {
            opacity: 1;
          }

          100% {
            transform:
              scale(1.5)
              translateY(-40px);

            opacity: 0;
          }
        }

        /* =====================================
           RESPONSIVE
        ===================================== */

        @media(max-width:600px) {

          .torneo-container {
            padding: 15px;
          }

          .sorteo-stage {
            height: 360px;
          }

          .pelota-container,
          .pelota {
            width: 110px;
            height: 110px;
          }

          .equipo-revelado {
            padding:
              15px 22px;

            font-size: 25px;
          }

          .aro-wrapper {
            transform:
              scale(.85);
          }
        }

        `}
      </style>

      {/* =====================================================
          TITULO
      ===================================================== */}

      <Typography
        variant="h4"
        mb={3}
        className="titulo-torneo"
      >
        🏀 Configurar Torneo
      </Typography>

      {/* =====================================================
          STEP 1
      ===================================================== */}

      {step === 1 && (
        <>
          <Typography
            variant="h6"
            mb={2}
          >
            Equipos participantes
          </Typography>

          <Table
            component={Paper}
            sx={{
              borderRadius: 2,
              overflow: "hidden"
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell />

                <TableCell>
                  Equipo
                </TableCell>

                <TableCell>
                  Confirmación
                </TableCell>

                <TableCell>
                  Confirmar
                </TableCell>

                <TableCell>
                  Invitación
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {equipos.map((eq) => (
                <TableRow
                  key={eq.id}
                >
                  <TableCell>
                    <Checkbox
                      checked={seleccionados.some(
                        (x) =>
                          x.id === eq.id
                      )}
                      onChange={() =>
                        toggleEquipo(eq)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    {eq.nombre}  <b>({eq.edicion} edicion)</b>
                  </TableCell>

                  <TableCell>
                    <Typography
                      color={
                        eq.confirmado
                          ? "success.main"
                          : "error.main"
                      }
                      fontWeight="bold"
                    >
                      {eq.confirmado
                        ? "Confirmado"
                        : "Pendiente"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {eq.confirmado ? (
                      <Button
                        color="success"
                        variant="contained"
                        disabled
                      >
                        Confirmado
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() =>
                          confirmarInvitacion(
                            eq.id
                          )
                        }
                      >
                        Confirmar
                      </Button>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        invitarEquipo(eq.id)
                      }
                    >
                      Invitar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            sx={{ mt: 3 }}
            variant="contained"
            disabled={
              seleccionados.length < 2
            }
            onClick={() =>
              setStep(2)
            }
          >
            Continuar
          </Button>
        </>
      )}

      {/* =====================================================
          STEP 2
      ===================================================== */}

      {step === 2 && (
        <>
          <Typography
            variant="h6"
          >
            Cantidad de zonas
          </Typography>

          <Box
            mt={2}
            mb={3}
            display="flex"
            gap={1}
            flexWrap="wrap"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (n) => (
                <Button
                  key={n}
                  variant={
                    cantidadZonas === n
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() =>
                    setCantidadZonas(n)
                  }
                >
                  {n}
                </Button>
              )
            )}
          </Box>

          <Button
            onClick={() =>
              setStep(1)
            }
          >
            Volver
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              setStep(3)
            }
          >
            Continuar
          </Button>
        </>
      )}

      {/* =====================================================
          STEP 3
      ===================================================== */}

      {step === 3 && (
        <>
          <Typography
            variant="h6"
          >
            Tipo de sorteo
          </Typography>

          <Box
            mt={3}
            display="flex"
            gap={2}
            flexWrap="wrap"
          >
            {/* ======================================
                SORTEO AUTOMÁTICO
            ====================================== */}

            <Button
              variant="contained"
              size="large"
              disabled={animando}
              onClick={() => {
                // Primero mostramos STEP 4
                // para que la animación sea visible
                setModo("random");
                setZonas(
                  Array.from(
                    {
                      length:
                        cantidadZonas
                    },
                    () => []
                  )
                );

                setStep(4);

                // Luego arrancamos
                // el sorteo
                hacerSorteo();
              }}
            >
              🎲 Sorteo automático
            </Button>

            {/* ======================================
                MANUAL
            ====================================== */}

            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setModo("manual");

                setZonas(
                  generarZonasFlex(
                    seleccionados,
                    cantidadZonas
                  )
                );

                setSorteoTerminado(
                  true
                );

                setStep(4);
              }}
            >
              ✋ Manual
            </Button>
          </Box>
        </>
      )}

      {/* =====================================================
          STEP 4
      ===================================================== */}

      {step === 4 && (
        <>
          {/* =================================================
              PANTALLA DE ANIMACIÓN
          ================================================= */}

          {modo === "random" && (
            <Box className="sorteo-stage">

              <div className="sorteo-luces" />

              <div className="particula p1" />
              <div className="particula p2" />
              <div className="particula p3" />
              <div className="particula p4" />

              {/* ======================================
                  PELOTA
              ====================================== */}

              {equipoActual &&
                (
                  faseAnimacion ===
                    "entrada" ||
                  faseAnimacion ===
                    "pelota"
                ) && (
                  <Box
                    className="pelota-container"
                    sx={{
                      position:
                        "relative"
                    }}
                  >
                    <Box
                      className={
                        faseAnimacion ===
                        "entrada"
                          ? "pelota anim-entrada"
                          : "pelota anim-pelota"
                      }
                    >
                      <div className="linea-1" />
                      <div className="linea-2" />
                      <div className="linea-3" />
                    </Box>
                  </Box>
                )}

              {/* ======================================
                  EXPLOSIÓN
              ====================================== */}

              {faseAnimacion ===
                "nombre" && (
                <div className="explosion" />
              )}

              {/* ======================================
                  NOMBRE
              ====================================== */}

              {equipoActual &&
                (
                  faseAnimacion ===
                    "nombre" ||
                  faseAnimacion ===
                    "viajando"
                ) && (
                  <Box
                    className={
                      faseAnimacion ===
                      "viajando"
                        ? "equipo-revelado viajando"
                        : "equipo-revelado"
                    }
                  >
                    {equipoActual.nombre}
                  </Box>
                )}

              {/* ======================================
                  GOL
              ====================================== */}

              {faseAnimacion ===
                "gol" && (
                <Box
                  className="equipo-revelado"
                  sx={{
                    background:
                      "linear-gradient(135deg,#00e676,#00a152)",
                    color: "white"
                  }}
                >
                  🏀 ¡ADENTRO!
                </Box>
              )}

              {/* ======================================
                  TEXTO
              ====================================== */}

              {equipoActual &&
                !sorteoTerminado && (
                  <Typography
                    className="sorteando-texto"
                  >
                    Sorteando equipo...
                  </Typography>
                )}

              {equipoActual &&
                zonaActual !==
                  null && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 800,
                      fontSize: 20
                    }}
                  >
                    Zona{" "}
                    {zonaActual + 1}
                  </Typography>
                )}

              {sorteoTerminado && (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900
                  }}
                >
                  🏆 ¡SORTEO COMPLETADO!
                </Typography>
              )}
            </Box>
          )}

          {/* =================================================
              TITULO ZONAS
          ================================================= */}

          <Typography
            variant="h5"
            mb={2}
            sx={{
              fontWeight: 900
            }}
          >
            🏀 Zonas
          </Typography>

          {/* =================================================
              ZONAS
          ================================================= */}

          <DragDropContext
            onDragEnd={onDragEnd}
          >
            <Grid
              container
              spacing={3}
            >
              {zonas.map(
                (zona, i) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={i}
                  >
                    <Droppable
                      droppableId={i.toString()}
                    >
                      {(
                        provided
                      ) => (
                        <Card
                          className="zona-card"
                          ref={
                            provided.innerRef
                          }
                          {...provided.droppableProps}
                        >
                          <CardContent>

                            {/* ==================================
                                TITULO
                            ================================== */}

                            <Typography
                              variant="h6"
                              className="zona-titulo"
                            >
                              Zona {i + 1}
                            </Typography>

                            {/* ==================================
                                ARO
                            ================================== */}

                            <Box
                              className={
                                faseAnimacion ===
                                  "gol" &&
                                zonaActual ===
                                  i
                                  ? "aro-wrapper aro-gol"
                                  : "aro-wrapper"
                              }
                            >
                              <div className="tablero">
                                <div className="tablero-cuadro" />
                              </div>

                              <div className="aro" />

                              <div className="red" />
                            </Box>

                            {/* ==================================
                                EQUIPOS
                            ================================== */}

                            <Box>
                              {zona.map(
                                (
                                  equipo,
                                  index
                                ) => (
                                  <Draggable
                                    key={
                                      equipo.id
                                    }
                                    draggableId={String(
                                      equipo.id
                                    )}
                                    index={
                                      index
                                    }
                                  >
                                    {(
                                      provided
                                    ) => (
                                      <Box
                                        ref={
                                          provided.innerRef
                                        }
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="equipo-zona"
                                      >
                                        {equipo.nombre}
                                      </Box>
                                    )}
                                  </Draggable>
                                )
                              )}

                              {
                                provided.placeholder
                              }
                            </Box>

                          </CardContent>
                        </Card>
                      )}
                    </Droppable>
                  </Grid>
                )
              )}
            </Grid>
          </DragDropContext>

          {/* =================================================
              BOTONES
          ================================================= */}

          {!animando && (
            <Box mt={3}>

              <Button
                onClick={() =>
                  setStep(3)
                }
              >
                Volver
              </Button>

              <Button
                variant="contained"
                color="success"
                sx={{
                  ml: 2
                }}
                onClick={
                  guardarConfiguracion
                }
              >
                💾 Guardar Zonas
              </Button>

            </Box>
          )}
        </>
      )}
    </Box>
  );
}