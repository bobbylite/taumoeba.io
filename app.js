/* ══════════════════════════════════════════════════════════════
   DevKit · app.js
   Theme · Tabs · JWT Decoder · JSON Editor · Base64
   ══════════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════

(function initTheme() {
  const saved = localStorage.getItem('dk-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
})();

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('dk-theme', next);
});

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', String(b === btn));
    });
    document.querySelectorAll('.tool-panel').forEach(p => {
      p.classList.toggle('active', p.id === `panel-${tab}`);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.remove('copy-flash');
    void btn.offsetWidth; // reflow to restart animation
    btn.classList.add('copy-flash');
    setTimeout(() => btn.classList.remove('copy-flash'), 1500);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  });
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ═══════════════════════════════════════════════════════════════
// JWT DECODER
// ═══════════════════════════════════════════════════════════════

const PINGONE_CLAIMS = {
  // Standard
  sub:       { label: 'Subject',             p1: false },
  iss:       { label: 'Issuer',              p1: false },
  aud:       { label: 'Audience',            p1: false },
  exp:       { label: 'Expiration Time',     p1: false, isTime: true },
  iat:       { label: 'Issued At',           p1: false, isTime: true },
  nbf:       { label: 'Not Before',          p1: false, isTime: true },
  jti:       { label: 'JWT ID',              p1: false },
  at_hash:   { label: 'Access Token Hash',   p1: false },
  scope:     { label: 'Scopes',              p1: false },
  client_id: { label: 'Client ID',           p1: false },
  // PingOne
  env:           { label: 'Environment ID',    p1: true },
  org:           { label: 'Organization ID',   p1: true },
  'p1.app':      { label: 'Application',       p1: true },
  'p1.region':   { label: 'Region',            p1: true },
  'p1.perm':     { label: 'Permissions',       p1: true },
  'p1.kid':      { label: 'Key ID',            p1: true },
  'p1.iss':      { label: 'P1 Issuer',         p1: true },
  acr:           { label: 'Auth Context Class', p1: true },
  amr:           { label: 'Auth Methods',       p1: true },
  auth_time:     { label: 'Auth Time',          p1: true, isTime: true },
  sid:           { label: 'Session ID',         p1: true },
};

const EXAMPLE_JWT =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InAxLWtleS0wMDEifQ.' +
  'eyJzdWIiOiIwMGFiY2RlZi0xMjM0LTU2NzgtOTBhYi1jZGVmMDEyMzQ1NjciLCJpc3MiOiJodHRwczovL2F1dGgucGluZ29uZS5jb20vZW52LWlkL2FzIiwiYXVkIjoiYXBwLWNsaWVudC1pZCIsImV4cCI6MjUxNjIzOTAyMiwiaWF0IjoxNzE2MjM5MDIyLCJqdGkiOiJ1bmlxdWUtand0LWlkIiwiZW52IjoiZW52LWlkIiwib3JnIjoib3JnLWlkIiwicDEuYXBwIjoiYXBwLWNsaWVudC1pZCIsInAxLnJlZ2lvbiI6Ik5BIiwiYWNyIjoiTUZBIiwiYW1yIjpbInB3ZCIsIm90cCJdLCJhdXRoX3RpbWUiOjE3MTYyMzkwMDAsInNpZCI6InNlc3Npb24taWQtMTIzIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImNsaWVudF9pZCI6ImFwcC1jbGllbnQtaWQifQ.' +
  'SIGNATURE_NOT_VERIFIED';

function b64urlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try {
    return decodeURIComponent(
      atob(s).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    return atob(s);
  }
}

function formatTimestamp(unix) {
  const d = new Date(unix * 1000);
  const now = Date.now();
  const diff = Math.round((unix * 1000 - now) / 1000);
  const abs = Math.abs(diff);

  let rel;
  if (abs < 60)        rel = `${abs}s ${diff > 0 ? 'from now' : 'ago'}`;
  else if (abs < 3600) rel = `${Math.round(abs/60)}m ${diff > 0 ? 'from now' : 'ago'}`;
  else if (abs < 86400) rel = `${Math.round(abs/3600)}h ${diff > 0 ? 'from now' : 'ago'}`;
  else                  rel = `${Math.round(abs/86400)}d ${diff > 0 ? 'from now' : 'ago'}`;

  return `${d.toISOString().replace('T', ' ').replace('.000Z', ' UTC')}  (${rel})`;
}

function renderClaimTable(obj) {
  const rows = Object.entries(obj).map(([k, v]) => {
    const meta   = PINGONE_CLAIMS[k];
    const isTime = meta?.isTime && typeof v === 'number';

    // Build value HTML
    let valueHtml;
    if (v === null) {
      valueHtml = `<span class="cv cv-null">null</span>`;
    } else if (typeof v === 'boolean') {
      valueHtml = `<span class="cv cv-boolean">${v}</span>`;
    } else if (typeof v === 'number') {
      valueHtml = `<span class="cv cv-number">${v}</span>`;
    } else if (typeof v === 'string') {
      // Space-delimited strings (scope) or short values → render as tags
      const parts = v.split(' ');
      if (parts.length > 1 && parts.every(p => p.length < 40)) {
        valueHtml = parts.map(p => `<span class="cv-tag">${escHtml(p)}</span>`).join('');
      } else {
        valueHtml = `<span class="cv cv-string">${escHtml(v)}</span>`;
      }
    } else if (Array.isArray(v)) {
      if (!v.length) {
        valueHtml = `<span class="cv cv-null">[ ]</span>`;
      } else {
        valueHtml = v.map(item =>
          `<span class="cv-tag">${escHtml(typeof item === 'object' ? JSON.stringify(item) : String(item))}</span>`
        ).join('');
      }
    } else {
      // Nested object — compact JSON
      valueHtml = `<span class="cv cv-string">${escHtml(JSON.stringify(v))}</span>`;
    }

    const hintHtml = meta
      ? `<span class="claim-hint">${escHtml(meta.label)}${meta.p1 ? ' · P1' : ''}</span>`
      : '';

    const timeHtml = isTime
      ? `<div class="time-note">${escHtml(formatTimestamp(v))}</div>`
      : '';

    return `<div class="claim-row">
      <span class="ck">${escHtml(k)}</span>
      <div class="cv-group">
        <div class="cv-main">${valueHtml}${hintHtml}</div>
        ${timeHtml}
      </div>
    </div>`;
  });

  return `<div class="claim-table">${rows.join('')}</div>`;
}

function decodeJWT(raw) {
  const parts = raw.trim().split('.');
  if (parts.length !== 3) throw new Error(`Expected 3 parts separated by "." — got ${parts.length}.`);

  let header, payload;
  try { header  = JSON.parse(b64urlDecode(parts[0])); } catch { throw new Error('Header is not valid base64url-encoded JSON.'); }
  try { payload = JSON.parse(b64urlDecode(parts[1])); } catch { throw new Error('Payload is not valid base64url-encoded JSON.'); }

  return { header, payload, sig: parts[2], parts };
}

function getExpiryBadge(payload) {
  const now = Math.floor(Date.now() / 1000);
  if (payload.nbf && now < payload.nbf) return { cls: 'badge-warn',    text: 'Not Yet Valid' };
  if (payload.exp) {
    if (now > payload.exp) return { cls: 'badge-expired', text: 'Expired' };
    const mins = Math.round((payload.exp - now) / 60);
    if (mins < 5) return { cls: 'badge-warn', text: `Expires in ${mins}m` };
    return { cls: 'badge-valid', text: 'Valid' };
  }
  return null;
}

const jwtInput       = document.getElementById('jwtInput');
const jwtInputZone   = document.getElementById('jwtInputZone');
const jwtColorized   = document.getElementById('jwtColorized');
const jwtErrorInline = document.getElementById('jwtErrorInline');
const jwtStatusBar   = document.getElementById('jwtStatusBar');
const jwtDecoded     = document.getElementById('jwtDecoded');
const jwtHeaderBody  = document.getElementById('jwtHeaderBody');
const jwtPayloadBody = document.getElementById('jwtPayloadBody');

function showEditMode(errorMsg) {
  jwtColorized.style.display = 'none';
  jwtInput.style.display = 'block';
  if (errorMsg) {
    jwtErrorInline.textContent = `⚠ ${errorMsg}`;
    jwtErrorInline.style.display = 'block';
    jwtInputZone.classList.add('is-error');
  } else {
    jwtErrorInline.style.display = 'none';
    jwtInputZone.classList.remove('is-error');
  }
}

function renderJWT() {
  const raw = jwtInput.value.trim();

  jwtStatusBar.style.display = 'none';
  jwtDecoded.style.display = 'none';

  if (!raw) {
    showEditMode(null);
    return;
  }

  let decoded;
  try {
    decoded = decodeJWT(raw);
  } catch (e) {
    showEditMode(e.message);
    return;
  }

  // Switch textarea → colorized display
  jwtInput.style.display = 'none';
  jwtErrorInline.style.display = 'none';
  jwtInputZone.classList.remove('is-error');
  jwtColorized.innerHTML =
    `<span class="jwt-seg-header">${escHtml(decoded.parts[0])}</span>` +
    `<span class="jwt-dot">.</span>` +
    `<span class="jwt-seg-payload">${escHtml(decoded.parts[1])}</span>` +
    `<span class="jwt-dot">.</span>` +
    `<span class="jwt-seg-sig">${escHtml(decoded.sig)}</span>`;
  jwtColorized.style.display = 'block';

  // Status badges
  const badges = [];
  badges.push({ cls: 'badge-info',    text: `alg: ${decoded.header.alg || '?'}` });
  badges.push({ cls: 'badge-neutral', text: `typ: ${decoded.header.typ || 'JWT'}` });

  const expiry = getExpiryBadge(decoded.payload);
  if (expiry) badges.push(expiry);

  const isPingOne = !!(decoded.payload.env || decoded.payload.org || decoded.payload['p1.app']);
  if (isPingOne) badges.push({ cls: 'badge-info', text: 'PingOne Token' });

  jwtStatusBar.innerHTML = badges
    .map(b => `<span class="badge ${b.cls}">${escHtml(b.text)}</span>`)
    .join('');
  jwtStatusBar.style.display = 'flex';

  // Decoded panels
  jwtHeaderBody.innerHTML  = renderClaimTable(decoded.header);
  jwtPayloadBody.innerHTML = renderClaimTable(decoded.payload);
  jwtDecoded.style.display = 'grid';

  jwtHeaderBody.dataset.raw  = JSON.stringify(decoded.header, null, 2);
  jwtPayloadBody.dataset.raw = JSON.stringify(decoded.payload, null, 2);
}

// Click colorized display → back to editing
jwtColorized.addEventListener('click', () => {
  showEditMode(null);
  jwtInput.focus();
});

jwtInput.addEventListener('input', renderJWT);

document.getElementById('jwtExample').addEventListener('click', () => {
  jwtInput.value = EXAMPLE_JWT;
  renderJWT();
});

document.getElementById('jwtClear').addEventListener('click', () => {
  jwtInput.value = '';
  renderJWT();
});

document.querySelectorAll('.copy-json-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const el = document.getElementById(btn.dataset.target);
    copyText(el.dataset.raw || el.textContent, btn);
  });
});

// ═══════════════════════════════════════════════════════════════
// JSON EDITOR
// ═══════════════════════════════════════════════════════════════

const jsonTextInput    = document.getElementById('jsonTextInput');
const jsonTreeContainer = document.getElementById('jsonTreeContainer');
const jsonStatus       = document.getElementById('jsonStatus');

let jsonParsed = null; // last successfully parsed value

function setJsonStatus(state, msg) {
  jsonStatus.className = `status-chip ${state}`;
  jsonStatus.textContent = msg;
}

// ── Tree renderer ──────────────────────────────────────────────

function escStr(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function makeTreeNode(value, key) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tree-node';

  if (value !== null && typeof value === 'object') {
    const isArr    = Array.isArray(value);
    const entries  = isArr ? value : Object.entries(value);
    const count    = isArr ? value.length : entries.length;
    const openB    = isArr ? '[' : '{';
    const closeB   = isArr ? ']' : '}';

    const row = document.createElement('div');
    row.className = 'tree-row';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    toggle.textContent = '▾';
    row.appendChild(toggle);

    if (key !== null) {
      const keyEl = document.createElement('span');
      keyEl.className = 'tree-key';
      keyEl.textContent = typeof key === 'number' ? key : `"${escStr(String(key))}"`;
      row.appendChild(keyEl);

      const col = document.createElement('span');
      col.className = 'tree-colon';
      col.textContent = ': ';
      row.appendChild(col);
    }

    const openEl = document.createElement('span');
    openEl.className = 'tree-bracket';
    openEl.textContent = openB;
    row.appendChild(openEl);

    const summary = document.createElement('span');
    summary.className = 'tree-summary hidden';
    summary.textContent = ` ${count} ${count === 1 ? (isArr ? 'item' : 'prop') : (isArr ? 'items' : 'props')} `;
    row.appendChild(summary);

    const closeInline = document.createElement('span');
    closeInline.className = 'tree-bracket hidden';
    closeInline.textContent = closeB;
    row.appendChild(closeInline);

    wrapper.appendChild(row);

    const children = document.createElement('div');
    children.className = 'tree-children';

    (isArr ? value : Object.entries(value)).forEach((item, i) => {
      const [k, v] = isArr ? [i, item] : item;
      children.appendChild(makeTreeNode(v, k));
    });

    const closeRow = document.createElement('div');
    closeRow.className = 'tree-close-row';
    closeRow.textContent = closeB;
    children.appendChild(closeRow);

    wrapper.appendChild(children);

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = !children.classList.contains('hidden');
      if (expanded) {
        children.classList.add('hidden');
        summary.classList.remove('hidden');
        closeInline.classList.remove('hidden');
        toggle.textContent = '▸';
      } else {
        children.classList.remove('hidden');
        summary.classList.add('hidden');
        closeInline.classList.add('hidden');
        toggle.textContent = '▾';
      }
    });

  } else {
    const row = document.createElement('div');
    row.className = 'tree-row';

    const spacer = document.createElement('span');
    spacer.className = 'tree-spacer';
    row.appendChild(spacer);

    if (key !== null) {
      const keyEl = document.createElement('span');
      keyEl.className = 'tree-key';
      keyEl.textContent = typeof key === 'number' ? key : `"${escStr(String(key))}"`;
      row.appendChild(keyEl);

      const col = document.createElement('span');
      col.className = 'tree-colon';
      col.textContent = ': ';
      row.appendChild(col);
    }

    const type = value === null ? 'null' : typeof value;
    const valEl = document.createElement('span');
    valEl.className = `tv-${type}`;

    if (type === 'string')  valEl.textContent = `"${escStr(value)}"`;
    else if (type === 'null') valEl.textContent = 'null';
    else                     valEl.textContent = String(value);

    row.appendChild(valEl);
    wrapper.appendChild(row);
  }

  return wrapper;
}

function renderTree(data) {
  jsonTreeContainer.innerHTML = '';
  if (data === null || data === undefined) {
    jsonTreeContainer.innerHTML = '<p class="tree-placeholder">Tree is empty</p>';
    return;
  }
  jsonTreeContainer.appendChild(makeTreeNode(data, null));
}

function parseAndRender() {
  const text = jsonTextInput.value.trim();
  if (!text) {
    jsonParsed = null;
    setJsonStatus('empty', '');
    jsonTreeContainer.innerHTML = '<p class="tree-placeholder">Paste JSON on the left and click <strong>→</strong> or start typing</p>';
    return;
  }
  try {
    jsonParsed = JSON.parse(text);
    const count = countNodes(jsonParsed);
    setJsonStatus('valid', `✓ Valid  ·  ${count} node${count !== 1 ? 's' : ''}`);
    renderTree(jsonParsed);
  } catch (e) {
    jsonParsed = null;
    setJsonStatus('invalid', `✗ ${e.message.split('\n')[0]}`);
    jsonTreeContainer.innerHTML = `<p class="tree-placeholder" style="color:var(--c-red)">${escHtml(e.message)}</p>`;
  }
}

function countNodes(v) {
  if (v === null || typeof v !== 'object') return 1;
  const children = Array.isArray(v) ? v : Object.values(v);
  return children.reduce((s, c) => s + countNodes(c), 1);
}

// Auto-parse on typing (debounced)
jsonTextInput.addEventListener('input', debounce(parseAndRender, 300));

// Explicit sync buttons
document.getElementById('syncToTree').addEventListener('click', parseAndRender);

document.getElementById('syncToText').addEventListener('click', () => {
  if (jsonParsed !== undefined && jsonParsed !== null) {
    jsonTextInput.value = JSON.stringify(jsonParsed, null, 2);
    parseAndRender();
  }
});

// Format
document.getElementById('jsonFormat').addEventListener('click', () => {
  const text = jsonTextInput.value.trim();
  if (!text) return;
  try {
    jsonTextInput.value = JSON.stringify(JSON.parse(text), null, 2);
    parseAndRender();
  } catch (e) {
    setJsonStatus('invalid', `✗ ${e.message.split('\n')[0]}`);
  }
});

// Minify
document.getElementById('jsonMinify').addEventListener('click', () => {
  const text = jsonTextInput.value.trim();
  if (!text) return;
  try {
    jsonTextInput.value = JSON.stringify(JSON.parse(text));
    parseAndRender();
  } catch (e) {
    setJsonStatus('invalid', `✗ ${e.message.split('\n')[0]}`);
  }
});

// Sort keys
document.getElementById('jsonSort').addEventListener('click', () => {
  const text = jsonTextInput.value.trim();
  if (!text) return;
  try {
    const parsed = JSON.parse(text);
    jsonTextInput.value = JSON.stringify(sortKeys(parsed), null, 2);
    parseAndRender();
  } catch (e) {
    setJsonStatus('invalid', `✗ ${e.message.split('\n')[0]}`);
  }
});

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(Object.keys(obj).sort().map(k => [k, sortKeys(obj[k])]));
  }
  return obj;
}

// Clear
document.getElementById('jsonClear').addEventListener('click', () => {
  jsonTextInput.value = '';
  parseAndRender();
});

// Copy JSON text
document.getElementById('jsonCopyText').addEventListener('click', function () {
  const text = jsonTextInput.value;
  if (text) copyText(text, this);
});

// Expand / Collapse all
document.getElementById('jsonExpandAll').addEventListener('click', () => {
  jsonTreeContainer.querySelectorAll('.tree-children').forEach(el => {
    el.classList.remove('hidden');
  });
  jsonTreeContainer.querySelectorAll('.tree-toggle').forEach(el => {
    el.textContent = '▾';
  });
  jsonTreeContainer.querySelectorAll('.tree-summary').forEach(el => {
    el.classList.add('hidden');
  });
  jsonTreeContainer.querySelectorAll('.tree-bracket.hidden').forEach(el => {
    el.classList.add('hidden');
  });
});

document.getElementById('jsonCollapseAll').addEventListener('click', () => {
  // Only collapse top-level children (depth 1)
  const topNode = jsonTreeContainer.querySelector('.tree-node');
  if (!topNode) return;
  const topChildren = topNode.querySelector('.tree-children');
  if (!topChildren) return;

  topChildren.querySelectorAll(':scope > .tree-node').forEach(node => {
    const ch = node.querySelector('.tree-children');
    const tg = node.querySelector('.tree-toggle');
    const sm = node.querySelector('.tree-summary');
    const ci = node.querySelectorAll('.tree-bracket');
    if (ch) ch.classList.add('hidden');
    if (tg) tg.textContent = '▸';
    if (sm) sm.classList.remove('hidden');
    // show inline close bracket
    if (ci.length > 1) ci[ci.length - 1].classList.remove('hidden');
  });
});

// ═══════════════════════════════════════════════════════════════
// BASE64
// ═══════════════════════════════════════════════════════════════

const b64Input      = document.getElementById('b64Input');
const b64Output     = document.getElementById('b64Output');
const b64Error      = document.getElementById('b64Error');
const b64CharCount  = document.getElementById('b64CharCount');

let b64Variant  = 'standard';
let b64Encoding = 'utf8';

// Variant pills
document.getElementById('variantGroup').querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.getElementById('variantGroup').querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    b64Variant = pill.dataset.variant;
  });
});

// Encoding pills
document.getElementById('encodingGroup').querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.getElementById('encodingGroup').querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    b64Encoding = pill.dataset.encoding;
  });
});

function toB64(text) {
  let b64 = btoa(unescape(encodeURIComponent(text)));
  if (b64Variant === 'urlsafe') {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  return b64;
}

function fromB64(text) {
  let s = text.trim();
  if (b64Variant === 'urlsafe') {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
  }
  const bin = atob(s);
  return decodeURIComponent(bin.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

function setB64Error(msg) {
  if (msg) {
    b64Error.textContent = msg;
    b64Error.style.display = 'block';
  } else {
    b64Error.style.display = 'none';
  }
}

function updateCharCount(text) {
  if (text) {
    b64CharCount.textContent = `${text.length} chars`;
  } else {
    b64CharCount.textContent = '';
  }
}

document.getElementById('b64Encode').addEventListener('click', () => {
  setB64Error(null);
  const input = b64Input.value;
  if (!input) { b64Output.value = ''; updateCharCount(''); return; }
  try {
    const result = toB64(input);
    b64Output.value = result;
    updateCharCount(result);
  } catch (e) {
    setB64Error(`Encode error: ${e.message}`);
    b64Output.value = '';
    updateCharCount('');
  }
});

document.getElementById('b64Decode').addEventListener('click', () => {
  setB64Error(null);
  const input = b64Input.value.trim();
  if (!input) { b64Output.value = ''; updateCharCount(''); return; }
  try {
    const result = fromB64(input);
    b64Output.value = result;
    updateCharCount(result);
  } catch (e) {
    setB64Error(`Decode error: Invalid base64 — ${e.message}`);
    b64Output.value = '';
    updateCharCount('');
  }
});

document.getElementById('b64Swap').addEventListener('click', () => {
  const tmp = b64Input.value;
  b64Input.value = b64Output.value;
  b64Output.value = tmp;
  setB64Error(null);
  updateCharCount(b64Output.value);
});

document.getElementById('b64ClearInput').addEventListener('click', () => {
  b64Input.value = '';
  b64Output.value = '';
  setB64Error(null);
  updateCharCount('');
});

document.getElementById('b64CopyOutput').addEventListener('click', function () {
  const text = b64Output.value;
  if (text) copyText(text, this);
});
