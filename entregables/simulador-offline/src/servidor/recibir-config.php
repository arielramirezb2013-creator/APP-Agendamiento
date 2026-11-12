<?php
// Configuración del receptor de respuestas.
// Este archivo de ejemplo no tiene claves: mientras esté así, recibir.php no atiende ninguna petición.
// Reemplácelo por el recibir-config.php que el investigador descarga en su panel (momento «Publicar»).
return [
    // Clave de envío: la misma que va en configuracion.js. La conocen todos los participantes.
    'clave_envio' => '',
    // SHA-256, en hexadecimal, de la clave de administración del servidor. La clave en claro solo la tiene el investigador.
    'clave_admin_sha256' => '',
    // Carpeta donde se guardan las respuestas. Si puede, use una ruta fuera de la raíz pública del sitio.
    'carpeta' => __DIR__ . '/respuestas',
    // Tamaño máximo de un documento de respuestas, en bytes.
    'max_bytes' => 1048576,
    // Número máximo de documentos guardados.
    'max_documentos' => 2000,
];
