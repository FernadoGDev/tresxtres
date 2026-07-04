import axios from "axios"


const API = import.meta.env.VITE_API_URL;


const baseUrl = API+'tresxtres/'




const enviarequipo = async (config) => {
  try {
    const { data } = await axios.post(baseUrl + "equipo", config);
    return data;

  } catch (error) {
    // 🔥 si el backend mandó error (ej: DNI duplicado)
    if (error.response) {
      return Promise.reject(error.response.data);
    }

    // 🔥 error de red u otro
    return Promise.reject({
      error: "Error de conexión con el servidor",
    });
  }
};


const traerEquipos = async (datos) => {
console.log(baseUrl)
  // const data = await axios.post('http://localhost:4000/signupp', datos)
  const { data } = await axios.get(baseUrl + 'equipos-con-jugadores', datos)
  return data

}

const traerJugadores = async (datos) => {

  // const data = await axios.post('http://localhost:4000/signupp', datos)
  const { data } = await axios.get(baseUrl + 'traerJugadores', datos)
  return data

}


const traerTorneos = async (datos) => {

  // const data = await axios.post('http://localhost:4000/signupp', datos)
  const { data } = await axios.get(baseUrl + 'traertorneos', datos)
  return data



}

const crearTorneo = (data) => {
  return axios.post(baseUrl + "torneos", data);
};




const crearTorneosolo = (data) => {
  return axios.post(baseUrl + "crearTorneo", data);
};



const traerTorneo = async (id) => {
  const { data } = await axios.get(`${baseUrl}traertorneo/${id}`);
  return data;
};

const traertablas = async (id) => {
  const { data } = await axios.get(`${baseUrl}traertablas/${id}`);
  return data;
};


const guardarPartido = async (datos) => {

 const { data } = await axios.post(`${baseUrl}guardarpartido/`, datos);

 return data;
};


const verificarEstadoTorneo = async (idTorneo) => {
  const res = await axios.get(`${baseUrl}torneos/${idTorneo}/estado`);
  return res.data;
};

const guardarZonasTorneo = async (zonas) => {
  const { data } = await axios.post(`${baseUrl}guardarZonasTorneo`,  zonas );
  return data;
};


const traerEquipos2 = async (id_torneo) => {
  const response = await axios.get(
    `${baseUrl}traerEquipos2/${id_torneo}`
  );

  return response.data;
};


const verificarJugador = async (dni) => {
  console.log(dni)
  console.log(`${baseUrl}verificarjugador`)
  const res = await axios.post(`${baseUrl}verificarjugador`, {
    dni,
  });

  return res.data;
};



const confirmarInvitacion = async (data) => {
  const response = await axios.post(
    `${baseUrl}confirmarInvitacion`,
    data
  );

  return response.data;
};

export default {verificarJugador, confirmarInvitacion, traerEquipos2, guardarZonasTorneo, verificarEstadoTorneo, crearTorneosolo, traerJugadores, crearTorneo,traerEquipos, enviarequipo,traerTorneos, traerTorneo, guardarPartido, traertablas}