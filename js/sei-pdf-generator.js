/**
 * sei-pdf-generator.js
 * ─────────────────────────────────────────────────────────────────
 * Sistema de generación de reportes PDF institucionales
 * Sistema SEI — Bomberos Aeronáuticos de Colombia
 *
 * DEPENDENCIAS (incluir antes de este script en el HTML):
 *   <link rel="stylesheet" href="css/sei-pdf-style.css">
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
 *   <script src="js/sei-pdf-generator.js"></script>
 *
 * USO:
 *   generarReporteSEI('nombre-archivo', 'idDelContenido', opciones)
 *
 * OPCIONES (todas opcionales):
 *   titulo        {string}  Título del reporte (default: "Reporte Operacional SEI")
 *   subtitulo     {string}  Subtítulo descriptivo
 *   estacion      {string}  Código OACI de la estación (ej. "SKBO")
 *   mostrarFirmas {boolean} Añade área de firmas al final (default: false)
 *   orientacion   {string}  'portrait' | 'landscape'   (default: 'portrait')
 * ─────────────────────────────────────────────────────────────────
 *
 * NOTA: Este script NO modifica ningún archivo existente.
 *       Clona el contenido objetivo, aplica estilos institucionales
 *       sobre el clon, genera el PDF y descarta el clon.
 */

