# Sabiduría del alma — Costa Rica 2026

El sitio del taller de **René Boiero**. Es la página a la que llega el QR
que se reparte en la sala.

    https://sabiduriadelalma.netlify.app

## Qué hay adentro

| Archivo | Qué es |
|---|---|
| `index.html` | La página principal: los cinco videos, la música, los 14 poderes, las cuatro preguntas, la práctica, el muro de la cosecha, los libros |
| `atlas.html` | Las 22 láminas agrupadas en cinco constelaciones, con visor para ampliarlas |
| `gracias.html` | Lo que ve alguien después de mandar su cosecha |
| `css/alma.css` | Todos los estilos |
| `js/alma.js` | El cielo estrellado, los videos y el muro |
| `js/visor.js` | El visor de láminas del atlas |
| `img/` | Fotos, logo y pósters |
| `img/lam/` | Las 22 láminas en tamaño completo |
| `img/mini/` | Las mismas, chiquitas, para las tarjetas |

## Cómo cambiar un texto

Entrá al archivo acá en GitHub, tocá el lápiz, editá y guardá con
**Commit changes**. Netlify vuelve a publicar solo, en menos de un minuto.
No hay que compilar nada: son archivos sueltos.

Los textos largos están en `index.html`. Si buscás una frase con Ctrl+F la
encontrás tal cual se ve en la página.

## El muro de la cosecha

Es un formulario de Netlify. Las respuestas llegan a
**Netlify → el sitio → Forms → cosecha**, y se pueden bajar en CSV.
El plan gratuito acepta 100 respuestas por mes.

Para que te avisen por correo cada vez que alguien escribe:
**Site settings → Forms → Form notifications → Add notification →
Email notification**.

## Los videos

Están en YouTube, en modo **Oculto**, en el canal @jimenafioni. La página
los incrusta con `youtube-nocookie.com`, así que no dejan cookies de
seguimiento hasta que alguien le da play.

| Video | Frecuencia | Id de YouTube |
|---|---|---|
| El pacto de almas | 963 Hz | `pz9h_qE25Qw` |
| El código sagrado del alma | 528 Hz | `uilACKf3dwM` |
| El campo energético del alma | 741 Hz | `KL6lJcpVBRE` |
| El flujo de energía | 639 Hz | `_2_fFfxlUdQ` |
| El trauma y el flujo | 396 Hz | `TgIZl2CXmCc` |

Si algún día cambiás un video, reemplazá el id en `index.html`
(está en `data-yt="…"`).

## Nota

`<meta name="robots" content="noindex,nofollow">` está puesto a propósito:
el sitio es público, pero no queremos que aparezca en Google. Se llega por
el QR o por el link.
