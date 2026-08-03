"""Compresion/descompresion MS-OVBA (CompressedContainer, [MS-OVBA] 2.4.1)."""
import math


def _copytoken_help(difference):
    bit_count = max(int(math.ceil(math.log(difference, 2))), 4) if difference > 1 else 4
    length_mask = 0xFFFF >> bit_count
    offset_mask = (~length_mask) & 0xFFFF
    maximum_length = length_mask + 3
    return length_mask, offset_mask, bit_count, maximum_length


def decompress(data):
    if not data or data[0] != 0x01:
        raise ValueError("firma de contenedor comprimido invalida")
    out = bytearray()
    i = 1
    while i < len(data):
        header = int.from_bytes(data[i:i + 2], "little")
        i += 2
        size = (header & 0x0FFF) + 3
        flag = (header >> 15) & 1
        sig = (header >> 12) & 0x07
        if sig != 0b011:
            raise ValueError("firma de chunk invalida: %r" % sig)
        end = i + size - 2
        chunk_start = len(out)
        if flag == 0:
            out += data[i:i + 4096]
            i += 4096
            continue
        while i < end:
            flags = data[i]
            i += 1
            for bit in range(8):
                if i >= end:
                    break
                if not (flags >> bit) & 1:
                    out.append(data[i])
                    i += 1
                else:
                    token = int.from_bytes(data[i:i + 2], "little")
                    i += 2
                    diff = len(out) - chunk_start
                    lmask, omask, bits, _ = _copytoken_help(diff)
                    length = (token & lmask) + 3
                    offset = ((token & omask) >> (16 - bits)) + 1
                    src = len(out) - offset
                    for k in range(length):
                        out.append(out[src + k])
    return bytes(out)


def _compress_chunk(chunk):
    """Comprime un chunk (<=4096 bytes) a secuencias de tokens."""
    out = bytearray()
    pos = 0
    while pos < len(chunk):
        flag_index = len(out)
        out.append(0)
        flags = 0
        for bit in range(8):
            if pos >= len(chunk):
                break
            diff = pos
            lmask, omask, bits, maxlen = _copytoken_help(diff) if diff > 0 else (0, 0, 0, 0)
            best_len, best_off = 0, 0
            if diff > 0:
                lo = max(0, pos - (0xFFFF >> (16 - bits)) - 1) if bits else 0
                lo = max(0, pos - ((omask >> (16 - bits)) + 1))
                for cand in range(lo, pos):
                    ln = 0
                    while (ln < maxlen and pos + ln < len(chunk)
                           and chunk[cand + ln] == chunk[pos + ln]):
                        ln += 1
                    if ln > best_len:
                        best_len, best_off = ln, pos - cand
            if best_len >= 3:
                token = (((best_off - 1) << (16 - bits)) & omask) | ((best_len - 3) & lmask)
                out += token.to_bytes(2, "little")
                flags |= 1 << bit
                pos += best_len
            else:
                out.append(chunk[pos])
                pos += 1
        out[flag_index] = flags
    return bytes(out)


def compress(data):
    out = bytearray(b"\x01")
    for start in range(0, len(data), 4096):
        chunk = data[start:start + 4096]
        comp = _compress_chunk(chunk)
        # La forma "sin comprimir" siempre ocupa 4096 bytes de datos, asi que
        # solo es representable cuando el chunk esta completo. En un chunk final
        # corto habria que rellenar con ceros y eso altera el contenido.
        full = len(chunk) == 4096
        if len(comp) <= 4096 and not (full and len(comp) >= 4096):
            header = 0xB000 | ((len(comp) + 2 - 3) & 0x0FFF)
            out += header.to_bytes(2, "little") + comp
        elif full:
            header = 0x3000 | ((4096 + 2 - 3) & 0x0FFF)
            out += header.to_bytes(2, "little") + chunk
        else:
            raise ValueError("chunk final incompresible: caso no soportado")
    return bytes(out)