(function (global) {
  'use strict';

  /* ─── Constantes institucionales ────────────────────────────────── */
  var SEI_ORG_NAME    = 'BOMBEROS AERONÁUTICOS DE COLOMBIA';
  var SEI_SYSTEM_NAME = 'Sistema SEI — Reporte Operacional';
  var SEI_LOGO_PATH   = 'Logo institucional.png';   /* relativo al HTML que lo llama */
  var SEI_LOG_FALLBACK = 'LOGO_SEI_CLEAN.png';       /* segunda opción */

  /* ─── Formatear fecha en español ────────────────────────────────── */
  function formatearFecha(d) {
    var meses = [
      'Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
    ];
    return d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
  }

  /* ─── Formatear hora HH:MM ───────────────────────────────────────── */
  function formatearHora(d) {
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m + ' hrs';
  }

  /* ─── Generar número de reporte correlativo ──────────────────────── */
  function numeroReporte(estacion) {
    var ahora = new Date();
    var anio  = ahora.getFullYear();
    var mes   = String(ahora.getMonth() + 1).padStart(2, '0');
    var dia   = String(ahora.getDate()).padStart(2, '0');
    var ts    = String(ahora.getHours()) + String(ahora.getMinutes()).padStart(2,'0');
    return 'SEI-' + (estacion || 'XX') + '-' + anio + mes + dia + '-' + ts;
  }

  /* ─── Construir HTML del encabezado institucional ────────────────── */
  function crearEncabezado(opts) {
    var ahora      = new Date();
    var fecha      = formatearFecha(ahora);
    var hora       = formatearHora(ahora);
    var estacion   = opts.estacion   || '—';
    var titulo     = opts.titulo     || 'Reporte Operacional SEI';
    var subtitulo  = opts.subtitulo  || '';
    var nrReporte  = numeroReporte(opts.estacion);

    /* Construir la etiqueta <img> del logo con fallback */
    var logoHtml = '<img class="sei-pdf-header-logo" src="' + SEI_LOGO_PATH + '" '
      + 'onerror="this.src=\'' + SEI_LOG_FALLBACK + '\';this.onerror=null;" '
      + 'alt="Logo SEI">';

    var html = ''
      + '<div class="sei-pdf-header">'
      +   logoHtml
      +   '<div class="sei-pdf-header-center">'
      +     '<div class="sei-pdf-header-org">' + SEI_ORG_NAME + '</div>'
      +     '<div class="sei-pdf-header-system">' + SEI_SYSTEM_NAME + '</div>'
      +   '</div>'
      +   '<div class="sei-pdf-header-right">'
      +     '<div class="sei-pdf-header-date-label">Fecha de emisión</div>'
      +     '<div class="sei-pdf-header-date-val">' + fecha + '</div>'
      +     '<div class="sei-pdf-header-date-val">' + hora + '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="sei-pdf-strip"></div>'
      + '<div class="sei-pdf-report-title">' + titulo + '</div>'
      + (subtitulo ? '<div class="sei-pdf-report-subtitle">' + subtitulo + '</div>' : '')
      + '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">'
      +   '<div style="font-size:8pt;color:#555;border:1px solid #c8cedc;border-radius:3px;padding:2px 9px;">'
      +     '📍 Estación: <strong>' + estacion + '</strong>'
      +   '</div>'
      +   '<div style="font-size:8pt;color:#555;border:1px solid #c8cedc;border-radius:3px;padding:2px 9px;">'
      +     '🗂️ N° Reporte: <strong>' + nrReporte + '</strong>'
      +   '</div>'
      + '</div>';

    return html;
  }

  /* ─── Construir HTML del pie de página ──────────────────────────── */
  function crearPiePagina(opts) {
    var estacion = opts.estacion || '—';
    var fecha    = formatearFecha(new Date());

    var html = ''
      + '<hr class="sei-pdf-divider">'
      + '<div class="sei-pdf-footer">'
      +   '<div class="sei-pdf-footer-left">'
      +     '<strong>' + SEI_ORG_NAME + '</strong><br>'
      +     'Sistema SEI · Estación: ' + estacion + '<br>'
      +     'Documento generado el ' + fecha
      +   '</div>'
      +   '<div class="sei-pdf-footer-right">'
      +     'Uso Oficial — Confidencial<br>'
      +     '<span class="sei-pdf-footer-badge">AEROCIVIL · REAC</span>'
      +   '</div>'
      + '</div>';

    return html;
  }

  /* ─── Construir área de firmas ───────────────────────────────────── */
  function crearFirmas() {
    return ''
      + '<div class="sei-pdf-firma-grid">'
      +   '<div class="sei-pdf-firma-box">'
      +     '<div style="height:36px;"></div>'
      +     '<div class="firma-label">Oficial SEI Responsable</div>'
      +     '<div style="font-size:7.5pt;margin-top:2px;color:#555;">Nombre y matrícula</div>'
      +   '</div>'
      +   '<div class="sei-pdf-firma-box">'
      +     '<div style="height:36px;"></div>'
      +     '<div class="firma-label">Jefe de Estación / Bombero Jefe</div>'
      +     '<div style="font-size:7.5pt;margin-top:2px;color:#555;">Nombre y matrícula</div>'
      +   '</div>'
      + '</div>';
  }

  /* ─── Inyectar hoja de estilos si no está cargada ya ─────────────── */
  function asegurarEstilos() {
    var cssPath = 'css/sei-pdf-style.css';
    /* Revisar si ya está incluida */
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].href.indexOf('sei-pdf-style') !== -1) return;
    }
    /* Si no está, inyectarla dinámicamente */
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
  }

  /* ─── Limpiar clases de la app oscura del clon ────────────────────── */
  function limpiarEstilosApp(clon) {
    /* Remover todas las clases de los elementos del clon 
       que puedan estar vinculadas al diseño oscuro */
    var eliminables = [
      'panel','panel-head','panel-body','panel-icon','panel-title',
      'module-header','module-strip','module-head-inner','module-eyebrow',
      'module-title','module-subtitle','module-meta','meta-chip',
      'formula-bar','formula-main','formula-defs','fdef',
      'result-hero','result-big','result-lbl','result-panel',
      'rate-pill','rate-pills','rate-selector',
      'table-panel','nested-row','nested-box',
      'nav-badge','nav-brand','nav-logo',
      'loader-wrap','admin-controls',
      'title-block','container',
      'main-grid','field-stack','field',
      'input-wrap','input-unit','field-error',
      'btn-calc','btn-return','btn-action','btn-save','btn-back',
      'btn-del','btn-nov','btn-toggle',
      'status-toggle-group','status-dot','dot-ok','dot-fuser',
      'nov-badge','nov-title','nov-header','nov-desc','nov-sev',
      'sev-critica','sev-leve','badge-sev','bg-critica','bg-leve'
    ];

    eliminables.forEach(function(cls) {
      var elements = clon.querySelectorAll('.' + cls);
      elements.forEach(function(el) {
        el.classList.remove(cls);
      });
    });

    /* Eliminar animaciones y efectos inline */
    var todos = clon.querySelectorAll('*');
    todos.forEach(function(el) {
      el.style.animation  = '';
      el.style.transition = '';
      el.style.textShadow = '';
      el.style.boxShadow  = '';
    });

    /* Ocultar botones y controles interactivos */
    var botones = clon.querySelectorAll(
      'button, input[type="button"], input[type="submit"], ' +
      'nav, .button, .btn, [id*="loader"], [class*="loader"]'
    );
    botones.forEach(function(el) {
      el.style.display = 'none';
    });

    /* Reemplazar inputs por texto */
    var inputs = clon.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea');
    inputs.forEach(function(el) {
      var span = document.createElement('span');
      span.textContent = el.value || el.textContent || '';
      span.style.fontFamily = 'Courier New, monospace';
      span.style.fontSize   = '9.5pt';
      span.style.color      = '#1a1a2e';
      if (el.parentNode) el.parentNode.replaceChild(span, el);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     FUNCIÓN PRINCIPAL PÚBLICA
     generarReporteSEI(nombreArchivo, idContenido, opciones)
  ════════════════════════════════════════════════════════════════ */
  /**
   * @param {string} nombreArchivo  Nombre del PDF a descargar (sin extensión .pdf)
   * @param {string} idContenido    ID del elemento HTML a capturar
   * @param {object} [opciones]     Opciones opcionales (ver arriba)
   */
  global.generarReporteSEI = function(nombreArchivo, idContenido, opciones) {

    /* Validaciones previas */
    if (typeof html2pdf === 'undefined') {
      console.error('[SEI-PDF] Error: html2pdf.js no está cargado. '
        + 'Incluye: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>');
      alert('Error: Librería de PDF no disponible. Contacte soporte técnico.');
      return;
    }

    var contenedor = document.getElementById(idContenido);
    if (!contenedor) {
      console.error('[SEI-PDF] Error: No se encontró el elemento con ID "' + idContenido + '".');
      alert('Error: No se encontró el contenido a exportar (ID: ' + idContenido + ').');
      return;
    }

    /* Opciones con valores por defecto */
    var opts = Object.assign({
      titulo:        'Reporte Operacional SEI',
      subtitulo:     '',
      estacion:      '—',
      mostrarFirmas: false,
      orientacion:   'portrait'
    }, opciones || {});

    /* Asegurar que el CSS esté disponible */
    asegurarEstilos();

    /* Clonar el contenido para no alterar la pantalla */
    var clon = contenedor.cloneNode(true);
    clon.removeAttribute('id');

    /* Limpiar estilos del modo oscuro de la app */
    limpiarEstilosApp(clon);

    /* Construir el documento PDF completo */
    var wrapper = document.createElement('div');
    wrapper.className = 'sei-pdf-root';

    wrapper.innerHTML = crearEncabezado(opts)
      + '<div class="sei-pdf-section">'
      + clon.innerHTML
      + '</div>'
      + (opts.mostrarFirmas ? crearFirmas() : '')
      + crearPiePagina(opts);

    /* Montar temporalmente en el DOM (oculto) para permitir render */
    wrapper.style.position   = 'absolute';
    wrapper.style.left       = '-9999px';
    wrapper.style.top        = '0';
    wrapper.style.zIndex     = '-1';
    document.body.appendChild(wrapper);

    /* Opciones para html2pdf.js */
    var pdfOpts = {
      margin:       [12, 12, 12, 12],   /* mm: arriba, der, abajo, izq */
      filename:     (nombreArchivo || 'reporte-sei') + '.pdf',
      image:        { type: 'jpeg', quality: 0.96 },
      html2canvas:  {
        scale:           2,
        useCORS:         true,
        allowTaint:      true,
        backgroundColor: '#ffffff',
        logging:         false
      },
      jsPDF:        {
        unit:        'mm',
        format:      'a4',
        orientation: opts.orientacion
      },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    /* Indicador visual de generación */
    var indicator = document.createElement('div');
    indicator.id = 'sei-pdf-generating';
    indicator.innerHTML = ''
      + '<div style="position:fixed;top:0;left:0;right:0;bottom:0;'
      + 'background:rgba(0,0,0,0.7);z-index:99999;display:flex;'
      + 'align-items:center;justify-content:center;">'
      + '<div style="background:#0d2137;border:1px solid #003087;border-radius:12px;'
      + 'padding:28px 40px;text-align:center;color:#fff;font-family:Arial,sans-serif;">'
      + '<div style="font-size:28px;margin-bottom:10px;">📄</div>'
      + '<div style="font-size:14px;font-weight:700;letter-spacing:0.05em;">GENERANDO PDF</div>'
      + '<div style="font-size:11px;color:#8ab4cc;margin-top:6px;">Sistema SEI — Formato Institucional A4</div>'
      + '</div></div>';
    document.body.appendChild(indicator);

    /* Generar y descargar el PDF */
    html2pdf()
      .set(pdfOpts)
      .from(wrapper)
      .save()
      .then(function() {
        /* Limpiar elementos temporales */
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        if (indicator.parentNode) document.body.removeChild(indicator);
        console.log('[SEI-PDF] PDF generado correctamente: ' + pdfOpts.filename);
      })
      .catch(function(err) {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        if (indicator.parentNode) document.body.removeChild(indicator);
        console.error('[SEI-PDF] Error al generar PDF:', err);
        alert('Error al generar el PDF. Verifique la consola del navegador.');
      });
  };

  /* ════════════════════════════════════════════════════════════════
     FUNCIÓN AUXILIAR: Crear botón de descarga PDF estándar
     Útil para añadir fácilmente un botón a cualquier módulo
  ════════════════════════════════════════════════════════════════ */
  /**
   * @param {string} idContenedor   ID donde insertar el botón
   * @param {string} nombreArchivo  Nombre del PDF
   * @param {string} idContenido    ID del contenido a exportar
   * @param {object} [opciones]     Opciones de generarReporteSEI
   */
  global.insertarBotonPDF = function(idContenedor, nombreArchivo, idContenido, opciones) {
    var cont = document.getElementById(idContenedor);
    if (!cont) {
      console.warn('[SEI-PDF] insertarBotonPDF: No se encontró el contenedor "' + idContenedor + '".');
      return;
    }

    var btn = document.createElement('button');
    btn.id = 'sei-btn-pdf-' + idContenido;
    btn.title = 'Descargar reporte PDF con formato institucional SEI';
    btn.innerHTML = ''
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">'
      +   '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
      +   '<polyline points="14,2 14,8 20,8"/>'
      +   '<line x1="16" y1="13" x2="8" y2="13"/>'
      +   '<line x1="16" y1="17" x2="8" y2="17"/>'
      +   '<polyline points="10,9 9,9 8,9"/>'
      + '</svg>'
      + ' Descargar PDF';

    /* Estilos inline que NO dependen del CSS de la app */
    btn.style.cssText = ''
      + 'display:inline-flex;align-items:center;gap:7px;'
      + 'padding:9px 18px;'
      + 'background:linear-gradient(135deg,#003087,#0057b8);'
      + 'color:#fff;border:none;border-radius:7px;'
      + 'font-family:Arial,sans-serif;font-size:12px;font-weight:700;'
      + 'letter-spacing:0.05em;text-transform:uppercase;'
      + 'cursor:pointer;transition:opacity 0.2s,transform 0.15s;'
      + 'margin:8px 0;';

    btn.onmouseover = function() { btn.style.opacity = '0.88'; btn.style.transform = 'translateY(-1px)'; };
    btn.onmouseout  = function() { btn.style.opacity = '1';    btn.style.transform = 'none'; };

    btn.onclick = function() {
      global.generarReporteSEI(nombreArchivo, idContenido, opciones);
    };

    cont.appendChild(btn);
  };

  console.log('[SEI-PDF] sei-pdf-generator.js cargado ✔ — generarReporteSEI() disponible globalmente.');

})(window);
