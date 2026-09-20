# Figuras del cartel

`poster.svg` es el archivo original proporcionado, renombrado sin cambios de contenido.

SHA-256: `2b8e8dc342fbcc70b5abddba1f41ad1b1de99992dfab2b0e6c0b928d0efb76d0`.

Los archivos `intro.svg`, `methodology.svg`, `figure-ros.svg`, `figure-lipid-peroxidation.svg` y `figure-mtt.svg` contienen grupos copiados del original, sus máscaras, transformaciones y definiciones necesarias. Cada `viewBox` enmarca la figura completa; las tres gráficas incluyen sus leyendas. La introducción conserva sus paneles A–D y sus leyendas. La metodología conserva tablas y notas.

El original mezcla vectores e imágenes PNG incrustadas. Las imágenes incrustadas se preservan byte por byte: no se vectorizaron ni aumentaron artificialmente de resolución. El resto de los elementos mantiene su representación vectorial.

Las conclusiones del cartel son texto; no existe un esquema independiente que extraer como `conclusions.svg`.

La extracción es reproducible con `python3 tools/extract_figures.py` desde la raíz del repositorio. Los índices y límites revisados están en esa herramienta; su verificación del original evita aplicar por error estos recortes a otro cartel.
