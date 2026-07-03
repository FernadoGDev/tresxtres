

import Ruta1 from '../pages/formulario/index';
import Jugadores from '../pages/adminjugadores';
import Torneos from '../pages/admintorneos';
import Creartorneo from '../pages/admincreartorneo';
import Admintorneo from '../pages/admintorneo';
import Admintorneotablas from '../pages/admintablatorneo';
import Adminequipos from '../pages/adminequipos';


const Rutas = [
 
    { path: '/', element: <Ruta1 /> },
{ path: '/formulario', element: <Ruta1 /> },
{ path: '/adminjugadores', element: <Jugadores /> },
{ path: '/admintorneos', element: <Torneos /> },
{ path: '/adminequipos', element: <Adminequipos /> },
{ path: '/admincreartorneo', element: <Creartorneo /> },
{ path: '/admintorneo/:id', element: <Admintorneo /> },
{ path: '/tablastorneo/:id', element: <Admintorneotablas /> }

    ];


export default Rutas;