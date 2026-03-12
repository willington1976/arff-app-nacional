/**
 * sei-pdf-generator.js  v2.0
 * ─────────────────────────────────────────────────────────────────
 * Sistema centralizado de generación de reportes PDF institucionales
 * Sistema SEI — Bomberos Aeronáuticos de Colombia
 *
 * DEPENDENCIAS (incluir en el <head> de cada módulo que lo use):
 *   <link rel="stylesheet" href="css/sei-pdf-style.css">
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
 *   <script src="js/sei-pdf-generator.js"></script>
 *
 * USO — forma simple (reemplaza el _doPDF() existente):
 *   generarReporteSEI('nombre-archivo', 'id-contenedor')
 *
 * USO — con opciones:
 *   generarReporteSEI('nombre-archivo', 'id-contenedor', {
 *     titulo:        'Título del reporte',
 *     subtitulo:     'Subtítulo',
 *     estacion:      'SKBO',
 *     norma:         'RAC 14 § 315',
 *     orientacion:   'portrait',   // 'portrait' | 'landscape'
 *     formato:       'a4',         // 'a4' | 'letter'
 *     mostrarFirmas: false
 *   })
 *
 * Función auxiliar para insertar botón PDF en un contenedor:
 *   insertarBotonPDF('id-contenedor-boton', 'nombre-pdf', 'id-contenido', opciones)
 *
 * COMPATIBILIDAD CON MÓDULOS EXISTENTES:
 *   Los módulos ya tienen exportPDF() + _doPDF(). Solo hay que remplazar
 *   el cuerpo de _doPDF() con una llamada a generarReporteSEI().
 * ─────────────────────────────────────────────────────────────────
 */

