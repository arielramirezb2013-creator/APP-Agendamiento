/* ============================================================================
   ZIP · lector y escritor puro (sin librerías)
   Usa CompressionStream/DecompressionStream nativos cuando existen;
   si no, escribe con método STORE (válido para Excel) y lee sólo STORE.
   ========================================================================== */
'use strict';

const ZIP = (function(){

  /* ---------------------------------------------------------------- CRC32 */
  const CRCT = (function(){
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++){
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf){
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRCT[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  const ENC = new TextEncoder();
  const DEC = new TextDecoder('utf-8');
  const hasCS = typeof CompressionStream !== 'undefined';
  const hasDS = typeof DecompressionStream !== 'undefined';

  async function deflateRaw(u8){
    if (!hasCS) return null;
    try {
      const cs = new CompressionStream('deflate-raw');
      const w = cs.writable.getWriter(); w.write(u8); w.close();
      return new Uint8Array(await new Response(cs.readable).arrayBuffer());
    } catch(e){ return null; }
  }
  async function inflateRaw(u8){
    if (!hasDS) throw new Error('Este navegador no puede descomprimir ZIP (DecompressionStream). Usa Chrome, Edge o Firefox actualizados.');
    const ds = new DecompressionStream('deflate-raw');
    const w = ds.writable.getWriter(); w.write(u8); w.close();
    return new Uint8Array(await new Response(ds.readable).arrayBuffer());
  }

  /* ---------------------------------------------------------------- READ */
  /** Lee un .zip → { name: Uint8Array }  (descomprime deflate) */
  async function read(bytes){
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    // localizar EOCD
    let eo = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--){
      if (dv.getUint32(i, true) === 0x06054b50){ eo = i; break; }
    }
    if (eo < 0) throw new Error('ZIP inválido: no se encontró el directorio central');
    const n   = dv.getUint16(eo + 10, true);
    let   off = dv.getUint32(eo + 16, true);

    const out = {};
    for (let k = 0; k < n; k++){
      if (dv.getUint32(off, true) !== 0x02014b50) throw new Error('ZIP corrupto en la entrada ' + k);
      const method  = dv.getUint16(off + 10, true);
      const csize   = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extLen  = dv.getUint16(off + 30, true);
      const cmtLen  = dv.getUint16(off + 32, true);
      const lho     = dv.getUint32(off + 42, true);
      const name    = DEC.decode(bytes.subarray(off + 46, off + 46 + nameLen));
      // cabecera local → dónde empiezan los datos
      const lNameLen = dv.getUint16(lho + 26, true);
      const lExtLen  = dv.getUint16(lho + 28, true);
      const dataOff  = lho + 30 + lNameLen + lExtLen;
      const raw = bytes.subarray(dataOff, dataOff + csize);
      out[name] = (method === 0) ? raw.slice() : await inflateRaw(raw);
      off += 46 + nameLen + extLen + cmtLen;
    }
    return out;
  }

  /* --------------------------------------------------------------- WRITE */
  /** Escribe { name: Uint8Array|string } → Uint8Array del .zip
   *  opts.store = lista de extensiones a NO comprimir (png/jpeg ya comprimidos) */
  async function write(files, opts){
    opts = opts || {};
    const names = Object.keys(files);
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    const parts = [], central = [];
    let offset = 0;

    for (const name of names){
      let data = files[name];
      if (typeof data === 'string') data = ENC.encode(data);
      const nameB = ENC.encode(name);
      const crc = crc32(data);
      const usize = data.length;
      const noComp = /\.(png|jpe?g|gif|bin|zip)$/i.test(name) || usize < 64;
      let comp = noComp ? null : await deflateRaw(data);
      let method = 8, payload = comp;
      if (!comp || comp.length >= usize){ method = 0; payload = data; }

      const lh = new Uint8Array(30 + nameB.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);          // version needed
      lv.setUint16(6, 0x0800, true);      // flag: UTF-8 names
      lv.setUint16(8, method, true);
      lv.setUint16(10, dosTime, true);
      lv.setUint16(12, dosDate, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, payload.length, true);
      lv.setUint32(22, usize, true);
      lv.setUint16(26, nameB.length, true);
      lv.setUint16(28, 0, true);
      lh.set(nameB, 30);
      parts.push(lh, payload);

      const ch = new Uint8Array(46 + nameB.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 0x031E, true);      // version made by (UNIX, 3.0)
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, method, true);
      cv.setUint16(12, dosTime, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, payload.length, true);
      cv.setUint32(24, usize, true);
      cv.setUint16(28, nameB.length, true);
      cv.setUint32(38, 0x81A40000, true); // external attrs: -rw-r--r--
      cv.setUint32(42, offset, true);
      ch.set(nameB, 46);
      central.push(ch);

      offset += lh.length + payload.length;
    }

    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const eo = new Uint8Array(22);
    const ev = new DataView(eo.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, names.length, true);
    ev.setUint16(10, names.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);

    const all = parts.concat(central, [eo]);
    const total = all.reduce((a, b) => a + b.length, 0);
    const res = new Uint8Array(total);
    let p = 0;
    for (const b of all){ res.set(b, p); p += b.length; }
    return res;
  }

  return { read, write, crc32, deflateRaw, inflateRaw,
           supported: hasCS && hasDS,
           enc: s => ENC.encode(s), dec: b => DEC.decode(b) };
})();
