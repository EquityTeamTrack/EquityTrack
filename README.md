# EquityTrack

Aplicación de analítica laboral para equipos de Recursos Humanos. Esta carpeta es una copia independiente y organizada del proyecto; no modifica la versión publicada.

## Abrir la aplicación con Python

Requiere Python 3.9 o posterior. No hay que instalar paquetes externos.

Desde esta carpeta:

```sh
python3 app.py
```

Abre **http://127.0.0.1:8080**. Si ese puerto está ocupado: `python3 app.py --port 8090`.
También puedes ejecutar `npm start` si tienes Node.js, pero Node no es necesario para usar la aplicación.

Python sirve la interfaz y la API y almacena el expediente en `runtime/equitytrack.sqlite3`. La base se crea automáticamente con el caso ficticio y no se incluye en el ZIP. Reiniciar el servidor conserva las aportaciones. Para comenzar de nuevo, detén el servidor y guarda o elimina esa base.

Abrir `index.html` directamente permite explorar el ejemplo, pero no guardar la revisión de oportunidades. Para el recorrido completo utiliza el servidor Python.

## Estructura

- `index.html`: estructura de la aplicación y orden de carga de scripts.
- `assets/logo.jpg`: logo original de EquityTrack.
- `src/styles.css`: estilos, componentes, adaptación a móvil y accesibilidad.
- `src/state.js`: configuración, estado compartido y persistencia local.
- `src/analytics.js`: generación de ejemplos, brecha salarial, promociones y cohortes comparables.
- `src/ui.js`: componentes y presentación de pantallas.
- `src/promotions.js`: ejemplo de alerta previa a una promoción.
- `src/tables.js`: tablas usadas en pantalla y en informes.
- `src/data.js`: CSV, validación, descargas y conector simulado.
- `src/actions.js`: revisiones, medidas correctoras y escenario económico.
- `src/reports.js`: generación del informe HTML e impresión a PDF.
- `src/app.js`: inicio de la aplicación.
- `src/opportunities.js`: expediente, requisitos, evidencias, oportunidades y participación.
- `app.py`: servidor HTTP local y API JSON.
- `equitytrack/domain.py`: clasificación descriptiva de cuestiones pendientes.
- `equitytrack/store.py`: validación, transacciones SQLite e historial de cambios.
- `data/opportunities.json`: caso de ascenso ficticio, utilizado para iniciar la base.
- `tests/test_opportunities.py` y `tests/test_server.py`: reglas, persistencia y API.
- `data/plantilla-ejemplo.csv`: archivo de ejemplo con 192 personas ficticias.
- `tests/check.cjs`: comprobación automatizada sin dependencias externas.

Los scripts usan JavaScript estándar y se cargan con `defer` en el orden declarado en el HTML. Comparten estado en el navegador; no utilizan módulos ES para permitir abrir el archivo directamente sin servidor. Las funciones de presentación generan HTML y las funciones de análisis calculan los indicadores.

## Funcionalidades

1. **Datos:** importación y validación CSV, plantilla descargable y sincronización de nóminas simulada.
2. **Resultados:** salarios por departamento y categoría, progresión por nivel, seguimiento tras permisos y revisión de candidaturas a promociones.
3. **Acciones:** medidas con responsable, fecha y estado, junto con revisiones documentadas.
4. **Informes:** descarga HTML y exportación mediante impresión a PDF.

Las decisiones y medidas se guardan en `localStorage` con la clave `equilibria-v1`, conservada para mantener compatibilidad con el proyecto original. La plantilla importada permanece en memoria y debe volver a cargarse después de recargar la página.

## Comprobar el proyecto

Ejecuta `npm run check` (requiere Node.js). Comprueba el renderizado de las nueve vistas, los cálculos sobre los ejemplos, la lectura de CSV, el rechazo de identificadores duplicados, los grupos de control y la generación del informe. Esta comprobación no sustituye una revisión visual en navegador.

## Datos y cálculos

