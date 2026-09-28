# Datos de perros desde Excel

La sección **Nuestros animales** lee la hoja `Sheet1` de `assets/database/Animales.xlsx` directamente al abrir la web. Muestra los últimos cuatro perros que tengan `Nombre`, `Edad` y `Descripción`, manteniendo su orden en la hoja. La imagen principal se carga desde `media/animales/<carpeta>/00.jpg`, usando el valor de la columna `carpeta`; si falta o no se encuentra, se usa una imagen predeterminada. El navegador solo descarga y lee archivos; la página no escribe en el Excel.

## Columnas

La primera fila de `Sheet1` debe incluir:

- `Nombre`
- `Edad`
- `Descripción`

También se reconocen opcionalmente:

- `Género` (también `Sexo` o `Gender`): se muestra junto a la edad cuando tiene valor.
- `Carpeta` (también `Folder`): nombre de la carpeta del perro dentro de `media/animales`. Esa carpeta debe contener la foto `00.jpg`.
- `Estado web`: las filas con `editando`, `borrador`, `oculto`, `inactivo`, `archivado` o `no publicar` se omiten. Otros estados se muestran.
Para ver cambios del Excel publicado, hay que volver a cargar la página; el navegador descarga el archivo sin caché.

La página de diagnóstico `/test-excel.html` permite comprobar la lectura, verificar las columnas obligatorias y previsualizar qué filas se mostrarían.

La página `rifa.html` lee `assets/database/Rifa.xlsx`, hoja `Sheet1`: `C1` define el número máximo y los números indicados en la columna A desde la fila 2 se marcan con huellas como comprados.

## Rifa
La página ifa.html lee Rifa.xlsx en Sheet1: C1 define el máximo, C2 el precio, C3 la fecha del sorteo y C4 la descripción del premio. Los números comprados se leen de la columna A a partir de A2. Para la galería en GitHub Pages, lista cada nombre de imagen de media/rifa en media/rifa/imagenes.txt, uno por línea, ya que los servidores estáticos no permiten enumerar archivos de una carpeta.
