/**
 * SEI PDF Generator v3.2 - Ajuste A4, Captura Directa + Light Mode Force
 * Desarrollado para Sistema SEI - Bomberos Aeronáuticos
 */

(function(global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     ESTILOS COMPONENTES (Header/Footer/Firma)
  ═══════════════════════════════════════════════════════════════ */

  function htmlEncabezado(opts) {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
    const hora  = ahora.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', hour12:false });
    const oaci  = localStorage.getItem('aeropuerto_oaci') || 'SKXX';
    const idRep = `SEI-${oaci}-${ahora.getFullYear()}${(ahora.getMonth()+1).toString().padStart(2,'0')}${ahora.getDate().toString().padStart(2,'0')}-${hora.replace(':','')}`;

    return `
      <div class="sei-pdf-header">
        <div class="sei-pdf-header-top">
          <div class="sei-pdf-logo-box">
             <img src="https://arffcolombia.netlify.app/img/logo.png" crossOrigin="anonymous" alt="Logo">
          </div>
          <div class="sei-pdf-org-info">
            <h1 class="sei-pdf-org-name">BOMBEROS AERONÁUTICOS DE COLOMBIA</h1>
            <h2 class="sei-pdf-system-name">Sistema SEI - Reporte Operacional</h2>
          </div>
          <div class="sei-pdf-meta-box">
            <span class="sei-pdf-badge-oaci">${oaci}</span>
            <div class="sei-pdf-date-box">${fecha} · ${hora}</div>
            <div class="sei-pdf-id-box">${idRep}</div>
          </div>
        </div>
        <div class="sei-pdf-brand-line">
          <div class="sei-pdf-line-blue"></div>
          <div class="sei-pdf-line-orange"></div>
          <div class="sei-pdf-line-red"></div>
        </div>
        <div class="sei-pdf-header-titles">
          <h3 class="sei-pdf-main-title">${opts.titulo || 'REPORTE OPERACIONAL'}</h3>
          ${opts.subtitulo ? `<h4 class="sei-pdf-sub-title">${opts.subtitulo}</h4>` : ''}
        </div>
      </div>
    `;
  }

  function htmlPiePagina() {
    const oaci = localStorage.getItem('aeropuerto_oaci') || 'SKXX';
    return `
      <div class="sei-pdf-footer">
        <div class="sei-pdf-footer-grid">
          <div class="sei-pdf-footer-left">
            <span>Servicio de Salvamento y Extinción de Incendios (SEI)</span><br>
            <strong>Aeropuerto Internacional - Control Operativo</strong>
          </div>
          <div class="sei-pdf-footer-center">
             <div class="sei-pdf-logo-min">
               <span style="color:#003087;font-weight:900;">AERO</span><span style="color:#ce1126;font-weight:900;">CIVIL</span>
             </div>
          </div>
          <div class="sei-pdf-footer-right">
            <span>Terminal: <strong>${oaci}</strong></span><br>
            <span>Generado por: Personal Operativo SEI</span>
          </div>
        </div>
        <div class="sei-pdf-footer-disclaimer">
          Este documento es un reporte técnico oficial generado por el sistema SEI. Su contenido es estrictamente para uso operacional y administrativo.
        </div>
      </div>
    `;
  }

  function htmlFirmas() {
    return `
      <div class="sei-pdf-firmas-container">
        <div class="sei-pdf-firma-box">
          <div class="sei-pdf-firma-line"></div>
          <span class="sei-pdf-firma-label">Operador / Técnico SEI</span>
          <span class="sei-pdf-firma-sub">Responsable de Datos</span>
        </div>
        <div class="sei-pdf-firma-box">
          <div class="sei-pdf-firma-line"></div>
          <span class="sei-pdf-firma-label">Jefe de Turno / Supervisor</span>
          <span class="sei-pdf-firma-sub">Validación y Control de Calidad</span>
        </div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════════
     FUNCIÓN PRINCIPAL: AJUSTE A4 Y CAPTURA + RESET DARK MODE
  ═══════════════════════════════════════════════════════════════ */

  global.generarReporteSEI = async function(nombreArchivo, idContenedor, opciones = {}) {
    console.log('[SEI-PDF] Iniciando generación v3.2 (A4 Fit + Light Mode)...');

    const elemento = document.getElementById(idContenedor) || document.getElementById('pdf-content');
    if (!elemento) {
      console.error('[SEI-PDF] Contenedor no encontrado:', idContenedor);
      return;
    }

    /* ── 1. Guardar Estado Original ──────────────────────────── */
    const originalWidth = elemento.style.width;
    const originalPosition = elemento.style.position;
    const originalLeft = elemento.style.left;
    const originalMargin = elemento.style.margin;
    
    // Guardar clases de dark mode originales
    const darkModeClasses = [];
    const darkModeClassNames = ['dark-mode', 'dark', 'sei-dark', 'modo-oscuro'];
    
    // Detectar y guardar clases de dark mode en body, html y elemento
    [document.documentElement, document.body, elemento].forEach(el => {
      darkModeClassNames.forEach(className => {
        if (el.classList.contains(className)) {
          darkModeClasses.push({ element: el, className });
        }
      });
    });

    // Guardar estilos inline originales del body y html
    const bodyStyleBackup = document.body.getAttribute('style');
    const htmlStyleBackup = document.documentElement.getAttribute('style');

    /* ── 2. FORZAR MODO CLARO PARA LA CAPTURA ──────────────────── */
    // Remover clases de dark mode
    darkModeClasses.forEach(({ element, className }) => {
      element.classList.remove(className);
    });

    // Forzar colores de luz en body y html
    document.documentElement.style.backgroundColor = '#ffffff';
    document.documentElement.style.color = '#000000';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';

    // Fijar valores de inputs
    elemento.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) el.setAttribute('checked', 'checked');
        else el.removeAttribute('checked');
      } else {
        el.setAttribute('value', el.value);
      }
    });

    // Ajustar a ancho útil de A4 (642px para márgenes de 20mm)
    elemento.style.width = "642px";
    elemento.style.position = "relative";
    elemento.style.left = "0";
    elemento.style.margin = "0";
    elemento.classList.add('sei-pdf-root');

    /* ── 3. Inyectar CSS de Luz Forzado ────────────────────────── */
    const lightModeStyle = document.createElement('style');
    lightModeStyle.id = 'sei-pdf-light-force';
    lightModeStyle.textContent = `
      /* Fuerza modo claro para PDF */
      body, html, .sei-pdf-root, .sei-pdf-root * {
        background-color: #ffffff !important;
        color: #000000 !important;
        background-image: none !important;
      }
      
      /* Elementos específicos del PDF */
      .sei-pdf-header,
      .sei-pdf-footer,
      .sei-pdf-firmas-container {
        background-color: #ffffff !important;
        color: #000000 !important;
      }

      /* Tablas y bordes */
      table, tr, td, th {
        background-color: #ffffff !important;
        color: #000000 !important;
        border-color: #000000 !important;
      }

      /* Inputs y formularios */
      input, textarea, select {
        background-color: #ffffff !important;
        color: #000000 !important;
        border-color: #cccccc !important;
      }

      /* Resetear estilos oscuros comunes */
      .dark-mode,
      .dark,
      [class*="dark"],
      [style*="background: #0"],
      [style*="background: rgb(0"],
      [style*="background-color: #0"],
      [style*="background-color: rgb(0"] {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
    `;
    document.head.appendChild(lightModeStyle);

    /* ── 4. Inyectar Componentes Temporales ────────────────────── */
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = htmlEncabezado({ titulo: opciones.titulo, subtitulo: opciones.subtitulo });
    
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = htmlFirmas() + htmlPiePagina();

    elemento.insertBefore(headerDiv, elemento.firstChild);
    elemento.appendChild(footerDiv);

    /* ── 5. Configuración html2pdf ──────────────────────────────── */
    const opt = {
      margin: [10, 20, 10, 20],  // ✅ Márgenes iguales (más espacio a los lados)
      filename: (nombreArchivo || 'reporte-sei') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: 1200,
        backgroundColor: '#ffffff'  // ✅ Asegurar fondo blanco en la captura
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: opciones.orientacion || 'portrait'
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    /* ── 6. Overlay de carga ─────────────────────────────────── */
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(6,12,20,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Arial,sans-serif;flex-direction:column;gap:15px;';
    overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #0057b8;border-top-color:#fff;border-radius:50%;animation:sei-spin 0.8s linear infinite;"></div><div>GENERANDO REPORTE A4</div>';
    
    if (!document.getElementById('sei-pdf-spin')) {
      const st = document.createElement('style');
      st.id = 'sei-pdf-spin';
      st.textContent = '@keyframes sei-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
    document.body.appendChild(overlay);

    /* ── 7. Ejecutar y Restaurar ─────────────────────────────── */
    try {
      await new Promise(r => setTimeout(r, 300)); // Esperar render

      await html2pdf().set(opt).from(elemento).save();
      
      console.log('[SEI-PDF] ✔ Reporte generado y descargado.');
    } catch (err) {
      console.error('[SEI-PDF] Error:', err);
      alert('Error al generar el PDF.');
    } finally {
      // Restauración del DOM original
      elemento.style.width = originalWidth;
      elemento.style.position = originalPosition;
      elemento.style.left = originalLeft;
      elemento.style.margin = originalMargin;
      elemento.classList.remove('sei-pdf-root');
      elemento.removeChild(headerDiv);
      elemento.removeChild(footerDiv);
      document.body.removeChild(overlay);

      // Remover estilos de luz forzado
      const lightStyleElement = document.getElementById('sei-pdf-light-force');
      if (lightStyleElement) lightStyleElement.remove();

      // Restaurar estilos originales del body y html
      if (bodyStyleBackup) {
        document.body.setAttribute('style', bodyStyleBackup);
      } else {
        document.body.removeAttribute('style');
      }
      
      if (htmlStyleBackup) {
        document.documentElement.setAttribute('style', htmlStyleBackup);
      } else {
        document.documentElement.removeAttribute('style');
      }

      // Restaurar clases de dark mode
      darkModeClasses.forEach(({ element, className }) => {
        element.classList.add(className);
      });

      console.log('[SEI-PDF] ✔ Estilos originales restaurados.');
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     AUXILIAR: BOTÓN DE DESCARGA
  ═══════════════════════════════════════════════════════════════ */
  global.insertarBotonPDF = function(idContenedor, nombrePDF, idContenido, opciones) {
    const cont = document.getElementById(idContenedor);
    if (!cont) return;

    const btn = document.createElement('button');
    btn.innerHTML = 'Descargar Reporte PDF';
    btn.className = 'btn-sei-pdf-download';
    btn.onclick = () => global.generarReporteSEI(nombrePDF, idContenido, opciones);
    cont.appendChild(btn);
  };

  console.log('[SEI-PDF] Generador v3.2 (A4 Fit + Light Mode) cargado ✔');

})(window);