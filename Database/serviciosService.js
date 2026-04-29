// Importa tu cliente de Supabase (ajusta la ruta según donde guardes este nuevo archivo)
import { supabase } from './supabaseClient.js';

// 1. LEER (READ): Obtener todos los servicios
export async function obtenerServicios() {
    const { data, error } = await supabase
        .from('servicios')
        .select('*');
    
    if (error) {
        console.error("Error al traer servicios:", error);
        return [];
    }
    return data;
}

// 2. CREAR (CREATE): Agregar un nuevo servicio
export async function crearServicio(nombre, precio, descripcion) {
    const { data, error } = await supabase
        .from('servicios')
        .insert([{ nombre, precio, descripcion }]);
    
    if (error) {
        console.error("Error al insertar servicio:", error);
        return null;
    }
    return data;
}