El CSV requiere las columnas descritas en la pantalla Datos. Los salarios anuales se normalizan por jornada. La brecha compara medias por sexo dentro de departamento y categoría; las categorías deben definir trabajos comparables. La escalera compara tasas de promoción por nivel inicial. Los controles tras permisos usan departamento, categoría, nivel, antigüedad y jornada; son comparaciones descriptivas y no estimaciones causales.

## Revisión de oportunidades

Desde Resultados, pulsa **Revisar oportunidades de ascenso**. El caso muestra el paso de Mid a Sénior con bandas salariales y requisitos explícitos. Para cada requisito se consultan evidencias y experiencias. Las cuestiones se distinguen así:

- Evidencia validada: incorporar a la evaluación.
- Evidencia registrada sin validar: contrastar su alcance.
- Solicitud registrada como no asignada: revisar contexto y posibles alternativas.
- Oportunidad asignada o completada sin evidencia: acordar desarrollo y evaluación.
- Sin datos suficientes: solicitar información y mantener la conclusión pendiente.

La profesional, su responsable y RR. HH. pueden registrar aportaciones. El selector representa **roles declarados para probar el flujo, no identidades autenticadas**. Las evidencias se validan por responsable o RR. HH.; el cierre de revisión corresponde al rol RR. HH. No se automatiza ninguna decisión de promoción.

Las medidas de este caso se guardan en SQLite y se consultan desde su expediente; el plan salarial anterior sigue guardado en el navegador. El expediente es un caso independiente del CSV: no atribuye su historial a ninguna persona importada. Las aportaciones no se sobrescriben y cada cambio deja evento, rol declarado y fecha UTC. El informe específico se descarga en HTML y puede imprimirse desde el navegador.

## Pruebas Python

```sh
python3 -m unittest discover -s tests -v
```

Las pruebas utilizan bases temporales y no alteran los datos locales. Cubren ausencia de registros, revisión de evidencias, acceso a experiencias, desacuerdos, medidas, validación y peticiones HTTP.

## Arquitectura y alcance

El servidor y la persistencia del nuevo expediente están escritos en Python estándar con SQLite. La interfaz utiliza HTML, CSS y JavaScript. Los análisis salariales, CSV y gráficos anteriores siguen calculándose en JavaScript; no se ha reescrito todo el motor anterior en Python.

Es una aplicación local de un solo espacio: no incluye autenticación real, aislamiento multiempresa ni conexión efectiva a nóminas. El servidor escucha solo en 127.0.0.1. No está preparado para exponer datos laborales reales en Internet sin controles adicionales. Los informes requieren revisión profesional y los importes sancionadores son escenarios parametrizados.

## Publicación

La versión completa necesita un alojamiento que ejecute Python y un volumen persistente para SQLite. La publicación estática anterior no ejecuta esta API. Esta carpeta no contiene credenciales ni identidad de alojamiento; el sitio publicado se conserva sin modificar.

## Autoridad de RR. HH. y procedencia de requisitos

RR. HH. introduce la matriz de carrera aprobada por la empresa y documenta su origen (documento, versión y responsable). Los criterios iniciales son ficticios y se identifican como tales. EquityTrack no genera ni impone requisitos.

La pantalla distingue avisos descriptivos de la valoración humana de cada requisito. Solo el rol declarado de RR. HH. puede editar requisitos y registrar «cumple», «aún no cumple» o «pendiente», junto con su justificación. Validar una evidencia no da por cumplido el requisito. Al cambiar el texto de un requisito se elimina su valoración anterior y la revisión global vuelve a pendiente. El informe incluye procedencia, valoración, motivos, rol y fecha. Estos roles siguen siendo de prueba, sin autenticación real.

La pantalla de oportunidades es compacta: muestra cuatro requisitos y la conclusión. El detalle se abre con «Revisar». Origen de criterios, aportaciones, medidas e historial se consultan en ventanas secundarias. Los archivos de interfaz llevan versión de carga y el servidor evita reutilizar contenido antiguo.

## Base española de referencia (07/11/2026)

