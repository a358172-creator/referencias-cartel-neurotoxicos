"""Scientific asset integrity: no re-encoding or changing original scene nodes."""
from pathlib import Path
from hashlib import sha256
import sys
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from extract_figures import FIGURES, SOURCE_SHA256, SVG, references


class AssetIntegrityTests(unittest.TestCase):
    def test_original_and_all_extracted_scene_nodes_are_unchanged(self):
        source = (ROOT / 'assets/poster.svg').read_bytes()
        self.assertEqual(sha256(source).hexdigest(), SOURCE_SHA256)
        poster = ET.fromstring(source)
        original_scene = poster[1][1][0]
        original_defs = {node.get('id'): node for node in poster[0] if node.get('id')}
        for name, config in FIGURES.items():
            with self.subTest(figure=name):
                extracted = ET.parse(ROOT / f'assets/{name}.svg').getroot()
                scene = extracted.find(f'{{{SVG}}}g')[0][0]
                self.assertEqual(len(scene), len(config['indices']))
                for node, index in zip(scene, config['indices']):
                    self.assertEqual(ET.tostring(node), ET.tostring(original_scene[index]))
                defs = extracted.find(f'{{{SVG}}}defs')
                ids = {node.get('id') for node in defs}
                self.assertTrue(references(extracted) <= ids)
                for node in defs:
                    self.assertEqual(ET.tostring(node), ET.tostring(original_defs[node.get('id')]))
                self.assertEqual(extracted.get('viewBox'), config['viewBox'])
                self.assertGreater(float(extracted.get('width')), 0)
                self.assertGreater(float(extracted.get('height')), 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
