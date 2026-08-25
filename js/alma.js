(function () {
  var quieto = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // el cielo: estrellas que titilan y destellos que florecen
  var c = document.getElementById('cielo');
  if (c && c.getContext) {
    var x = c.getContext('2d'), estrellas = [], destellos = [], prox = 900;
    function medir() {
      var r = Math.min(window.devicePixelRatio || 1, 2);
      c.width = c.offsetWidth * r; c.height = c.offsetHeight * r;
      x.setTransform(r, 0, 0, r, 0, 0);
      estrellas = [];
      var n = Math.min(220, Math.round(c.offsetWidth * c.offsetHeight / 4600));
      for (var i = 0; i < n; i++) estrellas.push({
        x: Math.random() * c.offsetWidth, y: Math.random() * c.offsetHeight,
        r: Math.random() * 1.35 + .3, f: Math.random() * 6.28,
        v: Math.random() * .6 + .22,
        t: ['255,255,255', '240,216,154', '196,176,255', '150,220,235'][Math.floor(Math.random() * 4)]
      });
    }
    function destello(t) {
      var e = estrellas[Math.floor(Math.random() * estrellas.length)];
      if (e) destellos.push({ x: e.x, y: e.y, t0: t, dur: 1500 + Math.random() * 1100,
                              t: e.t, r: 12 + Math.random() * 16 });
    }
    function pintar(t) {
      x.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
      for (var i = 0; i < estrellas.length; i++) {
        var e = estrellas[i];
        var a = quieto ? .5 : .26 + .5 * (0.5 + 0.5 * Math.sin(t / 1500 * e.v + e.f));
        x.fillStyle = 'rgba(' + e.t + ',' + a.toFixed(3) + ')';
        x.beginPath(); x.arc(e.x, e.y, e.r, 0, 6.2832); x.fill();
      }
      if (!quieto) {
        if (t > prox) { destello(t); prox = t + 1100 + Math.random() * 2200; }
        for (var j = destellos.length - 1; j >= 0; j--) {
          var d = destellos[j], p = (t - d.t0) / d.dur;
          if (p >= 1) { destellos.splice(j, 1); continue; }
          var k = Math.sin(p * Math.PI), r = d.r * k, a2 = k * .85;
          x.strokeStyle = 'rgba(' + d.t + ',' + a2.toFixed(3) + ')';
          x.lineWidth = 1.1;
          x.beginPath();
          x.moveTo(d.x - r, d.y); x.lineTo(d.x + r, d.y);
          x.moveTo(d.x, d.y - r); x.lineTo(d.x, d.y + r);
          x.stroke();
          var g = x.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * .8);
          g.addColorStop(0, 'rgba(' + d.t + ',' + (a2 * .7).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + d.t + ',0)');
          x.fillStyle = g;
          x.beginPath(); x.arc(d.x, d.y, r * .8, 0, 6.2832); x.fill();
        }
        requestAnimationFrame(pintar);
      }
    }
    medir(); requestAnimationFrame(pintar);
    var esperar; window.addEventListener('resize', function () {
      clearTimeout(esperar); esperar = setTimeout(function () {
        medir(); if (quieto) pintar(0);
      }, 200);
    });
  }

  // cada bloque asoma al llegar
  var asomables = document.querySelectorAll(
    'section .titulo, section .entrada, .maestro, .pieza, .atlasCabo, .cons, ' +
    '.frec, .salvedad, .poder, .pregunta, .pasos .paso, .campo, .permiso, ' +
    '.afirmacion li, .libro, .ficha, .red, .aviso, footer .frase');
  if (!quieto && 'IntersectionObserver' in window) {
    asomables.forEach(function (n, i) {
      n.classList.add('asoma');
      n.style.transitionDelay = ((i % 6) * 70) + 'ms';
    });
    var ojo = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('aqui'); ojo.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    asomables.forEach(function (n) { ojo.observe(n); });
  }

  // la cinta lleva a cada poder
  document.querySelectorAll('.tramo').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.dataset.ir);
      if (d) d.scrollIntoView({ block: 'center' });
    });
  });

  // las respuestas viven en este teléfono y en ningún otro lado
  document.querySelectorAll('#preguntas textarea').forEach(function (t) {
    var k = 'alma.' + t.id;
    try { var g = localStorage.getItem(k); if (g) t.value = g; } catch (e) {}
    var esperar;
    t.addEventListener('input', function () {
      clearTimeout(esperar);
      esperar = setTimeout(function () {
        try { localStorage.setItem(k, t.value); } catch (e) {}
      }, 400);
    });
  });
})();


/* ── los videos cargan sólo cuando alguien los toca ─────────────── */
(function () {
  document.querySelectorAll('.marco[data-yt]').forEach(function (m) {
    m.addEventListener('click', function () {
      if (m.classList.contains('cargado')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + m.dataset.yt +
              '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title = m.dataset.titulo || 'Video';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      m.appendChild(f);
      m.classList.add('cargado');
    });
  });
})();

/* ── el muro: guarda el borrador por si se cierra la pestaña ────── */
(function () {
  var f = document.getElementById('muroCosecha');
  if (!f) return;
  f.querySelectorAll('textarea, input[type=text], input[type=email]')
    .forEach(function (c) {
      var k = 'muro.' + c.name;
      try { var g = localStorage.getItem(k); if (g && !c.value) c.value = g; } catch (e) {}
      var esperar;
      c.addEventListener('input', function () {
        clearTimeout(esperar);
        esperar = setTimeout(function () {
          try { localStorage.setItem(k, c.value); } catch (e) {}
        }, 400);
      });
    });
  f.addEventListener('submit', function () {
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('muro.') === 0) localStorage.removeItem(k);
      });
    } catch (e) {}
  });
})();
