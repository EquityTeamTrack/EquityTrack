"""Ejecutar desde la raíz: python3 -m unittest discover -s tests -v."""
import json
import tempfile
import unittest
from pathlib import Path
from equitytrack.domain import classify
from equitytrack.store import Store

ROOT = Path(__file__).resolve().parents[1]


class OpportunityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'test.sqlite3'
        self.store = Store(self.path, ROOT / 'data/opportunities.json')

    def tearDown(self):
        self.temp.cleanup()

    def test_missing_record_does_not_infer_denial(self):
        self.assertEqual(classify({'evidence': [], 'opportunities': []})['code'], 'unknown')
        self.assertEqual(classify({'opportunities': [{'status': 'solicitada'}]})['code'], 'unknown')

    def test_explicit_denial_and_offered_experience_are_distinct(self):
        self.assertEqual(classify({'opportunities': [{'status': 'no_asignada'}]})['code'], 'access')
        self.assertEqual(classify({'opportunities': [{'status': 'completada'}]})['code'], 'development')

    def test_evidence_requires_review(self):
        c = {'evidence': [{'verified': False}]}
        self.assertEqual(classify(c)['code'], 'evidence')
        c['evidence'][0]['verified'] = True
        self.assertEqual(classify(c)['code'], 'verified')

    def test_review_persists_and_preserves_disagreement(self):
        for actor in ('Profesional', 'Responsable'):
            self.store.update('comment', {'actor': actor, 'description': 'Observación de ' + actor})
        reopened = Store(self.path, ROOT / 'data/opportunities.json').get()
        self.assertEqual(len(reopened['comments']), 2)
        self.assertEqual(len(reopened['history']), 2)

    def test_validation_requires_reviewer(self):
        p = {'actor': 'Profesional', 'criterion': 'autonomy', 'index': 0}
        with self.assertRaises(ValueError):
            self.store.update('verify', p)
        p['actor'] = 'Responsable'
        result = self.store.update('verify', p)
        self.assertEqual(result['criteria'][1]['assessment']['code'], 'verified')

    def test_action_status_and_decision(self):
        self.store.update('action', {'actor': 'Responsable', 'description': 'Coordinar una entrega', 'owner': 'Engineering', 'due': '2027-01-15'})
        case = self.store.update('action_status', {'actor': 'RR. HH.', 'index': 0, 'status': 'Completada'})
        self.assertEqual(case['actions'][0]['status'], 'Completada')
        with self.assertRaises(ValueError):
            self.store.update('decision', {'actor': 'Profesional', 'status': 'revisada', 'description': 'Revisado'})
        result = self.store.update('decision', {'actor': 'RR. HH.', 'status': 'revisada', 'description': 'Acordar experiencia antes de reevaluar.'})
        self.assertEqual(result['decision'], 'revisada')

    def test_invalid_input_leaves_record_unchanged(self):
        with self.assertRaises(ValueError):
            self.store.update('evidence', {'actor': 'Profesional', 'criterion': 'absent', 'description': 'dato'})
        self.assertEqual(len(self.store.get()['history']), 0)


if __name__ == '__main__':
    unittest.main()

class HumanReviewTests(unittest.TestCase):
    setUp = OpportunityTests.setUp
    tearDown = OpportunityTests.tearDown

    def test_verified_evidence_is_not_a_human_pass(self):
        case = self.store.get()
        self.assertEqual(case['criteria'][0]['assessment']['code'], 'verified')
        self.assertNotIn('review', case['criteria'][0])
        self.assertIn('document', case['criteria_source'])

    def test_only_hr_can_define_and_evaluate_requirements(self):
        payload = {'actor':'Responsable', 'criterion':'delivery', 'status':'cumple', 'description':'Evidencia revisada'}
        with self.assertRaises(ValueError):
            self.store.update('criterion_review', payload)
        payload['actor'] = 'RR. HH.'
        case = self.store.update('criterion_review', payload)
        self.assertEqual(case['criteria'][2]['review']['status'], 'cumple')
        case = self.store.update('criterion_definition', {**payload, 'description':'Coordinar dos entregas con evidencias'})
        self.assertNotIn('review', case['criteria'][2])
        self.assertEqual(case['decision'], 'pendiente')
        case = self.store.update('criteria_source', {'actor':'RR. HH.', 'document':'Matriz aprobada por la empresa', 'version':'v2', 'defined_by':'Equipo RRHH'})
        self.assertEqual(case['criteria_source']['version'], 'v2')
