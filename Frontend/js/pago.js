// pagos.js

async function registrarPago(req, res) {
    try {
        const {
            usuario_id,
            cita_id,
            servicio_id,
            metodo_pago
        } = req.body;

        if (
            !usuario_id ||
            !cita_id ||
            !servicio_id ||
            !metodo_pago
        ) {
            return res.status(400).json({
                error: "Faltan datos obligatorios"
            });
        }

        // 1. Buscar el servicio para obtener el precio real
        const { data: servicio, error: errorServicio } = await supabase
            .from("servicios")
            .select("id, nombre, precio, descripcion")
            .eq("id", servicio_id)
            .single();

        if (errorServicio || !servicio) {
            return res.status(404).json({
                error: "Servicio no encontrado"
            });
        }

        // 2. Verificar que la cita exista
        const { data: cita, error: errorCita } = await supabase
            .from("Citas")
            .select("id, usuario_id, servicio_id, fecha_hora")
            .eq("id", cita_id)
            .single();

        if (errorCita || !cita) {
            return res.status(404).json({
                error: "Cita no encontrada"
            });
        }

        // 3. Registrar pago usando el precio del servicio
        const { data, error } = await supabase
            .from("pagos")
            .insert([
                {
                    usuario_id,
                    cita_id,
                    servicio_id,
                    monto: servicio.precio,
                    metodo_pago,
                    estado: "aprobado"
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.status(201).json({
            mensaje: "Pago registrado correctamente",
            detalle: {
                cita: cita.id,
                servicio: servicio.nombre,
                precio: servicio.precio,
                metodo_pago,
                estado: "aprobado"
            },
            pago: data
        });

    } catch (error) {
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
}

module.exports = {
    registrarPago
};