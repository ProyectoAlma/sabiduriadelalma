(function () {
  var FICHAS = window.FICHAS;
  var PLENA = window.PLENA;

  var visor = document.getElementById('visor'),
      lienzo = document.getElementById('lienzo'),
      img = document.getElementById('vImg'),
      vTit = document.getElementById('vTit'), vNum = document.getElementById('vNum'),
      vAnt = document.getElementById('vAnt'), vSig = document.getElementById('vSig'),
      pista = document.getElementById('pista');

  var actual = -1, orden = [], esc = 1, tx = 0, ty = 0, base = {w:0,h:0,x:0,y:0};

  function aplicar() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + esc + ')';
  }
  function medir() {
    var r = img.getBoundingClientRect(), c = lienzo.getBoundingClientRect();
    base.w = img.offsetWidth; base.h = img.offsetHeight;
    base.x = (c.width - base.w) / 2; base.y = (c.height - base.h) / 2;
  }
  function limitar() {
    // la imagen está centrada por el layout en (base.x, base.y);
    // con origen 0 0, su borde queda en base.x + tx y mide base.w * esc
    var c = lienzo.getBoundingClientRect();
    var w = base.w * esc, h = base.h * esc;
    if (w <= c.width) tx = (c.width - w) / 2 - base.x;
    else tx = Math.max(c.width - w - base.x, Math.min(-base.x, tx));
    if (h <= c.height) ty = (c.height - h) / 2 - base.y;
    else ty = Math.max(c.height - h - base.y, Math.min(-base.y, ty));
  }
  function zoomEn(px, py, nueva) {
    nueva = Math.max(1, Math.min(6, nueva));
    var c = lienzo.getBoundingClientRect();
    // punto de la imagen bajo (px,py) antes del zoom
    var ix = (px - c.left - base.x - tx) / esc, iy = (py - c.top - base.y - ty) / esc;
    esc = nueva;
    tx = px - c.left - base.x - ix * esc;
    ty = py - c.top - base.y - iy * esc;
    limitar(); aplicar();
  }
  function reiniciar() { esc = 1; tx = 0; ty = 0; limitar(); aplicar(); }

  function mostrar(i) {
    var f = FICHAS[i];
    actual = i;
    img.src = PLENA[i]; img.alt = f.t;
    vTit.textContent = f.t;
    var p = orden.indexOf(i);
    vNum.textContent = (p >= 0 ? (p + 1) + ' de ' + orden.length + ' · ' : '') + f.g;
    vAnt.disabled = p <= 0; vSig.disabled = p < 0 || p >= orden.length - 1;
    reiniciar();
    img.onload = function () { medir(); reiniciar(); };
  }

  var conHistoria = false;
  function abrir(i, grupo) {
    orden = grupo;
    visor.classList.add('abierto');
    document.body.style.overflow = 'hidden';
    try { history.pushState({ visor: true }, ''); conHistoria = true; } catch (e) {}
    mostrar(i);
    pista.textContent = ('ontouchstart' in window)
      ? 'Pellizcá para acercar · dos toques para ampliar de golpe'
      : 'Rueda del ratón para acercar · arrastrá para moverte';
    pista.classList.remove('ida');
    setTimeout(function () { pista.classList.add('ida'); }, 2800);
  }
  function cerrar(porHistoria) {
    if (!visor.classList.contains('abierto')) return;
    visor.classList.remove('abierto');
    document.body.style.overflow = '';
    img.src = '';
    if (conHistoria && !porHistoria) { conHistoria = false; try { history.back(); } catch (e) {} }
    conHistoria = false;
  }
  window.addEventListener('popstate', function () { cerrar(true); });
  function saltar(d) {
    var p = orden.indexOf(actual) + d;
    if (p >= 0 && p < orden.length) mostrar(orden[p]);
  }

  // abrir desde las tarjetas
  document.querySelectorAll('[data-i]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.dataset.i;
      var cons = b.closest('.grupo');
      var grupo = cons
        ? Array.prototype.map.call(
            cons.querySelectorAll('.lam:not(.oculta)'), function (x) { return +x.dataset.i; })
        : [i];
      abrir(i, grupo.indexOf(i) >= 0 ? grupo : [i]);
    });
  });

  document.getElementById('vCerrar').addEventListener('click', cerrar);
  vAnt.addEventListener('click', function () { saltar(-1); });
  vSig.addEventListener('click', function () { saltar(1); });
  document.getElementById('vMas').addEventListener('click', function () {
    var c = lienzo.getBoundingClientRect();
    zoomEn(c.left + c.width / 2, c.top + c.height / 2, esc * 1.6);
  });
  document.getElementById('vMenos').addEventListener('click', function () {
    var c = lienzo.getBoundingClientRect();
    zoomEn(c.left + c.width / 2, c.top + c.height / 2, esc / 1.6);
  });
  document.addEventListener('keydown', function (e) {
    if (!visor.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') saltar(-1);
    if (e.key === 'ArrowRight') saltar(1);
  });
  window.addEventListener('resize', function () { medir(); limitar(); aplicar(); });

  // rueda
  lienzo.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoomEn(e.clientX, e.clientY, esc * (e.deltaY < 0 ? 1.16 : 1 / 1.16));
  }, { passive: false });

  // punteros: arrastrar y pellizcar
  var punt = new Map(), d0 = 0, e0 = 1, ult = 0, tap = null;
  lienzo.addEventListener('pointerdown', function (e) {
    lienzo.setPointerCapture(e.pointerId);
    punt.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lienzo.classList.add('agarrando');
    if (punt.size === 2) {
      var v = Array.from(punt.values());
      d0 = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y); e0 = esc;
    }
    var ahora = Date.now();
    if (punt.size === 1) {
      if (ahora - ult < 300) {
        zoomEn(e.clientX, e.clientY, esc > 1.6 ? 1 : 2.8);
        ult = 0;
      } else ult = ahora;
    }
  });
  lienzo.addEventListener('pointermove', function (e) {
    if (!punt.has(e.pointerId)) return;
    var ant = punt.get(e.pointerId);
    punt.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punt.size === 2) {
      var v = Array.from(punt.values());
      var d = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
      if (d0 > 0) zoomEn((v[0].x + v[1].x) / 2, (v[0].y + v[1].y) / 2, e0 * d / d0);
    } else if (punt.size === 1) {
      tx += e.clientX - ant.x; ty += e.clientY - ant.y;
      limitar(); aplicar();
    }
  });
  function soltar(e) {
    punt.delete(e.pointerId);
    if (punt.size < 2) d0 = 0;
    if (punt.size === 0) lienzo.classList.remove('agarrando');
  }
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);

  // buscador
  var q = document.getElementById('q'), borrar = document.getElementById('borrar'),
      cuenta = document.getElementById('cuenta'),
      lams = Array.prototype.slice.call(document.querySelectorAll('.lam'));
  function normal(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function filtrar() {
    var t = normal(q.value.trim());
    borrar.style.display = t ? 'block' : 'none';
    if (!t) {
      lams.forEach(function (l) { l.classList.remove('oculta'); });
      document.querySelectorAll('.grupo').forEach(function (c) { c.classList.remove('oculta'); });
      cuenta.textContent = '';
      return;
    }
    var n = 0;
    lams.forEach(function (l) {
      var hay = normal(l.dataset.buscar).indexOf(t) >= 0;
      l.classList.toggle('oculta', !hay); if (hay) n++;
    });
    document.querySelectorAll('.grupo').forEach(function (c) {
      c.classList.toggle('oculta', c.querySelectorAll('.lam:not(.oculta)').length === 0);
    });
    cuenta.textContent = n === 0 ? 'Ninguna lámina con esa palabra'
      : (n === 1 ? '1 lámina' : n + ' láminas');
  }
  q.addEventListener('input', filtrar);
  borrar.addEventListener('click', function () { q.value = ''; filtrar(); q.focus(); });
  document.querySelectorAll('.pistas button').forEach(function (b) {
    b.addEventListener('click', function () { q.value = b.dataset.p; filtrar(); });
  });


  // arrastrar hacia abajo cierra, como en cualquier galería de teléfono
  var y0 = null, arrastreCierre = false;
  lienzo.addEventListener('pointerdown', function (e) {
    if (punt.size === 1 && esc <= 1.02) { y0 = e.clientY; arrastreCierre = false; }
  });
  lienzo.addEventListener('pointermove', function (e) {
    if (y0 === null || punt.size !== 1 || esc > 1.02) return;
    var d = e.clientY - y0;
    if (d > 12) {
      arrastreCierre = true;
      visor.style.transform = 'translateY(' + Math.min(d, 260) + 'px)';
      visor.style.opacity = String(Math.max(0.35, 1 - d / 420));
    }
  });
  function soltarCierre(e) {
    if (y0 === null) { return; }
    var d = e.clientY - y0;
    y0 = null;
    visor.style.transition = 'transform .25s ease, opacity .25s ease';
    if (arrastreCierre && d > 110) {
      visor.style.transform = 'translateY(100%)';
      visor.style.opacity = '0';
      setTimeout(function () {
        cerrar();
        visor.style.transition = ''; visor.style.transform = ''; visor.style.opacity = '';
      }, 240);
    } else {
      visor.style.transform = ''; visor.style.opacity = '';
      setTimeout(function () { visor.style.transition = ''; }, 260);
    }
    arrastreCierre = false;
  }
  lienzo.addEventListener('pointerup', soltarCierre);
  lienzo.addEventListener('pointercancel', soltarCierre);

})();

/* la barra de volver aparece apenas se deja atrás la cabecera */
(function () {
  var b = document.getElementById('barra');
  if (!b) return;
  var cab = document.querySelector('header');
  function mirar() {
    var limite = cab ? cab.offsetHeight - 90 : 240;
    b.classList.toggle('aqui', window.scrollY > limite);
  }
  mirar();
  window.addEventListener('scroll', mirar, { passive: true });
  window.addEventListener('resize', mirar);
})();