(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     CONSTANTES INSTITUCIONALES
  ═══════════════════════════════════════════════════════════════ */
  var ORG_NOMBRE  = 'BOMBEROS AERONÁUTICOS DE COLOMBIA';
  var ORG_SISTEMA = 'Sistema SEI — Reporte Técnico';
  var LOGO_1      = 'Logo institucional.png';
  var LOGO_2      = 'LOGO_SEI_CLEAN.png';

  /* ═══════════════════════════════════════════════════════════════
     HELPERS DE FECHA
  ═══════════════════════════════════════════════════════════════ */
  var MESES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  function fechaLarga() {
    var d = new Date();
    return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function horaActual() {
    var d = new Date();
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ' hrs';
  }

  function codigoReporte(est) {
    var oaci = localStorage.getItem("aeropuerto_oaci") || est || 'SEI';
    var d  = new Date();
    var yy = d.getFullYear();
    var mm = String(d.getMonth()+1).padStart(2,'0');
    var dd = String(d.getDate()).padStart(2,'0');
    var hh = String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0');
    return 'SEI-' + (oaci).toUpperCase() + '-' + yy + mm + dd + '-' + hh;
  }

  /* ═══════════════════════════════════════════════════════════════
     GENERADOR DE HTML — ENCABEZADO INSTITUCIONAL
  ═══════════════════════════════════════════════════════════════ */
  function htmlEncabezado(opts) {
    var oaci = localStorage.getItem("aeropuerto_oaci") || opts.estacion || '—';
    return (
      '<div class="sei-pdf-header">' +
        '<img class="sei-pdf-header-logo" src="' + LOGO_1 + '" ' +
          'onerror="this.src=\'' + LOGO_2 + '\';this.onerror=null;" alt="Logo SEI Bomberos">' +
        '<div class="sei-pdf-header-center">' +
          '<div class="sei-pdf-header-org">' + ORG_NOMBRE + '</div>' +
          '<div class="sei-pdf-header-system">' + ORG_SISTEMA + '</div>' +
        '</div>' +
        '<div class="sei-pdf-header-right">' +
          '<div class="sei-pdf-header-date-label">Fecha de emisión</div>' +
          '<div class="sei-pdf-header-date-val">' + fechaLarga() + '</div>' +
          '<div class="sei-pdf-header-date-val">' + horaActual() + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sei-pdf-strip"></div>' +
      '<div class="sei-pdf-report-title">' + (opts.titulo || 'Reporte Operacional SEI') + '</div>' +
      (opts.subtitulo ? '<div class="sei-pdf-report-subtitle">' + opts.subtitulo + '</div>' : '') +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">' +
        '<div style="font-size:8pt;color:#444;border:1px solid #c8cedc;border-radius:3px;padding:2px 9px;">' +
          '📍 OACI: <strong>' + oaci.toUpperCase() + '</strong>' +
        '</div>' +
        (opts.norma ?
          '<div style="font-size:8pt;color:#444;border:1px solid #c8cedc;border-radius:3px;padding:2px 9px;">' +
            '📋 Norma: <strong>' + opts.norma + '</strong>' +
          '</div>'
        : '') +
        '<div style="font-size:8pt;color:#444;border:1px solid #c8cedc;border-radius:3px;padding:2px 9px;">' +
          '🗂️ N°: <strong>' + codigoReporte(oaci) + '</strong>' +
        '</div>' +
      '</div>'
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     GENERADOR DE HTML — PIE DE PÁGINA
  ═══════════════════════════════════════════════════════════════ */
  function htmlPiePagina(opts) {
    var oaci = localStorage.getItem("aeropuerto_oaci") || opts.estacion || '—';
    return (
      '<div class="sei-pdf-footer">' +
        '<div class="sei-pdf-footer-left">' +
          '<strong>' + ORG_NOMBRE + '</strong><br>' +
          'Sistema SEI · Estación: ' + oaci.toUpperCase() + '<br>' +
          'Generado el ' + fechaLarga() +
        '</div>' +
        '<div class="sei-pdf-footer-right">' +
          'Documento de Uso Oficial<br>' +
          '<span class="sei-pdf-footer-badge">AEROCIVIL · UAEAC · REAC</span>' +
        '</div>' +
      '</div>'
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     GENERADOR DE HTML — ÁREA DE FIRMAS
  ═══════════════════════════════════════════════════════════════ */
  function htmlFirmas() {
    return (
      '<div class="sei-pdf-firma-grid">' +
        '<div class="sei-pdf-firma-box">' +
          '<div style="height:40px;"></div>' +
          '<div class="firma-label">Oficial SEI Responsable</div>' +
          '<div style="font-size:7.5pt;margin-top:2px;color:#555;">Nombre · Matrícula · Firma</div>' +
        '</div>' +
        '<div class="sei-pdf-firma-box">' +
          '<div style="height:40px;"></div>' +
          '<div class="firma-label">Jefe de Estación / Bombero Jefe</div>' +
          '<div style="font-size:7.5pt;margin-top:2px;color:#555;">Nombre · Matrícula · Firma</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     LIMPIEZA DEL CLON — elimina modo oscuro y controles UI
  ═══════════════════════════════════════════════════════════════ */
  function limpiarClon(clon) {
    /* 1. Ocultar elementos de navegación y botones */
    var selectores = [
      'button', '.btn-calc', '.btn-return', '.btn-back', '.btn-pdf',
      '.btn-eval', '.btn-action', '.btn-save', '.btn-del', '.btn-nov',
      '.btn-logout', '.btn-menu-toggle', 'nav', '.topbar', '.sidebar',
      '.scanlines', '.fab', '.toast', '#toast', '.admin-controls',
      '[id*="loader"]', '.loader-wrap', '.sb-overlay'
    ];
    selectores.forEach(function(sel) {
      clon.querySelectorAll(sel).forEach(function(el) {
        el.style.display = 'none';
      });
    });

    /* 2. Convertir inputs → texto plano visible */
    clon.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(function(el) {
      var valorTexto = el.value !== undefined ? el.value : (el.textContent || '');
      var span = document.createElement('span');
      span.textContent = valorTexto || '—';
      span.style.cssText = 'font-family:"Courier New",monospace;font-size:9.5pt;color:#1a1a2e;';
      if (el.parentNode) el.parentNode.replaceChild(span, el);
    });

    /* 3. Limpiar animaciones y sombras de todos los elementos */
    clon.querySelectorAll('*').forEach(function(el) {
      el.style.animation  = 'none';
      el.style.transition = 'none';
      el.style.textShadow = 'none';
      el.style.boxShadow  = 'none';
      /* forzar colores: si el elemento tiene --webkit-text-fill-color, lo eliminamos */
      el.style.webkitTextFillColor = '';
    });

    /* 4. Limpiar body::before, ::after pseudo-elementos vía clase */
    clon.querySelectorAll('[class*="scanline"], body::before, body::after').forEach(function(el) {
      if (el.remove) el.remove();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     INYECTAR CSS SI AÚN NO ESTÁ CARGADO
  ═══════════════════════════════════════════════════════════════ */
  function asegurarCSS() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].href.indexOf('sei-pdf-style') !== -1) return;
    }
    var link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'css/sei-pdf-style.css';
    document.head.appendChild(link);
  }

  /* ═══════════════════════════════════════════════════════════════
     INDICADOR DE CARGA (overlay)
  ═══════════════════════════════════════════════════════════════ */
  function mostrarOverlay() {
    var ov = document.createElement('div');
    ov.id = '_sei_pdf_overlay';
    ov.innerHTML = (
      '<div style="position:fixed;top:0;left:0;right:0;bottom:0;' +
      'background:rgba(6,12,20,0.85);z-index:999999;display:flex;' +
      'flex-direction:column;align-items:center;justify-content:center;gap:14px;">' +
        '<div style="width:56px;height:56px;border-radius:50%;border:3px solid #003087;' +
             'border-top-color:#0057b8;animation:_spinseis 0.9s linear infinite;"></div>' +
        '<div style="color:#fff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:.07em;">' +
          'GENERANDO PDF INSTITUCIONAL' +
        '</div>' +
        '<div style="color:#8ab4cc;font-family:Arial,sans-serif;font-size:11px;">' +
          'Sistema SEI · Formato A4 · Fondo blanco' +
        '</div>' +
      '</div>'
    );
    /* keyframes para el spinner */
    if (!document.getElementById('_sei_spin_style')) {
      var st = document.createElement('style');
      st.id  = '_sei_spin_style';
      st.textContent = '@keyframes _spinseis{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
    document.body.appendChild(ov);
    return ov;
  }

  function quitarOverlay(ov) {
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }

  /* ═══════════════════════════════════════════════════════════════
     FUNCIÓN PRINCIPAL PÚBLICA
     generarReporteSEI(nombreArchivo, idContenedor [, opciones])
  ═══════════════════════════════════════════════════════════════ */
  global.generarReporteSEI = function(nombreArchivo, idContenedor, opciones) {

    /* ── 0. Validar que html2pdf está disponible ─────────────── */
    if (typeof html2pdf === 'undefined') {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.onload = function() { global.generarReporteSEI(nombreArchivo, idContenedor, opciones); };
      document.head.appendChild(s);
      return;
    }

    /* ── 1. Obtener el contenedor de origen con validación y fallback ──── */
    var fuente = document.getElementById(idContenedor);
    
    // Fallback si el ID no existe
    if (!fuente) {
      var fallbacks = ['result-box', 'result-panel', 'pdf-content'];
      for (var i = 0; i < fallbacks.length; i++) {
        var f = document.getElementById(fallbacks[i]);
        if (f) {
          console.warn('[SEI-PDF] ID "' + idContenedor + '" no encontrado. Usando fallback: #' + fallbacks[i]);
          fuente = f;
          break;
        }
      }
    }

    if (!fuente) {
      console.error('[SEI-PDF] Error crítico: No se encontró el contenedor "' + idContenedor + '" ni ningún fallback.');
      alert('Error: No se encontró el contenedor de resultados.\nVerifique que el formulario tenga resultados generados.');
      return;
    }

    /* ── 2. Opciones por defecto ─────────────────────────────── */
    var opts = {
      titulo:        'Reporte Técnico SEI',
      subtitulo:     '',
      estacion:      '—',
      norma:         '',
      orientacion:   'portrait',
      formato:       'a4',
      mostrarFirmas: false
    };
    if (opciones && typeof opciones === 'object') {
      Object.keys(opciones).forEach(function(k) { opts[k] = opciones[k]; });
    }

    /* ── 3. Asegurar hoja de estilos PDF ─────────────────────── */
    asegurarCSS();

    /* ── 4. Mostrar indicador de progreso ────────────────────── */
    var overlay = mostrarOverlay();

    /* ── 5. Delay de renderización antes de capturar ──────────── */
    setTimeout(function() {
      try {
        /* ── 6. Clonar y limpiar el contenido ────────────────────── */
        var clon = fuente.cloneNode(true);
        clon.removeAttribute('id');
        limpiarClon(clon);

        /* ── 7. Construir el documento PDF completo ──────────────── */
        var wrapper = document.createElement('div');
        wrapper.className = 'sei-pdf-root';
        wrapper.innerHTML = (
          htmlEncabezado(opts) +
          '<hr class="sei-pdf-divider">' +
          '<div class="sei-pdf-section">' +
            clon.innerHTML +
          '</div>' +
          (opts.mostrarFirmas ? htmlFirmas() : '') +
          '<hr class="sei-pdf-divider" style="margin-top:20px;">' +
          htmlPiePagina(opts)
        );

        /* Montar en DOM fuera de pantalla para que html2canvas pueda renderizarlo */
        wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;z-index:-1;';
        document.body.appendChild(wrapper);

        /* ── 8. Configurar html2pdf y descargar ──────────────────── */
        var pdfConfig = {
          margin:      [12, 12, 12, 12],
          filename:    (nombreArchivo || 'reporte-sei') + '.pdf',
          image:       { type: 'jpeg', quality: 0.97 },
          html2canvas: {
            scale:           2,
            useCORS:         true,
            allowTaint:      true,
            backgroundColor: '#ffffff',
            logging:         false,
            removeContainer: true
          },
          jsPDF: {
            unit:        'mm',
            format:      opts.formato || 'a4',
            orientation: opts.orientacion || 'portrait'
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf()
          .set(pdfConfig)
          .from(wrapper)
          .save()
          .then(function() {
            if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
            quitarOverlay(overlay);
            console.log('[SEI-PDF] ✔ PDF generado: ' + pdfConfig.filename);
          })
          .catch(function(err) {
            if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
            quitarOverlay(overlay);
            console.error('[SEI-PDF] Error en html2pdf:', err);
            alert('Error al generar el PDF. Revise la consola.');
          });

      } catch (e) {
        quitarOverlay(overlay);
        console.error('[SEI-PDF] Excepción en generarReporteSEI:', e);
      }
    }, 200); // 200ms delay para renderización
  };

  /* ═══════════════════════════════════════════════════════════════
     FUNCIÓN AUXILIAR: insertarBotonPDF
     Agrega un botón de descarga a cualquier contenedor del DOM.
  ═══════════════════════════════════════════════════════════════ */
  global.insertarBotonPDF = function(idContenedor, nombrePDF, idContenido, opciones) {
    var cont = document.getElementById(idContenedor);
    if (!cont) { console.warn('[SEI-PDF] insertarBotonPDF: contenedor no encontrado:', idContenedor); return; }

    var btn = document.createElement('button');
    btn.innerHTML = (
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">' +
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
        '<polyline points="14,2 14,8 20,8"/>' +
        '<line x1="12" y1="18" x2="12" y2="12"/><polyline points="9,15 12,18 15,15"/>' +
      '</svg> Descargar PDF'
    );
    btn.style.cssText = (
      'display:inline-flex;align-items:center;gap:7px;padding:9px 18px;' +
      'background:linear-gradient(135deg,#003087,#0057b8);' +
      'color:#fff;border:none;border-radius:7px;font-family:Arial,sans-serif;' +
      'font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;' +
      'cursor:pointer;transition:opacity .2s,transform .15s;margin:6px 0;'
    );
    btn.onmouseover = function() { btn.style.opacity='0.88'; btn.style.transform='translateY(-1px)'; };
    btn.onmouseout  = function() { btn.style.opacity='1';    btn.style.transform='none'; };
    btn.onclick = function() { global.generarReporteSEI(nombrePDF, idContenido, opciones); };
    cont.appendChild(btn);
  };

  /* ═══════════════════════════════════════════════════════════════
     LOG DE INICIALIZACIÓN
  ═══════════════════════════════════════════════════════════════ */
  console.log(
    '[SEI-PDF] v2.0 cargado ✔ — ' +
    'generarReporteSEI() e insertarBotonPDF() disponibles globalmente.'
  );

})(window);
