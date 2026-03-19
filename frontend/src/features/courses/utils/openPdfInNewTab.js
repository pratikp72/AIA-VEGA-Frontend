/**
 * Opens a read-only PDF viewer in a new browser tab with only title + zoom controls.
 * Download, print, and context-menu are disabled.
 *
 * @param {string} blobUrl  – Object URL of the fetched PDF blob
 * @param {string} title    – Display title shown in the toolbar & browser tab
 * @returns {boolean} true if the window was opened successfully
 */
export default function openPdfInNewTab(blobUrl, title = 'PDF') {
  if (!blobUrl) return false;

  const safe = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${safe}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; flex-direction: column; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
  .toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; min-height: 48px; flex-shrink: 0; }
  .title { font-size: 14px; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }
  .controls { display: flex; align-items: center; gap: 8px; }
  .zoom-btn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; color: #475569; transition: background 0.15s; }
  .zoom-btn:hover { background: #e2e8f0; }
  .zoom-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .zoom-label { font-size: 13px; color: #64748b; min-width: 44px; text-align: center; user-select: none; }
  iframe { flex: 1; border: none; width: 100%; }
</style>
</head>
<body>
<div class="toolbar">
  <span class="title">${safe}</span>
  <div class="controls">
    <button class="zoom-btn" id="zoomOut" onclick="changeZoom(-25)" title="Zoom Out">&#8722;</button>
    <span class="zoom-label" id="zoomLabel">100%</span>
    <button class="zoom-btn" id="zoomIn" onclick="changeZoom(25)" title="Zoom In">&#43;</button>
  </div>
</div>
<iframe id="pdfFrame" src="${blobUrl}#toolbar=0&navpanes=0&zoom=100"></iframe>
<script>
var zoom = 100;
function changeZoom(d) {
  zoom = Math.max(25, Math.min(500, zoom + d));
  document.getElementById('zoomLabel').textContent = zoom + '%';
  document.getElementById('zoomOut').disabled = zoom <= 25;
  document.getElementById('zoomIn').disabled = zoom >= 500;
  var f = document.getElementById('pdfFrame');
  var n = document.createElement('iframe');
  n.id = 'pdfFrame';
  n.style.cssText = 'flex:1;border:none;width:100%';
  n.src = '${blobUrl}#toolbar=0&navpanes=0&zoom=' + zoom;
  f.parentNode.replaceChild(n, f);
}
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
<\/script>
</body>
</html>`;

  const newWindow = window.open('', '_blank');
  if (!newWindow) return false;
  newWindow.document.write(html);
  newWindow.document.close();
  return true;
}
