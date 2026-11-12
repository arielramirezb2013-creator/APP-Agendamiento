<?php
/**
 * Receptor de respuestas del simulador asíncrono (opcional).
 *
 * Recibe los documentos de respuestas que envía el simulador y los guarda, uno por participación,
 * en la carpeta «respuestas». También devuelve el avance guardado a quien retoma en otro dispositivo
 * y entrega todos los documentos al panel del investigador.
 *
 * Requisitos: PHP 7.4 o superior. No usa base de datos ni librerías.
 * Configuración: recibir-config.php, que genera el panel del investigador. Sin claves, no atiende nada.
 * Protocolo: apartado 7 de CONTRATO.md. Siempre POST; el cuerpo es JSON (o un formulario con los mismos campos).
 */
declare(strict_types=1);

const VERSION_RECEPTOR = '1.0';
const INSTRUMENTO = 'simulador_blueprint_asincrono';
const FORMATO = 1;
const RE_ID = '/^[a-z0-9][a-z0-9._-]{0,39}$/';
const RE_PARTICIPANTE = '/^p[0-9a-f]{16}$/';
const RE_LLAVE = '/^[0-9a-f]{64}$/';
// Primera línea de cada archivo guardado: si alguien lo pide por la web, PHP responde 404 y no compila lo demás.
const GUARDA = "<?php http_response_code(404); exit; __halt_compiler();\n";

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
// La autenticación va en el cuerpo de la petición, no en cookies: se puede atender cualquier origen.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function responder(int $codigo, array $datos): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fallar(int $codigo, string $error): void
{
    responder($codigo, ['ok' => false, 'error' => $error]);
}

/** Texto de un campo, o cadena vacía si falta, no es texto o es demasiado largo. */
function campo(array $p, string $k, int $max = 200): string
{
    return isset($p[$k]) && is_string($p[$k]) && strlen($p[$k]) <= $max ? $p[$k] : '';
}

function ahora(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

/**
 * Lee la petición: JSON en el cuerpo o campos de formulario.
 * Devuelve [campos, vinoComoFormulario, documentoComoObjeto].
 * El documento se decodifica dos veces: como arreglo para validarlo y como objeto para volver a escribirlo
 * sin alterarlo (un arreglo de PHP no distingue {} de [] y cambiaría el documento y su huella).
 */
function leerPeticion(int $maxBytes): array
{
    $limite = $maxBytes + 8192;   // el documento más los demás campos
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $limite) {
        fallar(413, 'La petición es demasiado grande.');
    }
    $tipo = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (strpos($tipo, 'application/x-www-form-urlencoded') === 0 || strpos($tipo, 'multipart/form-data') === 0) {
        $p = is_array($_POST) ? $_POST : [];
        $objeto = null;
        if (isset($p['documento']) && is_string($p['documento'])) {
            if (strlen($p['documento']) > $maxBytes) {
                fallar(413, 'El documento es demasiado grande.');
            }
            $objeto = json_decode($p['documento'], false, 32);
            $p['documento'] = json_decode($p['documento'], true, 32);
        }
        return [$p, true, $objeto];
    }
    $cuerpo = file_get_contents('php://input', false, null, 0, $limite + 1);
    if ($cuerpo === false || strlen($cuerpo) > $limite) {
        fallar(413, 'La petición es demasiado grande.');
    }
    $p = json_decode($cuerpo, true, 32);
    if (!is_array($p)) {
        fallar(400, 'La petición no es un JSON válido.');
    }
    $o = json_decode($cuerpo, false, 32);
    return [$p, false, is_object($o) && isset($o->documento) ? $o->documento : null];
}

/** Comprueba el documento de respuestas. Devuelve el motivo del rechazo o cadena vacía. */
function motivoRechazo($d, int $maxBytes): string
{
    if (!is_array($d)) {
        return 'Falta el documento de respuestas.';
    }
    if (($d['instrumento'] ?? null) !== INSTRUMENTO || ($d['formato'] ?? null) !== FORMATO) {
        return 'El documento no es de este simulador.';
    }
    $estudio = $d['estudio']['id'] ?? null;
    $usuario = $d['cuenta']['usuario'] ?? null;
    $participante = $d['participante']['id'] ?? null;
    if (!is_string($estudio) || !preg_match(RE_ID, $estudio) || !is_string($usuario) || !preg_match(RE_ID, $usuario)) {
        return 'El documento no identifica el estudio o la cuenta.';
    }
    if (!is_string($participante) || !preg_match(RE_PARTICIPANTE, $participante)) {
        return 'El documento no identifica la participación.';
    }
    if (($d['consentimiento']['aceptado'] ?? null) !== true) {
        return 'El documento no trae la declaración de participación voluntaria.';
    }
    if (!isset($d['registros']) || !is_array($d['registros']) || ($d['registros'] !== [] && array_keys($d['registros']) !== range(0, count($d['registros']) - 1))) {
        return 'El documento no trae la lista de registros.';
    }
    if (strlen((string) json_encode($d)) > $maxBytes) {
        return 'El documento es demasiado grande.';
    }
    return '';
}

