"""Las referencias orientan la revisión; nunca sustituyen la decisión de RR. HH."""
import json
import unittest
from copy import deepcopy
from pathlib import Path
from equitytrack.migrations import adapt_spanish_references

SEED = json.loads((Path(__file__).resolve().parents[1] / 'data/opportunities.json').read_text())


class SpanishBasisTests(unittest.TestCase):
    def test_statistical_context_is_not_a_promotion_score(self):
        context = SEED['reference_framework']['context']
        self.assertEqual(context['gap_pct'], 15.74)
        self.assertEqual(context['year'], 2023)
        for criterion in SEED['criteria']:
            self.assertIn('source_reference', criterion)
            self.assertNotIn('review', criterion)
            self.assertNotIn('threshold', criterion)

    def test_migration_preserves_custom_criteria_and_history(self):
        old = deepcopy(SEED)
        del old['reference_revision']
        old['criteria'][0]['definition_updated_by'] = 'RR. HH.'
        old['criteria'][0]['requirement'] = 'Requisito propio documentado'
        old['criteria'][1]['review'] = {'status': 'cumple'}
        old['comments'].append({'author': 'Profesional', 'text': 'Mi aportación'})
        result = adapt_spanish_references(old, SEED)
        self.assertEqual(result['criteria'][0]['requirement'], 'Requisito propio documentado')
        self.assertNotIn('review', result['criteria'][1])
        self.assertEqual(len(result['comments']), 1)
        self.assertIn('previous_basis', result['history'][-1])
        before = len(result['history'])
        self.assertEqual(len(adapt_spanish_references(result, SEED)['history']), before)
