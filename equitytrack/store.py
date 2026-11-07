"""Persistencia SQLite de un caso local y su historial de revisión."""
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from .domain import enrich
from .migrations import adapt_spanish_references


class Store:
    def __init__(self, db_path, seed_path):
        self.db_path = str(db_path)
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.execute('CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, body TEXT NOT NULL)')
            seed = json.loads(Path(seed_path).read_text())
            db.execute('INSERT OR IGNORE INTO cases VALUES (?, ?)', (seed['id'], json.dumps(seed)))
            case = json.loads(db.execute('SELECT body FROM cases WHERE id=?', (seed['id'],)).fetchone()[0])
            case = adapt_spanish_references(case, seed)
            db.execute('UPDATE cases SET body=? WHERE id=?', (json.dumps(case, ensure_ascii=False), seed['id']))

    def connect(self):
        return sqlite3.connect(self.db_path)

    def get(self):
        with self.connect() as db:
            row = db.execute('SELECT body FROM cases WHERE id=?', ('career-001',)).fetchone()
        return enrich(json.loads(row[0]))

    def update(self, kind, payload):
        # Transaction prevents a read/modify/write operation losing another update.
        with self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            case = json.loads(db.execute('SELECT body FROM cases WHERE id=?', ('career-001',)).fetchone()[0])
            actor = payload.get('actor', '')
            if actor not in ('Profesional', 'Responsable', 'RR. HH.'):
                raise ValueError('Selecciona quién registra la revisión.')
            if kind in ('evidence', 'opportunity', 'verify', 'criterion_review', 'criterion_definition'):
                criterion = next((c for c in case['criteria'] if c['id'] == payload.get('criterion')), None)
                if criterion is None:
                    raise ValueError('Requisito no encontrado.')
            if kind in ('criteria_source', 'criterion_definition', 'criterion_review') and actor != 'RR. HH.':
                raise ValueError('Solo RR. HH. define los requisitos y registra su valoración.')
            if kind == 'criteria_source':
                case['criteria_source'] = {key: required(payload, key) for key in ('document', 'version', 'defined_by')}
            elif kind == 'criterion_definition':
                criterion['requirement'] = required(payload, 'description')
                criterion['definition_updated_by'] = actor
                criterion.pop('review', None)  # A changed requirement must be reviewed again.
                case['decision'] = 'pendiente'
            elif kind == 'criterion_review':
                if payload.get('status') not in ('cumple', 'no_cumple', 'pendiente'):
                    raise ValueError('Valoración no válida.')
                criterion['review'] = {'status': payload['status'], 'reason': required(payload, 'description'), 'by': actor, 'at': datetime.now(timezone.utc).isoformat()}
            elif kind == 'evidence':
                criterion['evidence'].append({'description': required(payload, 'description'), 'author': actor, 'verified': False})
            elif kind == 'opportunity':
                status = payload.get('status')
                if status not in ('solicitada', 'asignada', 'no_asignada', 'completada'):
                    raise ValueError('Estado de oportunidad no válido.')
                criterion['opportunities'].append({'description': required(payload, 'description'), 'status': status, 'context': required(payload, 'context'), 'author': actor})
            elif kind == 'verify':
                if actor not in ('Responsable', 'RR. HH.'):
                    raise ValueError('La validación corresponde al responsable o a RR. HH.')
                index = payload.get('index')
                if not isinstance(index, int) or not 0 <= index < len(criterion['evidence']):
                    raise ValueError('Evidencia no encontrada.')
                criterion['evidence'][index]['verified'] = True
            elif kind == 'comment':
                case['comments'].append({'author': actor, 'text': required(payload, 'description')})
            elif kind == 'action':
                from datetime import date
                due = required(payload, 'due')
                date.fromisoformat(due)
                case['actions'].append({'title': required(payload, 'description'), 'owner': required(payload, 'owner'), 'due': due, 'status': 'Pendiente'})
            elif kind == 'action_status':
                index = payload.get('index')
                if not isinstance(index, int) or not 0 <= index < len(case['actions']):
                    raise ValueError('Medida no encontrada.')
                if payload.get('status') not in ('Pendiente', 'En curso', 'Completada'):
                    raise ValueError('Estado no válido.')
                case['actions'][index]['status'] = payload['status']
            elif kind == 'decision':
                if actor != 'RR. HH.':
                    raise ValueError('La revisión final la documenta RR. HH.')
                if payload.get('status') not in ('pendiente', 'revisada'):
                    raise ValueError('Estado no válido.')
                case['decision'] = payload['status']
                case['decision_reason'] = required(payload, 'description')
            else:
                raise ValueError('Operación no admitida.')
            case['history'].append({'at': datetime.now(timezone.utc).isoformat(), 'actor': actor, 'event': kind, 'criterion': payload.get('criterion'), 'description': payload.get('description', ''), 'status': payload.get('status', '')})
            db.execute('UPDATE cases SET body=? WHERE id=?', (json.dumps(case, ensure_ascii=False), case['id']))
        return enrich(case)


def required(payload, key):
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip() or len(value) > 5000:
        raise ValueError('Completa el campo ' + key + ' (máximo 5.000 caracteres).')
    return value.strip()