Los criterios iniciales se han sustituido por una propuesta adaptada de los artículos 11 y 15 del XIX Convenio TIC (BOE-A-2025-7766), firmado por CCOO y UGT. Se muestran cuatro dimensiones: formación/conocimientos, autonomía/iniciativa, organización de actividades y experiencia/contribuciones. Es una adaptación del producto, no una matriz sindical aprobada ni una equivalencia automática entre Mid/Sénior y grupos profesionales. RR. HH. confirma aplicabilidad y criterios específicos conforme al convenio y acuerdos de empresa, con la participación que corresponda a la representación laboral.

`data/reference-framework.json` y el expediente incluyen las referencias de BOE, CCOO, UGT e INE. La diferencia del 15,74 % se calcula a partir de la ganancia media anual del INE de 2023: mujeres 25.591,31 € y hombres 30.372,49 €. Es un contexto nacional sin ajustar, no una tasa específica de tecnología ni una medida de mérito individual. La referencia sindical de UGT reproduce el mismo dato INE; no constituye una estimación independiente. No se aplican porcentajes nacionales a las valoraciones personales.

La migración conserva aportaciones y decisiones previas en el historial, mantiene requisitos editados por RR. HH. y deja pendiente la revisión global. Las evidencias ficticias no se convierten en evidencias reales por añadir estas referencias.

## Asistente de datos con Gemini

El botón de conversación está abajo a la derecha. Usa la API REST oficial de Gemini a través del servidor Python. El código de integración está separado en `gemini_api.py`; el navegador nunca recibe la clave. No utiliza paquetes externos.

### Activar la conexión

1. Crea una clave de Gemini en https://aistudio.google.com/apikey.
2. Copia `.env.example` como `.env` si no existe y completa `GEMINI_API_KEY=tu_clave`. En esta copia local ya existe un `.env` vacío.
3. Reinicia Python con `python3 app.py --port 8091` y abre http://127.0.0.1:8091.
4. Pulsa el icono de conversación y pregunta sobre los resultados.

`GEMINI_MODEL` es configurable; por defecto se usa `gemini-2.5-flash`. También pueden configurarse ambas variables en el entorno, que tiene prioridad sobre `.env`.

### Qué se comparte

Solo al pulsar Enviar se transmiten a Google la pregunta, los últimos seis turnos de conversación y un resumen agregado de salarios, promociones y permisos del filtro actual. No se envían las filas individuales del CSV ni las evidencias, aportaciones o textos del expediente. Los grupos salariales y de promoción con menos de cinco personas por sexo no se incluyen. Para permisos se requieren al menos cinco trayectorias y cinco controles distintos. Las etiquetas de departamento/categoría sí forman parte del resumen. Evita información identificable en preguntas y etiquetas; los datos ficticios permiten probar el recorrido.

El asistente explica los datos disponibles; no ejecuta acciones ni toma decisiones sobre personas. La conversación permanece solo en memoria del navegador y se borra al recargar o pulsar «Nueva conversación». El servidor no la guarda en SQLite. Google procesa las consultas según las condiciones de tu cuenta/API. La aplicación sigue siendo local, sin autenticación para un despliegue público.

### Archivos para GitHub

Sube `gemini_api.py`, `.env.example`, los archivos `src/chatbot.js` y `src/chatbot.css` y el resto del proyecto. **Nunca subas `.env` ni claves reales.** `.gitignore` los excluye. El ZIP entregado contiene la plantilla vacía, pero no el `.env` local. GitHub Pages no ejecuta el servidor Python ni esta integración.

### Comprobaciones

`python3 -m unittest discover -s tests -v` incluye pruebas de configuración, petición REST simulada, exclusión de campos personales, errores de cuota/permisos y bloqueo HTTP del archivo privado. Sin una clave válida no puede verificarse una respuesta real de Gemini; no se simula una respuesta en la interfaz.

Documentación: https://ai.google.dev/gemini-api/docs/api-key y https://ai.google.dev/api/generate-content.
