// LabCore – Shared Navigation - Version 3.2 (roles + critical badge + Nursing Station)
(function () {
  'use strict';

  const current = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();

  const allLinks = [
    ['⌂', 'Dashboard', 'dashboard.html', 'main', null],
    ['♙', 'Patients', 'patient-registration.html', 'main', null],
    ['👨‍⚕️', 'Consultation', 'consultation.html', 'main', ['doctor', 'nurse', 'admin']],
    ['🩺', 'Nursing Station', 'nursing-station.html', 'main', ['nurse', 'admin', 'scientist']],
    ['💰', 'Billing', 'billing.html', 'main', ['billing', 'receptionist', 'admin']],
        ['🧾', 'Receipts', 'receipts.html', 'main', ['billing', 'receptionist', 'admin']],
    ['▣', 'Requests', 'requests.html', 'lab', ['scientist', 'receptionist', 'admin']],
    ['▤', 'Sample Registration', 'lab-reception.html', 'lab', ['scientist', 'receptionist', 'nurse', 'admin']],
    ['✓', 'Results', 'result-entry.html', 'lab', ['scientist', 'doctor', 'admin']],
    ['◫', 'Reports', 'reports.html', 'lab', null],
    ['🖼', 'Imaging', 'imaging-worklist.html', 'lab', ['sonographer', 'radiographer', 'doctor', 'admin']],
    ['⚙', 'Test Panels', 'test-configuration.html', 'config', ['scientist', 'admin']],
    ['💰', 'Price Management', 'price-management.html', 'config', ['admin', 'scientist', 'billing']]
  ];

  const labels = { main: 'Main', lab: 'Laboratory', config: 'Configuration' };

  function getUser() {
    if (typeof window.lcGetUser === 'function') return window.lcGetUser();
    try {
      const raw = localStorage.getItem('labcore_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function doLogout() {
  if (!confirm('Log out of LabCore?')) return;

  // Try the shared logout first
  if (typeof window.lcLogout === 'function') {
    try {
      window.lcLogout('Manual logout');
      return;
    } catch (e) {
      console.warn('lcLogout failed, falling back:', e);
    }
  }

  // Fallback: clear storage manually and redirect
  try {
    localStorage.removeItem('labcore_current_user');
    localStorage.removeItem('labcore_current_session');
  } catch (e) {}
  window.location.href = 'login.html';
}
  function buildSidebar() {
    const aside = document.querySelector('aside.sidebar');
    if (!aside) return;
    if (current === 'login.html') return;

    const user = getUser();
    aside.innerHTML = '';
    aside.className = 'sidebar';

    const wrap = document.createElement('div');
    wrap.className = 'lc-shared-nav';

    const brand = document.createElement('div');
    brand.className = 'lc-brand';
    brand.innerHTML = '<div class="lc-brand-mark">LC</div><div class="lc-brand-text"><div class="name">LabCore</div><div class="sub">Laboratory System</div></div>';
    wrap.appendChild(brand);

    const nav = document.createElement('nav');
    nav.className = 'lc-nav';

    let lastSection = '';
    allLinks.forEach(function (item) {
      var icon = item[0], label = item[1], href = item[2], section = item[3], roles = item[4];
      if (roles && user) {
        var roleId = user.id || user.role;
        if (roles.indexOf(roleId) === -1) return;
      }
      if (section !== lastSection) {
        var s = document.createElement('div');
        s.className = 'lc-section';
        s.textContent = labels[section];
        nav.appendChild(s);
        lastSection = section;
      }
      var a = document.createElement('a');
      a.className = 'lc-link' + (current === href.toLowerCase() ? ' active' : '');
      a.href = href;
      a.innerHTML = '<span class="lc-icon">' + icon + '</span><span>' + label + '</span>';
      nav.appendChild(a);
    });
    wrap.appendChild(nav);

    const userBox = document.createElement('div');
    userBox.className = 'lc-user';
    var short = (user && (user.short || (user.name || 'U').slice(0, 2).toUpperCase())) || '—';
    var name = (user && user.name) || 'Not signed in';
    var roleLabel = (user && user.label) || '';
    userBox.innerHTML = '<div class="lc-avatar">' + short + '</div><div style="flex:1;min-width:0"><strong style="display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + '</strong><span style="display:block;font-size:10px;color:#aebdca">' + roleLabel + '</span></div>';
    wrap.appendChild(userBox);

    const tools = document.createElement('div');
    tools.style.cssText = 'padding:8px 14px 12px;display:flex;gap:8px;align-items:center;border-top:1px solid rgba(255,255,255,0.12)';
   tools.innerHTML =
  '<button type="button" id="lcNavCritBtn" title="Critical alerts" style="position:relative;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:14px">🔔' +
    '<span id="lcNavCritBadge" style="display:none;position:absolute;top:-4px;right:-4px;background:#b74b43;color:#fff;font-size:9px;font-weight:700;min-width:16px;height:16px;border-radius:8px;align-items:center;justify-content:center"></span>' +
  '</button>' +
  '<button type="button" id="lcNavLogoutBtn" title="Logout" style="margin-left:auto;background:rgba(183,75,67,0.15);border:1px solid rgba(183,75,67,0.4);color:#fff;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px;font-weight:600">🚪 Logout</button>';
    wrap.appendChild(tools);
    aside.appendChild(wrap);

   refreshNavCriticals();

var btn = document.getElementById('lcNavCritBtn');
if (btn) btn.addEventListener('click', function () { window.location.href = 'dashboard.html'; });

var logoutBtn = document.getElementById('lcNavLogoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    doLogout();
  });
}
  }

  function refreshNavCriticals() {
    if (typeof window.lcGetCriticalAlerts !== 'function') return;
    var alerts = window.lcGetCriticalAlerts();
    var badge = document.getElementById('lcNavCritBadge');
    if (!badge) return;
    if (alerts.length) {
      badge.style.display = 'flex';
      badge.textContent = alerts.length > 99 ? '99+' : String(alerts.length);
    } else {
      badge.style.display = 'none';
    }
  }

  function setupMobileToggle() {
    var toggle = document.querySelector('.lc-mobile-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'lc-mobile-toggle';
      toggle.innerHTML = '☰';
      toggle.setAttribute('aria-label', 'Toggle navigation');
      document.body.prepend(toggle);
    }
    if (toggle.dataset.bound) return;
    toggle.dataset.bound = '1';

    var overlay = document.querySelector('.lc-sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'lc-sidebar-overlay';
      document.body.prepend(overlay);
    }

    function toggleSidebar() {
      var sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      sidebar.classList.toggle('open');
      toggle.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
    toggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
      }
    });
  }

  function loadDeps() {
    if (typeof window.lcGetUser === 'undefined') {
      var s = document.createElement('script');
      s.src = 'shared/labcore-auth.js';
      s.onload = function () {
        if (current !== 'login.html' && typeof window.lcRequireAuth === 'function') window.lcRequireAuth();
      };
      document.head.appendChild(s);
    } else if (current !== 'login.html' && window.lcRequireAuth) {
      window.lcRequireAuth();
    }
  }

  let _lcNavBuilt = false;

  function init() {
    if (_lcNavBuilt) return;
    _lcNavBuilt = true;
    try {
      loadDeps();
      buildSidebar();
      setupMobileToggle();
      setInterval(refreshNavCriticals, 30000);
    } catch (err) {
      console.error('LabCore nav failed to initialise:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 30);
  }
})();