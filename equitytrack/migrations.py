"""Actualiza solo la base de ejemplo, conservando aportaciones y criterios personalizados."""
from copy import deepcopy
from datetime import datetime, timezone


def adapt_spanish_references(case, seed):
    revision = seed['reference_revision']
    if case.get('reference_revision') == revision:
        return case
    previous = {'criteria': deepcopy(case['criteria']), 'criteria_source': deepcopy(case.get('criteria_source'))}
    defaults = {c['id']: c for c in seed['criteria']}
    for criterion in case['criteria']:
        base = defaults.get(criterion['id'])
        if base is None:
            continue
        if not criterion.get('definition_updated_by'):
            for key in ('title', 'requirement', 'source_reference', 'source_url'):
                criterion[key] = base[key]
            criterion.pop('review', None)
        else:
            criterion['source_reference'] = 'Definición interna de RR. HH.; contraste con el marco español pendiente.'
            criterion['source_url'] = base['source_url']
    source = case.get('criteria_source')
    if not source or source.get('document', '').startswith('Matriz de carrera de Ingeniería'):
        case['criteria_source'] = deepcopy(seed['criteria_source'])
    case['reference_framework'] = deepcopy(seed['reference_framework'])
    case['reference_revision'] = revision
    case['decision'] = 'pendiente'
    case['history'].append({'at': datetime.now(timezone.utc).isoformat(), 'actor': 'Sistema', 'event': 'actualizacion_base_espanola', 'previous_basis': previous, 'description': 'Referencias españolas incorporadas. Revisar antes de cerrar la evaluación.'})
    return case
