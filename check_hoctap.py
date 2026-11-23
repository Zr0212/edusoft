import os
import struct

def get_image_info(path):
    with open(path, 'rb') as f:
        data = f.read(30)
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        w, h = struct.unpack('>LL', data[16:24])
        return f"PNG {w}x{h}"
    elif data.startswith(b'\xff\xd8'):
        return "JPEG"
    elif data.startswith(b'<svg') or b'<svg' in data:
        return "SVG"
    return "UNKNOWN"

for f in sorted(os.listdir('images/hoctap')):
    p = os.path.join('images/hoctap', f)
    print(f"{f}: {get_image_info(p)}, size={os.path.getsize(p)} bytes")