/** Ruta del archivo de una participación. Los tres identificadores ya pasaron por las expresiones regulares. */
function rutaDe(string $dir, string $estudio, string $usuario, string $participante): string
{
    return $dir . '/' . $estudio . '~' . $usuario . '~' . $participante . '.json.php';
}

/**
 * Lee un archivo guardado: guarda, una línea con los datos del receptor y una línea con el documento.
 * Devuelve ['recibido', 'reanudar_sha256', 'estudio', 'usuario', 'documento' => texto JSON] o null.
 * El documento se devuelve como texto para entregarlo sin volver a codificarlo.
 */
function leerGuardado(string $archivo): ?array
{
    $txt = @file_get_contents($archivo);
    if ($txt === false || strpos($txt, GUARDA) !== 0) {
        return null;
    }
    $corte = strpos($txt, "\n", strlen(GUARDA));
    if ($corte === false) {
        return null;
    }
    $w = json_decode(substr($txt, strlen(GUARDA), $corte - strlen(GUARDA)), true, 8);
    $doc = substr($txt, $corte + 1);
    if (!is_array($w) || $doc === '' || $doc[0] !== '{') {
        return null;
    }
    $w['documento'] = $doc;
    return $w;
}

function prepararCarpeta(string $dir): void
{
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        fallar(500, 'No se pudo crear la carpeta de respuestas. Revise los permisos.');
    }
    if (!is_writable($dir)) {
        fallar(500, 'La carpeta de respuestas no permite escribir. Revise los permisos.');
    }
    // Protección adicional para servidores Apache; la primera línea de cada archivo protege en los demás.
    if (!file_exists($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order deny,allow\n  Deny from all\n</IfModule>\n");
    }
    if (!file_exists($dir . '/index.html')) {
        @file_put_contents($dir . '/index.html', '');
    }
}

function identificadores(array $p): array
{
    $estudio = campo($p, 'estudio');
    $usuario = campo($p, 'usuario');
    $participante = campo($p, 'participante');
    if (!preg_match(RE_ID, $estudio) || !preg_match(RE_ID, $usuario) || !preg_match(RE_PARTICIPANTE, $participante)) {
        fallar(400, 'Faltan el estudio, el usuario o la participación, o no tienen la forma esperada.');
    }
    return [$estudio, $usuario, $participante];
}

/* ------------------------------------------------------------------ Atención de la petición */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST, OPTIONS');
    fallar(405, 'Este receptor solo atiende peticiones POST del simulador.');
}

$cfg = is_file(__DIR__ . '/recibir-config.php') ? (include __DIR__ . '/recibir-config.php') : null;
$claveEnvio = is_array($cfg) ? (string) ($cfg['clave_envio'] ?? '') : '';
$claveAdminSha = is_array($cfg) ? strtolower((string) ($cfg['clave_admin_sha256'] ?? '')) : '';
if (strlen($claveEnvio) < 8 || !preg_match(RE_LLAVE, $claveAdminSha)) {
    fallar(403, 'El receptor no está configurado: falta recibir-config.php con las claves que genera el panel del investigador.');
}
$dir = rtrim((string) ($cfg['carpeta'] ?? (__DIR__ . '/respuestas')), '/\\');
$maxBytes = max(10000, (int) ($cfg['max_bytes'] ?? 1048576));
$maxDocumentos = max(1, (int) ($cfg['max_documentos'] ?? 2000));

[$p, $esFormulario, $documento] = leerPeticion($maxBytes);
$accion = campo($p, 'accion', 20);
$esParticipante = hash_equals($claveEnvio, campo($p, 'clave'));
$claveAdmin = campo($p, 'claveAdmin');
$esInvestigador = strlen($claveAdmin) >= 16 && hash_equals($claveAdminSha, hash('sha256', $claveAdmin));

if (in_array($accion, ['probar', 'guardar', 'recuperar', 'retirar'], true) && !$esParticipante) {
    fallar(403, 'La clave de envío no coincide con la del receptor.');
}
if (in_array($accion, ['listar', 'borrar'], true) && !$esInvestigador) {
    fallar(403, 'La clave de administración del servidor no coincide.');
}

