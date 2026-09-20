"""Reproduce the reviewed extractions from this exact original poster.

No rasterization, resampling, redrawing, or scientific editing is performed.
Only original scene nodes and the definitions they reference are copied.
The website does not run or require this maintenance tool.
"""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/poster.svg'
SOURCE_SHA256 = '2b8e8dc342fbcc70b5abddba1f41ad1b1de99992dfab2b0e6c0b928d0efb76d0'
SVG = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

# Indices refer to original svg > g > g > g scene children, in paint order.
# Labels/captions and all diagram marks are retained. Backgrounds are original.
FIGURES = {
    'intro': {
        'title': 'Esquema original de introducción',
        'viewBox': '601 200 1071 746',
        'indices': [0, 550, 553, 575, 576, 577, 578, 579, 580],
    },
    'methodology': {
        'title': 'Metodología original del cartel',
        'viewBox': '0 1045 635 724',
        'indices': [0, 5, *range(11, 543), *range(560, 567), 571],
    },
    'figure-ros': {
        'title': 'Especies reactivas de oxígeno — figura y leyenda originales',
        'viewBox': '1157 948 527 397',
        'indices': [0, 5, 545, 546, 568],
    },
    'figure-lipid-peroxidation': {
        'title': 'Peroxidación lipídica — figura y leyenda originales',
        'viewBox': '639 1337 526 418',
        'indices': [0, 5, 551, 552, 570],
    },
    'figure-mtt': {
        'title': 'Funcionalidad celular / MTT — figura y leyenda originales',
        'viewBox': '1168 1351 516 394',
        'indices': [0, 5, 543, 544, 567],
    },
}


def references(element):
    found = set()
    for node in element.iter():
        for value in node.attrib.values():
            found.update(re.findall(r'url\(#([^)]*)\)', value))
            if value.startswith('#') and not re.fullmatch(r'#[0-9a-fA-F]{3,8}', value):
                found.add(value[1:])
    return found


def extract():
    source = SOURCE.read_bytes()
    if sha256(source).hexdigest() != SOURCE_SHA256:
        raise SystemExit('El cartel cambió. Revisa grupos y límites antes de extraer otra versión.')
    original = ET.fromstring(source)
    original_defs = original.find(f'{{{SVG}}}defs')
    definitions = {node.get('id'): node for node in original_defs if node.get('id')}
    outer, middle, scene = original[1], original[1][1], original[1][1][0]
    for name, config in FIGURES.items():
        x, y, width, height = config['viewBox'].split()
        svg = ET.Element(f'{{{SVG}}}svg', {
            'viewBox': config['viewBox'], 'width': width, 'height': height,
            'preserveAspectRatio': 'xMidYMid meet', 'role': 'img',
            'aria-labelledby': f'{name}-title',
        })
        ET.SubElement(svg, f'{{{SVG}}}title', {'id': f'{name}-title'}).text = config['title']
        ET.SubElement(svg, f'{{{SVG}}}desc').text = (
            'Extracción del cartel original. Se conservan los elementos, imágenes '
            'incrustadas, transformaciones, máscaras y leyendas, sin modificar los datos.'
        )
        defs = ET.SubElement(svg, f'{{{SVG}}}defs')
        a = ET.SubElement(svg, outer.tag, outer.attrib)
        b = ET.SubElement(a, middle.tag, middle.attrib)
        c = ET.SubElement(b, scene.tag, scene.attrib)
        for index in config['indices']:
            c.append(deepcopy(scene[index]))
        needed = references(a)
        todo = list(needed)
        while todo:
            identifier = todo.pop()
            if identifier not in definitions:
                raise ValueError(f'Falta una definición: {identifier}')
            for nested in references(definitions[identifier]) - needed:
                needed.add(nested)
                todo.append(nested)
        for definition in original_defs:
            if definition.get('id') in needed:
                defs.append(deepcopy(definition))
        output = ROOT / f'assets/{name}.svg'
        ET.ElementTree(svg).write(output, encoding='utf-8', xml_declaration=True)
        # Verify that every selected original node was copied unchanged.
        for index, copied in zip(config['indices'], c):
            assert ET.tostring(scene[index]) == ET.tostring(copied)
        print(f'{output.name}: {output.stat().st_size:,} bytes; {len(config["indices"])} elementos originales')


if __name__ == '__main__':
    extract()
