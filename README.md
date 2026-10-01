# Kegel Trainer

App web para entrenar el suelo pélvico con **rutina guiada por cronómetro**, **7 niveles progresivos** y **aviso automático** cuando ya puedes subir de nivel. Funciona en el celular, offline, y se instala en la pantalla de inicio como una app normal.

Todos los datos se guardan **solo en tu teléfono** (localStorage). No hay servidores ni cuentas.

---

## Qué hace

- **Sesión guiada** — un cronómetro cuenta cada contracción y cada descanso, con sonido y vibración. Solo sigues el círculo.
- **Contador de frecuencia** — cada nivel marca cuántas sesiones van al día (o por semana). La pantalla de inicio te muestra "Hoy: 1 de 3" con puntos que se van llenando.
- **7 niveles** — desde la base (3s de contracción) hasta elite (20s + ondas + reverse kegels). Ya están todos diseñados.
- **Aviso de subir de nivel** — cuando completas las sesiones recomendadas y tus últimas sesiones se sintieron fáciles, la app te avisa y cambias de rutina con un botón.
- **Historial y progreso** — calendario del mes, racha de días, minutos totales y sesiones por nivel.
- **Recordatorio diario** a la hora que elijas.
- **Copia de seguridad** — exporta e importa tus datos en un archivo.

---

## Los niveles

| Nivel | Enfoque | Contracción / descanso | Volumen | Frecuencia | Avanza tras |
|------|---------|------------------------|---------|-----------|-------------|
| 1 · Base | Identificar el músculo | 3s / 3s | 10×3 | 3 al día | 12 sesiones |
| 2 · Progresión | Más tiempo + pulsos | 5s / 5s + pulsos | 8×3 | 3 al día | 15 sesiones |
| 3 · Fuerza | Máxima contracción + ondas | 10s / 10s | 5×3 | 2 al día | 18 sesiones |
| 4 · Mantenimiento | Combinado | mixto | — | 3 por semana | 20 sesiones |
| 5 · Resistencia | Tiempos largos + reverse | 15s / 10s | 5×3 | 4 por semana | 20 sesiones |
| 6 · Fuerza máxima | Picos de 20s | 20s / 10s | 4×3 | 2 por semana | 24 sesiones |
| 7 · Elite | Protocolo permanente | mixto | — | 3 por semana | permanente |

> Los **reverse kegels** (relajación controlada) aparecen desde el nivel 5. Son clave para equilibrar tanta contracción y evitar sobre-tensión del suelo pélvico.

---

## Cómo subirla a GitHub y usarla en el celular

No necesitas saber programar. Son unos 10 minutos.

### 1. Crea una cuenta de GitHub (si no tienes)
Entra a **github.com** y regístrate. Es gratis.

### 2. Crea un repositorio
1. Arriba a la derecha haz clic en **+** → **New repository**.
2. Nombre: por ejemplo `kegel-trainer`.
3. Marca **Public** (necesario para que la publicación gratuita funcione).
4. **No** marques "Add a README" (ya hay uno en estos archivos).
5. Clic en **Create repository**.

### 3. Sube los archivos
1. En la página del repo vacío haz clic en **uploading an existing file**.
2. Descomprime el archivo que te pasé y **arrastra todo el contenido** de la carpeta `kegel-app` (el `index.html`, y las carpetas `css`, `js`, `icons`, más `manifest.json`, `service-worker.js` y este `README.md`).
   - Importante: arrastra los **archivos y carpetas de adentro**, no la carpeta `kegel-app` completa, para que `index.html` quede en la raíz.
3. Abajo haz clic en **Commit changes**.

### 4. Actívala con GitHub Pages
1. En el repo ve a **Settings** (arriba).
2. En el menú izquierdo: **Pages**.
3. En **Branch** elige `main` y carpeta `/ (root)`. Clic en **Save**.
4. Espera 1-2 minutos. Aparecerá un enlace tipo:
   `https://TU-USUARIO.github.io/kegel-trainer/`

### 5. Instálala en el celular
1. Abre ese enlace en el navegador del celular (Safari en iPhone, Chrome en Android).
2. **iPhone:** botón compartir → **Añadir a pantalla de inicio**.
   **Android:** menú (⋮) → **Instalar aplicación** / **Añadir a pantalla de inicio**.
3. Listo. Se abre como una app, funciona sin internet y guarda tu progreso.

---

## Personalizar

- **Tu nombre en el saludo:** en `js/app.js`, función `greeting()`, cambia `const name = "Diego";`.
- **Ajustar un nivel:** todo está en `js/levels.js`. Cada ejercicio es una línea con `hold`, `rest`, `reps`, `sets`. Cambia los números y vuelve a subir el archivo.
- **Colores:** en `css/styles.css`, al inicio, la variable `--grad`.

---

## Notas de uso

- No entrenes con la vejiga llena.
- Respira normal durante las contracciones, no aguantes el aire.
- Los primeros resultados se notan en 4-6 semanas con constancia.
- Si sientes molestia o tensión pélvica, baja un nivel y haz más reverse kegels.

---

Hecho para uso personal. Los datos nunca salen de tu dispositivo.