switch ($accion) {
    case 'probar':
        prepararCarpeta($dir);
        $r = ['ok' => true, 'version' => VERSION_RECEPTOR, 'guarda' => true];
        if ($esInvestigador) {
            $r['documentos'] = count(glob($dir . '/*.json.php') ?: []);
        }
        responder(200, $r);
        // no continúa

    case 'guardar':
        $d = $p['documento'] ?? null;
        $motivo = motivoRechazo($d, $maxBytes);
        if ($motivo !== '') {
            fallar(strpos($motivo, 'grande') !== false ? 413 : 400, $motivo);
        }
        $llave = campo($p, 'reanudar');
        if ($llave !== '' && !preg_match(RE_LLAVE, $llave)) {
            fallar(400, 'La llave de reanudación no tiene la forma esperada.');
        }
        prepararCarpeta($dir);
        $archivo = rutaDe($dir, $d['estudio']['id'], $d['cuenta']['usuario'], $d['participante']['id']);
        if (!file_exists($archivo) && count(glob($dir . '/*.json.php') ?: []) >= $maxDocumentos) {
            fallar(507, 'El receptor llegó al máximo de documentos. Avise al investigador.');
        }
        $recibido = ahora();
        // JSON_HEX_TAG y JSON_HEX_AMP escriben <, > y & como secuencias \u: en el archivo no queda ninguna etiqueta.
        $texto = is_object($documento) ? json_encode($documento, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) : false;
        if ($texto === false) {
            fallar(400, 'El documento no se pudo leer.');
        }
        $datos = json_encode(['recibido' => $recibido, 'reanudar_sha256' => $llave !== '' ? hash('sha256', $llave) : '', 'estudio' => $d['estudio']['id'], 'usuario' => $d['cuenta']['usuario'], 'participante' => $d['participante']['id']]);
        $contenido = GUARDA . $datos . "\n" . $texto;
        $tmp = $dir . '/.tmp-' . bin2hex(random_bytes(8)) . '.php';
        if (@file_put_contents($tmp, $contenido, LOCK_EX) !== strlen($contenido) || !@rename($tmp, $archivo)) {
            @unlink($tmp);
            fallar(500, 'No se pudo guardar el documento. Revise el espacio y los permisos de la carpeta de respuestas.');
        }
        @chmod($archivo, 0640);
        responder(200, ['ok' => true, 'recibido' => $recibido]);
        // no continúa

    case 'recuperar':
        $estudio = campo($p, 'estudio');
        $usuario = campo($p, 'usuario');
        $llave = campo($p, 'reanudar');
        if (!preg_match(RE_ID, $estudio) || !preg_match(RE_ID, $usuario) || !preg_match(RE_LLAVE, $llave)) {
            fallar(400, 'Faltan el estudio, el usuario o la llave de reanudación.');
        }
        $huella = hash('sha256', $llave);
        $mejor = null;
        foreach (glob($dir . '/' . $estudio . '~' . $usuario . '~*.json.php') ?: [] as $archivo) {
            $w = leerGuardado($archivo);
            if ($w === null || ($w['estudio'] ?? null) !== $estudio || ($w['usuario'] ?? null) !== $usuario) {
                continue;
            }
            if (!is_string($w['reanudar_sha256'] ?? null) || $w['reanudar_sha256'] === '' || !hash_equals($w['reanudar_sha256'], $huella)) {
                continue;
            }
            if ($mejor === null || strcmp((string) $w['recibido'], (string) $mejor['recibido']) > 0) {
                $mejor = $w;
            }
        }
        // La respuesta es la misma si el usuario no existe o si la llave no coincide.
        echo '{"ok":true,"documento":' . ($mejor === null ? 'null' : $mejor['documento']) . '}';
        exit;

    case 'retirar':
    case 'borrar':
        [$estudio, $usuario, $participante] = identificadores($p);
        $archivo = rutaDe($dir, $estudio, $usuario, $participante);
        $habia = is_file($archivo);
        if ($habia && !@unlink($archivo)) {
            fallar(500, 'No se pudo eliminar el documento. Revise los permisos de la carpeta de respuestas.');
        }
        responder(200, ['ok' => true, 'eliminado' => $habia]);
        // no continúa

    case 'listar':
        $estudio = campo($p, 'estudio');
        if ($estudio !== '' && !preg_match(RE_ID, $estudio)) {
            fallar(400, 'El identificador del estudio no tiene la forma esperada.');
        }
        if ($esFormulario) {
            header('Content-Disposition: attachment; filename="respuestas-' . gmdate('Ymd-Hi') . '.json"');
        }
        // Se escribe documento por documento para no cargar todo en memoria.
        echo '{"ok":true,"generado":' . json_encode(ahora()) . ',"documentos":[';
        $primero = true;
        foreach (glob($dir . '/' . ($estudio !== '' ? $estudio . '~' : '') . '*.json.php') ?: [] as $archivo) {
            $w = leerGuardado($archivo);
            if ($w === null || ($estudio !== '' && ($w['estudio'] ?? null) !== $estudio)) {
                continue;
            }
            echo ($primero ? '' : ',') . '{"recibido":' . json_encode((string) ($w['recibido'] ?? '')) . ',"documento":' . $w['documento'] . '}';
            $primero = false;
        }
        echo ']}';
        exit;

    default:
        fallar(400, 'Acción desconocida.');
}
