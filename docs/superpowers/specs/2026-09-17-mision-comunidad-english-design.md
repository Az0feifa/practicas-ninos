# Diseño: Misión Comunidad — práctica bilingüe de inglés

Fecha: 2026-09-17  
Repositorio: `Az0feifa/practicas-ninos`  
Destino público previsto: `/practicas-ninos/ingles/`

## Propósito

Crear una sección independiente para que un niño de ocho años practique el contenido de la prueba de inglés de tercer grado. La experiencia debe enseñar antes de evaluar, explicar cada actividad en español e inglés, ofrecer lectura en voz alta y mantener una dificultad corta, clara y progresiva.

La práctica existente de Ciencias, Español y Estudios Sociales se conserva. La portada principal recibirá un acceso a esta nueva sección.

## Traducción del material adjunto

### Encabezado legible

- Escuela Margarita Rojas.
- Nivel: tercer grado.
- Prueba escrita de comprensión y producción.
- II periodo.
- Fechas visibles: viernes 11 de septiembre (3-4) y viernes 18 de septiembre (3-2).

### Objetivos lingüísticos

1. Reconoce información sencilla sobre los ayudantes de la comunidad.
2. Identifica lugares de la comunidad.
3. Reconoce y nombra bienes y servicios de la comunidad.
4. Combina grafemas del inglés y aplica conciencia fonémica con palabras CVC y las familias `-op` y `-og` para formar palabras nuevas.
5. Escribe oraciones usando el vocabulario estudiado.
6. Comprende un texto escuchado o leído, apoyado por imágenes y con una estructura repetitiva; ordena imágenes para identificar un inicio, un desarrollo y un final claros.
7. Responde preguntas sobre bienes y servicios de la comunidad.
8. Escribe la fecha completa.

### Contenido indicado

- Ayudantes de la comunidad: `farmer`, `doctor`, `nurse`, `mechanic` y otros ejemplos pertinentes.
- Información sencilla: “She takes care of my health.” / “Ella cuida mi salud.” y “She works at a school.” / “Ella trabaja en una escuela.”
- Lugares de la comunidad: `bakery`, `hospital`, `church`, `drugstore`.
- Bienes: `shoes`, `food`, `medicine`.
- Servicios y personas que los prestan: en la hoja aparecen `school`, `dentist`, `firefighter`.
- Familias de palabras `-op` y `-og`.
- Preguntas de comprensión de lectura.
- Preguntas sobre bienes y servicios: “Where can I buy medicine?”, “Where can I get fruit?” y “Who sells meat?”.
- Fecha completa.

## Correcciones pedagógicas

La hoja llama “vowel combination” a `-op` y `-og`; técnicamente se enseñarán como familias de palabras o terminaciones, porque no son combinaciones vocálicas. También separaremos con precisión personas, lugares, bienes y servicios: `school` será lugar, `education` será servicio, y `dentist` y `firefighter` serán personas que prestan servicios. Se conserva el alcance evaluado sin enseñar categorías incorrectas.

## Enfoque de aprendizaje

La aplicación sigue el ciclo escuchar → observar → intentar → recibir explicación → repetir. Un error no resta estrellas ni bloquea el avance. La respuesta correcta se explica en ambos idiomas y el niño puede volver a escucharla.

Habrá cuatro modos accesibles desde un mapa de misiones:

1. **Aprender palabras:** tarjetas con ilustración, término en inglés, traducción y pronunciación.
2. **Practicar:** retos por tema con selección, relación y orden.
3. **Leer y escuchar:** historia corta de tres escenas con comprensión y secuenciación.
4. **Mini examen:** mezcla equilibrada de los temas y un reporte final por habilidad.

## Contenido y actividades

### Ayudantes y lugares

- Reconocer `farmer`, `doctor`, `nurse`, `mechanic`, `teacher`, `baker`, `dentist`, `firefighter` y `butcher`.
- Relacionar ayudante con acción o lugar.
- Ejemplos: “Who takes care of my health?” y “Where does a baker work?”.

### Bienes y servicios

- Distinguir bienes que se compran de servicios que se reciben.
- Responder dónde se consigue medicina, fruta, pan, zapatos y carne.
- Usar respuestas completas y sencillas: “I can buy medicine at the drugstore.”

