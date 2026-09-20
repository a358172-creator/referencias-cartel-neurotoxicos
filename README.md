# Vulnerabilidad del cerebro edad-dependiente ante insultos neurotóxicos

Presentación científica interactiva del proyecto, en el repositorio existente. Sitio estático para GitHub Pages: HTML, CSS y JavaScript, sin backend, Node.js, frameworks ni compilación.

## Archivos y contenido conservado

- `index.html`: encabezado, autores, afiliaciones, estructura de la presentación, referencias originales y modal accesible.
- `style.css`: identidad editorial con los tonos marfil, gris cálido y marrón del cartel, temas claro/oscuro, diseño responsive y movimiento reducido. Se conserva el nombre original del archivo.
- `script.js`: configuración científica, YouTube IFrame Player API, sincronización, capítulos, timeline, figuras, copiado y tema.
- `assets/`: ubicación de las figuras originales extraídas del cartel.
- `tests/test_presentation.py`: pruebas de interacción en Chromium con un reproductor simulado, independientes de YouTube.
- `tests/test_svg_assets.py`: integridad de las extracciones y sus definiciones originales.
- `tools/extract_figures.py`: herramienta opcional para reproducir las extracciones de este cartel, sin rasterizar ni redibujar.

Se conservaron las diez referencias completas, sus 23 enlaces DOI/PMID/PMCID, el botón de copiar, la navegación, los autores, las afiliaciones, los metadatos y la identidad visual existente. El antiguo `script.js` contenía un parche `diff` que no podía ejecutarse; se sustituyó por JavaScript funcional. La bibliografía permanece en HTML y se puede leer sin JavaScript.

## Estado del cartel y las figuras

El cartel completo está en **`assets/poster.svg`**. Se renombró el archivo proporcionado con nombre descriptivo largo, sin cambiar su contenido ni crear otra copia. El archivo vacío `poster.vsg` que aparecía al inicio había sido sustituido por el archivo completo durante el trabajo.

Se extrajeron los grupos originales y solo las definiciones SVG que necesitan (recortes, máscaras y transformaciones):

| Capítulo | Archivo | Contenido preservado |
| --- | --- | --- |
| Introducción | `assets/intro.svg` | Esquema completo, etiquetas A–D y leyendas originales |
| Metodología | `assets/methodology.svg` | Diagrama, tablas, condiciones, flechas y notas |
| ROS | `assets/figure-ros.svg` | Gráfica y leyenda de la Figura 2 |
| Peroxidación lipídica | `assets/figure-lipid-peroxidation.svg` | Gráfica y leyenda de la Figura 3 |
| Función mitocondrial / MTT | `assets/figure-mtt.svg` | Gráfica y leyenda de la Figura 4 |

Los cinco recursos son SVG independientes con `viewBox` ajustado. **El original contiene gráficos e ilustraciones rasterizados dentro del SVG**: se conservaron exactamente sus imágenes incrustadas y máscaras; el contenedor SVG no convierte esos gráficos en vectores. Los textos trazados, flechas y demás componentes vectoriales se mantuvieron como vectores. No se modificaron datos, ejes, unidades, etiquetas, leyendas ni símbolos estadísticos.

El cartel tiene conclusiones en texto, sin esquema independiente; el capítulo correspondiente presenta los tres puntos indicados en la solicitud mediante HTML. Se mantiene preparada la ruta `assets/conclusions.svg`, deshabilitada, para añadir un esquema original si lo hubiera en una versión posterior.

Para reproducir la extracción de este mismo archivo: `python3 tools/extract_figures.py`. La herramienta verifica la huella SHA-256 del original antes de usar los grupos revisados. Si cambia el cartel, hay que volver a revisar los grupos y los límites. No es un paso de compilación del sitio.

Para agregar o sustituir una figura, guarda el SVG en `assets/`, edita `image` y `alt` en su entrada de `sections` y activa `imageAvailable: true`. En los cinco recursos existentes ya está activado. Con `false`, no se solicita el archivo: se muestra el contenido HTML alternativo o «Scientific visual unavailable». Un archivo habilitado que falle al cargar también activa esa alternativa. La discusión reutiliza las tres figuras de resultados sin duplicarlas.

## Editar tiempos y textos científicos

La única configuración temporal está en **`const sections`**, al comienzo de `script.js`. Cada capítulo incluye:

- `id`: identificador estable, también usado por enlaces y discusión.
- `start` y `end`: segundos desde el inicio del video.
- `chapter`, `eyebrow`, `title`, `lang`: etiquetas e idioma.
- `type`: `image`, `content` o `multi`.
- `message`: mensaje científico, reutilizado en los resúmenes de resultados.
- `content`: HTML de objetivo, metodología, limitaciones o conclusiones.
- `image`, `alt`, `imageAvailable`: figura y disponibilidad.
- `figures`: identificadores de las figuras de una composición integrada.

Mantén el arreglo ordenado por `start`. El capítulo anterior permanece visible hasta el inicio del siguiente, incluido el intervalo 05:41–05:51; tampoco queda vacío el panel antes de 00:01 ni después de las conclusiones. `end` indica el intervalo rotulado; el siguiente `start` determina cuándo cambia el contenido.

