"""Reglas descriptivas. Nunca deciden un ascenso ni infieren una denegación."""

def classify(criterion):
    evidence = criterion.get('evidence', [])
    opportunities = criterion.get('opportunities', [])
    if any(e.get('verified') for e in evidence):
        return {'code': 'verified', 'label': 'Evidencia validada', 'next': 'Incorporar la evidencia a la evaluación.'}
    if evidence:
        return {'code': 'evidence', 'label': 'Evidencia por revisar', 'next': 'Responsable y profesional deben contrastar la contribución registrada.'}
    if any(o.get('status') == 'no_asignada' for o in opportunities):
        return {'code': 'access', 'label': 'Revisar acceso a oportunidades', 'next': 'Existe una solicitud registrada como no asignada. Revisar el contexto antes de cerrar la evaluación.'}
    if any(o.get('status') in ('asignada', 'completada') for o in opportunities):
        return {'code': 'development', 'label': 'Acordar desarrollo y evaluación', 'next': 'Hay una oportunidad registrada, pero no evidencia validada. Revisar su alcance y el apoyo recibido.'}
    return {'code': 'unknown', 'label': 'Información insuficiente', 'next': 'Solicitar información a la profesional y a su responsable. La ausencia de registro no demuestra falta de oportunidades.'}


def enrich(case):
    case.setdefault('criteria_source', {'document': 'Matriz de carrera de Ingeniería · ejemplo ficticio', 'version': 'Ejemplo inicial', 'defined_by': 'RR. HH. · ejemplo ficticio'})
    for criterion in case['criteria']:
        criterion['assessment'] = classify(criterion)
    return case
