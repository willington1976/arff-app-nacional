/**
 * SEI PDF Generator v3.0 - Captura Directa de DOM
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

  function htmlPiePagina(opts) {
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
     FUNCIÓN PRINCIPAL: CAPTURA DIRECTA
  ═══════════════════════════════════════════════════════════════ */

  global.generarReporteSEI = async function(nombreArchivo, idContenedor, opciones) {
    console.log('[SEI-PDF] Iniciando generación directa v3.0...');

    /* ── 0. Validar html2pdf ────────────────────────────────── */
    if (typeof html2pdf === 'undefined') {
      alert('Error: La librería html2pdf.js no está cargada.');
      return;
    }

    /* ── 1. Obtener elemento real ────────────────────────────── */
    const elemento = document.getElementById(idContenedor) || document.getElementById('pdf-content');
    if (!elemento) {
      console.error('[SEI-PDF] Error: No se encontró el contenedor:', idContenedor);
      alert('No se encontró el contenedor de resultados.');
      return;
    }

    /* ── 2. Fijar valores de inputs en el DOM real ──────────── */
    // Esto es CRÍTICO para que html2canvas capture lo que el usuario escribió
    elemento.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) el.setAttribute('checked', 'checked');
        else el.removeAttribute('checked');
      } else {
        el.setAttribute('value', el.value);
      }
    });

    /* ── 3. Overlay de carga ─────────────────────────────────── */
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(6,12,20,0.9);z-index:999999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Arial,sans-serif;flex-direction:column;gap:15px;';
    overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #0057b8;border-top-color:#fff;border-radius:50%;animation:sei-spin 0.8s linear infinite;"></div><div>PROCESANDO REPORTE DIRECTO</div>';
    
    if (!document.getElementById('sei-pdf-spin')) {
      const st = document.createElement('style');
      st.id = 'sei-pdf-spin';
      st.textContent = '@keyframes sei-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
    document.body.appendChild(overlay);

    /* ── 4. Configuración y Captura ──────────────────────────── */
    const opt = {
      margin: [10, 10, 10, 10],
      filename: (nombreArchivo || 'reporte-sei') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: 1200
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: (opciones && opciones.orientacion) || 'portrait'
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      // Pequeña espera para que los cambios de atributo se asienten
      await new Promise(r => setTimeout(r, 200));

      await html2pdf().set(opt).from(elemento).save();
      console.log('[SEI-PDF] ✔ PDF generado exitosamente.');
    } catch (err) {
      console.error('[SEI-PDF] Error en generación directa:', err);
      alert('Error al generar el PDF. Revise la consola.');
    } finally {
      document.body.removeChild(overlay);
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
    btn.className = 'btn-sei-pdf-download'; // Estilo definido en sei-pdf-style.css
    btn.onclick = () => global.generarReporteSEI(nombrePDF, idContenido, opciones);
    cont.appendChild(btn);
  };

  console.log('[SEI-PDF] Generador v3.0 (Direct DOM) cargado exitosamente ✔');

})(window);