Para añadir un capítulo, agrega un objeto al arreglo con su `id` único y contenido. Su botón y segmento se generan automáticamente. La sección «Claves del estudio» reutiliza las entradas cuyo `eyebrow` comienza por `Resultado `.

El título del proyecto, autores, afiliaciones, pregunta general y texto de integración bajo los resultados se editan en `index.html`. Los metadatos están en `<head>`.

## Cambiar el video

Cambia **`const VIDEO_ID`** al comienzo de `script.js`. El reproductor y los enlaces visibles se actualizan desde ese valor. Actualiza también el enlace dentro de `<noscript>` en `index.html`, destinado a navegadores sin JavaScript, y ajusta los tiempos de `sections` al nuevo video.

La integración utiliza `getCurrentTime()`, `playVideo()`, `pauseVideo()`, `seekTo()` y los eventos del reproductor, conforme a la [documentación oficial de YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference). Consulta el tiempo cada 200 ms, también al pausar y al volver a una pestaña. YouTube mantiene sus propios controles; la timeline es complementaria. Al abrir una figura se pausa el video; cerrar con ×, Escape o el fondo nunca reanuda la reproducción.

Si YouTube falla o tarda más de 15 segundos, siguen disponibles los capítulos, contenidos y referencias, junto a un enlace al video. Si la API termina cargando más tarde, se conecta a la presentación y conserva el capítulo seleccionado sin reproducir automáticamente.

## Referencias y cómo añadir una

Las referencias están al final de `index.html`, dentro de **`<div class="references" id="reference-list">`**. Se preservaron literalmente los diez bloques originales.

Duplica un `<article class="reference">` dentro de ese contenedor y cambia autores, título, revista/fecha y enlaces. Conserva las clases `.ref-number`, `.authors`, `.title`, `.citation` y `.links`. Escribe el número correcto para la lectura sin JavaScript; el script también actualiza la numeración, el contador y el texto del botón de copiar. Si añades fuentes, actualiza el contador inicial `#count` en HTML para la lectura sin JavaScript. No hace falta mantener una segunda lista en JavaScript.

## Vista previa y GitHub Pages

Desde la carpeta del repositorio puedes usar un servidor estático, por ejemplo:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000`. La API de YouTube necesita servir la página por HTTP/HTTPS; abrir `index.html` como `file://` no es una prueba equivalente.

El sitio usa rutas relativas, compatibles con la subcarpeta de un proyecto de GitHub Pages. Publica estos archivos en el **mismo repositorio** y conserva su configuración de Pages. Si todavía no está configurado, selecciona **Settings → Pages → Deploy from a branch**, la rama correspondiente y `/(root)`. No hay un paso de compilación.

## Pruebas de interacción

Las herramientas siguientes son opcionales y solo se utilizan para desarrollo; el sitio publicado no las necesita:

```sh
python3 -m venv /tmp/neuro-browser-tests
/tmp/neuro-browser-tests/bin/pip install playwright
/tmp/neuro-browser-tests/bin/python -m playwright install chromium
/tmp/neuro-browser-tests/bin/python tests/test_presentation.py
python3 -B tests/test_svg_assets.py
```

En Linux pueden requerirse las bibliotecas de Chromium mediante `python -m playwright install-deps chromium` en ese entorno.

Las pruebas usan un reproductor simulado para verificar límites temporales, avances y retrocesos, capítulos, timeline con ratón y teclado, figuras ausentes, modal, referencias, tema, movimiento reducido y tamaños de pantalla. Las figuras de prueba solo se inyectan en memoria y no forman parte del contenido científico. Estas pruebas no certifican la disponibilidad ni la reproducción real del video en YouTube: compruébalas también en la URL publicada, con sus controles nativos.

## Validación realizada

- Diez referencias y 23 enlaces conservados literalmente respecto al HTML inicial.
- Pruebas de navegador: límites temporales e intervalos, avance/retroceso, reproducción/pausa simuladas, capítulos, timeline por clic/teclado, carga tardía, API inaccesible, figura ausente, modal con pausa y sus tres cierres, copiado, tema, almacenamiento restringido y rutas bajo una subcarpeta.
- Responsive revisado entre 320 y 1440 px, con video 16:9, sin desbordamiento horizontal; movimiento reducido y referencias sin JavaScript.
- Extracciones cotejadas visualmente con el cartel y mediante comparación de nodos/definiciones originales, sin recodificar imágenes.
- La API real de YouTube cargó. El video pidió «Sign in to confirm you’re not a bot» en el navegador automatizado, por lo que no se pudo certificar la reproducción real ni sus controles nativos desde este entorno. El sitio mostró correctamente la alternativa con enlace a YouTube; hay que comprobar la reproducción en el navegador habitual y en la URL de Pages.
- Los 23 enlaces bibliográficos se consultaron: 19 respondieron con estado 2xx; cuatro DOI redirigieron a editoriales que devolvieron 403 (SAGE, dos enlaces de JNeurosci y Wiley). Se conservaron sus enlaces y las alternativas PubMed/PMC existentes. Un 403 del servidor editorial no permite confirmar el acceso desde este entorno.

No se publicó ni se hizo push al repositorio durante estas comprobaciones.
