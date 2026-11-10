"""Clip scanner edges in SVG; embed the original JPEG bytes without retouching.

Run from any directory with Python 3. The SVG works both online and via file://.
Bounds are measured in original scan pixels, outside the printed content.
"""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'assets/document-sources.json').read_text())
for document in manifest['documents']:
    width, height = document['width'], document['height']
    left, top, right, bottom = document['trimEdges']
    display_width, display_height = width - left - right, height - top - bottom
    assert min(left, top, right, bottom) >= 0
    assert display_width > width * .95 and display_height > height * .95
    original = base64.b64encode((ROOT / document['image']).read_bytes()).decode('ascii')
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{display_width}" height="{display_height}" '
        f'viewBox="{left} {top} {display_width} {display_height}" overflow="hidden">'
        f'<image width="{width}" height="{height}" href="data:image/jpeg;base64,{original}"/>'
        '</svg>\n'
    )
    (ROOT / document['displayImage']).write_text(svg)
print(f"Prepared {len(manifest['documents'])} scans; original JPEG bytes preserved.")
