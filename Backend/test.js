import { obtenerServicios, crearServicio } from './serviciosService.js';

async function test() {
    console.log("Iniciando prueba de conexión...");
    
    // Probamos primero la lectura (Read)
    const servicios = await obtenerServicios();
    console.log("Servicios en la base de datos:", servicios);

    // Probamos la creación (Create) - Solo descomenta la siguiente línea para probar
    // await crearServicio('Limpieza Dental', 150000, 'Limpieza profunda con ultrasonido');
    // console.log("Prueba de creación realizada.");
}

test();