### Familias `-op` y `-og`

- Formar y reconocer `hop`, `mop`, `pop`, `top`, `dog`, `fog`, `log` y `jog`.
- Escuchar la palabra, escoger la terminación y construirla con letras.
- No incluir palabras innecesarias o vocabulario superior al nivel.

### Comprensión y secuencia

- Historia original de tres escenas con inicio, desarrollo y final.
- Audio en inglés y apoyo opcional en español.
- Tres preguntas literales y una actividad para ordenar escenas.

### Escritura de oraciones y fecha

- Completar oraciones mediante opciones o palabras ordenables; en celular no se exigirá escritura extensa.
- Construir una fecha completa en inglés con día de la semana, mes, ordinal y año.

## Experiencia de voz

Se usará `window.speechSynthesis`, sin servicios externos. Cada pantalla tendrá:

- botón **Escuchar instrucciones**: español primero e inglés después;
- botón **Escuchar inglés** para repetir únicamente la frase o palabra objetivo;
- control visible para activar o silenciar la voz;
- velocidad ligeramente reducida para el inglés y pausas entre idiomas.

El navegador exige una interacción del usuario antes de reproducir audio; por eso la primera voz empezará después de pulsar “Comenzar”. Si no hay una voz exacta `es-CR` o `en-US`, se usará la mejor voz disponible del mismo idioma. Si el navegador no ofrece síntesis de voz, toda la información seguirá visible y la práctica continuará sin bloquearse.

No se usará reconocimiento por micrófono en esta versión: su precisión con voces infantiles y su compatibilidad entre navegadores no son suficientemente confiables para calificar a un niño.

## Interfaz

- Página estática en `ingles/index.html`, con `styles.css`, `activities.js`, `game-engine.js` y `app.js` propios.
- Diseño móvil primero, táctil, con botones de al menos 48 px y texto grande.
- Identidad visual alegre pero ordenada: azul profundo, turquesa, amarillo y coral; tarjetas claras y fondos suaves.
- Ilustraciones vectoriales simples mediante SVG/HTML y símbolos comprensibles; ningún elemento dependerá solo del color.
- Barra de progreso, estrellas por avance y celebraciones discretas.
- Navegación completa con teclado, foco visible, estados anunciados y respeto a `prefers-reduced-motion`.

## Arquitectura y datos

- HTML, CSS y JavaScript sin dependencias ni servicios externos.
- Contenido pedagógico definido como datos estructurados en `activities.js`.
- Funciones puras en `game-engine.js` para mezclar, evaluar, calcular progreso y resumir resultados.
- `app.js` administra pantallas, voz, eventos y estado de sesión.
- Progreso de la sesión guardado localmente; no se recopilan nombres, voz ni datos personales.
- Rutas relativas para funcionar bajo el subdirectorio de GitHub Pages.

## Manejo de errores

- Una voz ausente no impide responder.
- Pulsaciones repetidas cancelan el audio anterior antes de iniciar otro.
- Si se recarga la página, se ofrecerá continuar o comenzar de nuevo.
- Una actividad inválida se omite y se registra en consola sin dejar una pantalla vacía.
- Los controles permanecen deshabilitados durante la transición entre preguntas para evitar respuestas dobles.

## Pruebas y criterios de aceptación

1. Pruebas unitarias para selección aleatoria, evaluación, reintentos, secuencias, fechas y resumen por habilidad.
2. Pruebas de integración del flujo aprender → practicar → resultado.
3. Verificación manual de voz en español e inglés, incluyendo reproducción repetida y modo sin voz.
4. Revisión visual en 390 × 844, tableta y escritorio.
5. Navegación por teclado, foco visible, contraste y movimiento reducido.
6. La portada existente conserva sus funciones y enlaza correctamente a `/ingles/`.
7. La sección funciona con rutas relativas en GitHub Pages.
8. El despliegue de la rama `main` termina correctamente y la URL pública carga sin errores de consola.

## Publicación

El trabajo se desarrollará en una rama aislada. Tras superar pruebas y revisión visual, se integrará en `main`. El flujo existente de GitHub Actions publicará automáticamente el repositorio completo en GitHub Pages; la nueva práctica quedará en `https://az0feifa.github.io/practicas-ninos/ingles/`.

