"""Sin red ni claves reales: validación del proxy y contrato REST de Gemini."""
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from gemini_api import Settings, GeminiClient, ChatError, load_settings, safe_context


class GeminiTests(unittest.TestCase):
    def test_configuration_reads_private_file_without_execution(self):
        with tempfile.TemporaryDirectory() as temp, patch.dict(os.environ, {}, clear=True):
            Path(temp, '.env').write_text('GEMINI_API_KEY="local-test"\nGEMINI_MODEL=gemini-2.5-flash\nIGNORED=x\n')
            self.assertEqual(load_settings(temp).api_key, 'local-test')
            with patch.dict(os.environ, {'GEMINI_API_KEY': 'environment-test'}):
                self.assertEqual(load_settings(temp).api_key, 'environment-test')

    def test_missing_key_does_not_attempt_network(self):
        with patch('gemini_api.urlopen') as call:
            with self.assertRaises(ChatError) as error:
                GeminiClient(Settings()).reply({'message': 'Hola'})
            self.assertEqual(error.exception.status, 503)
            call.assert_not_called()

    def test_context_drops_individual_records_and_unexpected_fields(self):
        result = safe_context({'rows': [{'id': 'personal-id'}], 'case': {'comments': ['private']}, 'pay': [{'group': 'Ingeniería', 'women': 10, 'men': 12, 'names': ['private']} ]})
        self.assertNotIn('rows', result)
        self.assertNotIn('case', result)
        self.assertNotIn('names', result['pay'][0])

    def test_rest_request_keeps_key_in_header_and_context_in_body(self):
        response = {'candidates': [{'content': {'parts': [{'text': 'Una diferencia descriptiva del 10 %.'}]}, 'finishReason': 'STOP'}]}
        with patch('gemini_api.urlopen', return_value=io.BytesIO(json.dumps(response).encode())) as call:
            result = GeminiClient(Settings('unit-test-secret')).reply({'message': '¿Qué significa la brecha?', 'context': {'coverage': {'people': 192}}})
            request = call.call_args.args[0]
            self.assertNotIn('unit-test-secret', request.full_url)
            self.assertEqual(request.get_header('X-goog-api-key'), 'unit-test-secret')
            body = json.loads(request.data)
            self.assertIn('systemInstruction', body)
            self.assertIn('192', body['contents'][-1]['parts'][0]['text'])
            self.assertIn('10 %', result['answer'])

    def test_provider_error_never_exposes_its_body_or_key(self):
        with patch('gemini_api.urlopen', side_effect=HTTPError('https://example', 403, 'forbidden', {}, io.BytesIO(b'unit-test-secret'))):
            with self.assertRaises(ChatError) as error:
                GeminiClient(Settings('unit-test-secret')).reply({'message': 'Hola'})
            self.assertNotIn('unit-test-secret', str(error.exception))

    def test_history_has_to_alternate_and_be_bounded(self):
        with self.assertRaises(ValueError):
            GeminiClient(Settings('test')).reply({'message': 'Hola', 'history': [{'role': 'model', 'text': 'x'}]})
        with self.assertRaises(ValueError):
            safe_context({'pay': [{}] * 41})
