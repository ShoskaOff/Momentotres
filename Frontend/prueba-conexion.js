import { obtenerServicios } from '../Database/serviciosService.js';

async function test() {
    const lista = await obtenerServicios();
    console.log("Servicios obtenidos:", lista);
}
test();