/**
 * AFINTRIX ERP — Application Controller & Interaction Engine (V2)
 * High-performance vanilla TypeScript/JS powering the Studio Deck shell,
 * real-time table sorting, live filters, command palette (Ctrl+K),
 * modal drawers, interactive line-item calculations, and micro-motion.
 */

(function () {
  'use strict';

  // ==========================================================================
  // TOP NAVIGATION PROGRESS BAR — fires on every load, and on click of any
  // internal link, so page-to-page navigation reads as an in-app transition
  // rather than a hard reload.
  // ==========================================================================
  function getProgressBar() {
    let bar = document.getElementById('afxProgressBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'afxProgressBar';
      document.body.appendChild(bar);
    }
    return bar;
  }

  function runEntranceProgress() {
    const bar = getProgressBar();
    requestAnimationFrame(() => {
      bar.classList.add('active');
      bar.style.width = '70%';
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.width = '100%';
          setTimeout(() => {
            bar.classList.remove('active');
            setTimeout(() => { bar.style.width = '0%'; }, 220);
          }, 180);
        }, 120);
      });
    });
  }

  function startNavProgress() {
    const bar = getProgressBar();
    bar.style.transition = 'width 0.4s ease, opacity 0.2s ease';
    bar.classList.add('active');
    bar.style.width = '82%';
  }

  // Restoring from the bfcache (back/forward) does not re-run the script, so
  // a bar left mid-flight by the outgoing navigation would stay on screen.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    const bar = document.getElementById('afxProgressBar');
    if (!bar) return;
    bar.classList.remove('active');
    bar.style.width = '0%';
  });

  // Crisp Enterprise Line Icons
  const ICONS = {
    dashboard: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>',
    accounting: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>',
    chart: '<path d="M3 3v18h18v-2H5V3H3zm4 12h2v4H7v-4zm4-6h2v10h-2V9zm4 4h2v6h-2v-6zm4-8h2v14h-2V5z"/>',
    purchasing: '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>',
    people: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    portal: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>',
    report: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>',
    check: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
    bell: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>',
    sun: '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>',
    moon: '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/>',
    search: '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
    menu: '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>',
    chevronLeft: '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>',
    chevronRight: '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>',
    home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
    layers: '<path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9.07l-9-7-9 7 1.63 1.27L12 16z"/>',
    plus: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
    download: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>'
  };

  function svg(name, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${ICONS[name] || ''}</svg>`;
  }
  window.afxSvg = svg;

  // Global Navigation Taxonomy
  const NAV_STRUCTURE = [
    {
      group: 'Overview',
      items: [
        { id: 'summary', label: 'Executive Summary', icon: 'dashboard', href: 'summary.html' }
      ]
    },
    {
      group: 'Core Financials',
      items: [
        { id: 'dashboard', label: 'Financial Overview', icon: 'accounting', href: 'financials.html' },
        { id: 'report', label: 'Trial Balance & Ledger', icon: 'report', href: 'report.html' }
      ]
    },
    {
      group: 'Procurement & Stock',
      items: [
        { id: 'list', label: 'Purchase Orders', icon: 'purchasing', href: 'list.html', count: '8' },
        { id: 'form', label: 'Create Order', icon: 'plus', href: 'form.html' }
      ]
    },
    {
      group: 'People & Operations',
      items: [
        { id: 'record', label: 'Personnel Dossier', icon: 'people', href: 'record.html' },
        { id: 'approval', label: 'Approval Governance', icon: 'check', href: 'approval.html', count: '5' },
        { id: 'portal-home', label: 'Self-Service Portal', icon: 'portal', href: 'portal.html' }
      ]
    },
    {
      group: 'System & Landing',
      items: [
        { id: 'landing', label: 'Platform Welcome', icon: 'home', href: 'index.html' }
      ]
    }
  ];

  // Command Palette Items
  const COMMANDS = [
    {
      group: 'Workspaces',
      items: [
        { title: 'Executive Summary (All Modules)', href: 'summary.html', key: 'G X' },
        { title: 'Accounting Overview Dashboard', href: 'financials.html', key: 'G D' },
        { title: 'Purchase Orders Procurement Deck', href: 'list.html', key: 'G P' },
        { title: 'New Purchase Order Studio', href: 'form.html', key: 'N O' },
        { title: 'Trial Balance & Financial Ledger', href: 'report.html', key: 'G T' },
        { title: 'Leave Application Decision Center', href: 'approval.html', key: 'G A' },
        { title: 'Employee Self-Service Portal', href: 'portal.html', key: 'G S' },
        { title: 'Employee Personnel File (Hanna Baptista)', href: 'record.html', key: 'G E' },
        { title: 'AFINTRIX Enterprise Welcome Portal', href: 'index.html', key: 'G H' }
      ]
    },
    {
      group: 'Quick Operations',
      items: [
        { title: 'Record New Ledger Entry', action: 'openNewEntry', key: 'N E' },
        { title: 'Switch Light / Dark Theme', action: 'toggleTheme', key: 'T T' },
        { title: 'Toggle Navigation Workspace Width', action: 'toggleNav', key: 'Ctrl B' },
        { title: 'Export Financial Audit Pack (XLSX)', action: 'exportAudit', key: 'Ctrl E' }
      ]
    }
  ];

  // Theme Storage
  function getTheme() {
    try {
      return localStorage.getItem('afx-theme') || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try {
      localStorage.setItem('afx-theme', t);
    } catch (e) {}
    document.querySelectorAll('.theme-toggle-trigger').forEach(btn => {
      btn.classList.add('spin');
      setTimeout(() => {
        btn.innerHTML = svg(t === 'dark' ? 'sun' : 'moon', 17);
        requestAnimationFrame(() => btn.classList.remove('spin'));
      }, 160);
    });
  }

  // Toast Notification Dispatcher
  function toast(title, desc = '', type = 'info') {
    let container = document.getElementById('afxToastDeck');
    if (!container) {
      container = document.createElement('div');
      container.id = 'afxToastDeck';
      container.className = 'saas-toast-deck';
      document.body.appendChild(container);
    }

    const t = document.createElement('div');
    const typeClass = type === 'p' || type === 'success' ? 'success' :
                      type === 'n' || type === 'danger' ? 'danger' :
                      type === 'w' || type === 'warning' ? 'warning' : 'info';

    t.className = `toast-box ${typeClass}`;
    t.innerHTML = `
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    container.appendChild(t);

    const kill = () => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition = 'all 0.18s ease';
      setTimeout(() => t.remove(), 200);
    };

    t.querySelector('.toast-close').addEventListener('click', kill);
    setTimeout(kill, 4200);
  }
  window.afxToast = toast;

  // Brief scale-pop feedback (checkboxes, toggles)
  function popPulse(el) {
    el.classList.remove('pop');
    void el.offsetWidth; // restart animation
    el.classList.add('pop');
    el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
  }

  // Overlay Dismissal
  function closeAll() {
    document.getElementById('overlayScrim')?.classList.remove('open');
    document.querySelectorAll('.saas-modal.open, .saas-drawer.open, .saas-cmdk.open').forEach(el => {
      el.classList.remove('open');
    });
    document.querySelectorAll('.topbar-dropdown.open').forEach(el => el.classList.remove('open'));
    document.querySelector('.app')?.classList.remove('mobile-nav-open');
  }
  window.afxClose = closeAll;

  // Command Palette
  function openCmdk() {
    const scrim = document.getElementById('overlayScrim');
    const cmdk = document.getElementById('cmdkModal');
    if (!scrim || !cmdk) return;

    scrim.classList.add('open');
    cmdk.classList.add('open');
    const input = document.getElementById('cmdkQueryInput');
    if (input) {
      input.value = '';
      renderCmdkList('');
      setTimeout(() => input.focus(), 40);
    }
  }

  function renderCmdkList(q) {
    const list = document.getElementById('cmdkResultsList');
    if (!list) return;

    q = q.toLowerCase().trim();
    let html = '';
    let matchCount = 0;

    COMMANDS.forEach(grp => {
      const hits = grp.items.filter(it => !q || it.title.toLowerCase().includes(q));
      if (!hits.length) return;
      matchCount += hits.length;

      html += `<div class="cmdk-group-title">${grp.group}</div>`;
      hits.forEach(it => {
        if (it.href) {
          html += `
            <a href="${it.href}" class="cmdk-row">
              <span>${it.title}</span>
              ${it.key ? `<span class="cmdk-key-hint">${it.key}</span>` : ''}
            </a>
          `;
        } else {
          html += `
            <div class="cmdk-row" data-action="${it.action}">
              <span>${it.title}</span>
              ${it.key ? `<span class="cmdk-key-hint">${it.key}</span>` : ''}
            </div>
          `;
        }
      });
    });

    list.innerHTML = matchCount ? html : `<div style="padding:28px;text-align:center;color:var(--ink-muted)">No matching records for &ldquo;${q}&rdquo;</div>`;
    setCmdkFocus(0);
  }

  // Keyboard-navigable focus state for the command palette results
  function setCmdkFocus(index) {
    const rows = Array.from(document.querySelectorAll('#cmdkResultsList .cmdk-row'));
    if (!rows.length) return;
    const clamped = ((index % rows.length) + rows.length) % rows.length;
    rows.forEach(r => r.classList.remove('focused'));
    rows[clamped].classList.add('focused');
    rows[clamped].scrollIntoView({ block: 'nearest' });
  }

  function moveCmdkFocus(delta) {
    const rows = Array.from(document.querySelectorAll('#cmdkResultsList .cmdk-row'));
    if (!rows.length) return;
    const current = rows.findIndex(r => r.classList.contains('focused'));
    setCmdkFocus((current === -1 ? 0 : current) + delta);
  }

  function activateCmdkFocused() {
    const focused = document.querySelector('#cmdkResultsList .cmdk-row.focused');
    if (focused) focused.click();
  }

  // Shell Builder
  function buildStudioShell() {
    const appEl = document.querySelector('.app');
    if (!appEl) return;

    const currentSection = appEl.dataset.section || '';

    // 1. Sidebar HTML
    const sidebar = `
      <aside class="app-sidebar" id="appSidebar">
        <div class="sidebar-brand-deck">
          <a href="index.html" class="brand-link" title="AFINTRIX ERP Platform">
            <img src="assets/afintrix-logo.png" alt="AFINTRIX" class="brand-full-logo">
            <img src="assets/afintrix-symbol.png" alt="AFINTRIX" class="brand-symbol-logo">
          </a>
          <button class="sidebar-toggle-btn" id="sidebarToggleBtn" title="Collapse / Expand Workspace (Ctrl+B)">
            ${svg('chevronLeft', 16)}
          </button>
        </div>

        <div class="sidebar-org-switcher">
          <div class="org-pill">
            <div class="org-avatar-badge">AD</div>
            <div class="org-info">
              <div class="org-name">Afintrix (Demo) Entity</div>
              <div class="org-meta">Dhaka AD &middot; FY 2026-2027</div>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav-scroll" aria-label="Module Navigation">
          ${NAV_STRUCTURE.map(group => `
            <div class="nav-section-header">${group.group}</div>
            ${group.items.map(item => `
              <a href="${item.href}" class="nav-item-link ${item.id === currentSection ? 'active' : ''}" title="${item.label}">
                <span class="nav-icon">${svg(item.icon, 18)}</span>
                <span>${item.label}</span>
                ${item.count ? `<span class="nav-count-pill">${item.count}</span>` : ''}
              </a>
            `).join('')}
          `).join('')}
        </nav>

        <div class="sidebar-footer-card">
          <img src="assets/avatar_hanna.jpg" alt="Hanna Baptista" class="user-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="user-thumb-fallback" style="display:none">HB</div>
          <div class="user-meta-info">
            <div class="user-name">Hanna Baptista</div>
            <div class="user-role-label">Senior Accounts Officer</div>
          </div>
        </div>
      </aside>
    `;

    appEl.insertAdjacentHTML('afterbegin', sidebar);

    // 2. Main Viewport Top Bar
    const mainEl = appEl.querySelector('.main') || appEl.querySelector('main');
    if (mainEl) {
      mainEl.classList.add('app-main');
      const crumbEl = mainEl.querySelector('[data-crumb]');
      const rawCrumb = crumbEl ? crumbEl.dataset.crumb : 'AFINTRIX / Enterprise';
      const parts = rawCrumb.split('/');

      const breadcrumbHtml = `
        <div class="breadcrumbs-deck">
          ${parts.map((p, i) => {
            const isLast = i === parts.length - 1;
            return isLast
              ? `<span class="current-crumb">${p.trim()}</span>`
              : `<a href="#">${p.trim()}</a><span class="slash">/</span>`;
          }).join('')}
        </div>
      `;

      const topBar = `
        <header class="top-bar-deck">
          <div class="top-bar-left">
            <button class="action-icon-btn mobile-only" id="mobileNavTrigger" aria-label="Toggle Navigation">
              ${svg('menu', 18)}
            </button>
            ${breadcrumbHtml}
          </div>

          <div class="top-bar-right">
            <button class="command-search-trigger" id="cmdkTriggerBtn">
              ${svg('search', 15)}
              <span>Search or jump to...</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button class="action-icon-btn theme-toggle-trigger" id="themeToggleTrigger" title="Toggle Light / Dark Mode">
              ${svg('moon', 17)}
            </button>

            <div style="position:relative">
              <button class="action-icon-btn" id="notifBellBtn" title="Alerts &amp; Tasks">
                ${svg('bell', 17)}
                <span class="badge-dot"></span>
              </button>
              <div class="topbar-dropdown" id="notifDropdown">
                <div class="topbar-dropdown-header">
                  <h4>Alerts &amp; Tasks</h4>
                  <span class="status-badge red">3 New</span>
                </div>
                <div class="notif-item">
                  <div class="notif-icon" style="background:var(--gold-surface);color:var(--gold-ink)">${svg('report', 15)}</div>
                  <div class="notif-body">
                    <div class="notif-title">4 receivables crossed the 90-day threshold</div>
                    <div class="notif-time">12 minutes ago</div>
                  </div>
                </div>
                <div class="notif-item">
                  <div class="notif-icon" style="background:var(--brand-surface);color:var(--brand)">${svg('purchasing', 15)}</div>
                  <div class="notif-body">
                    <div class="notif-title">PUR-ORD-2026-00041 is ready to bill</div>
                    <div class="notif-time">1 hour ago</div>
                  </div>
                </div>
                <div class="notif-item">
                  <div class="notif-icon" style="background:var(--pos-surface);color:var(--pos)">${svg('check', 15)}</div>
                  <div class="notif-body">
                    <div class="notif-title">Trial Balance audit check passed</div>
                    <div class="notif-time">3 hours ago</div>
                  </div>
                </div>
              </div>
            </div>

            <a href="portal.html" class="btn btn-secondary btn-sm" style="gap:6px" title="Employee Self-Service">
              <span class="live-dot"></span>
              <span>Portal</span>
            </a>

            <div style="position:relative">
              <button class="profile-trigger" id="profileTrigger">
                <img src="assets/avatar_hanna.jpg" alt="Hanna Baptista" class="profile-trigger-avatar" onerror="this.remove()">
                <span style="display:inline-flex;color:var(--ink-muted);transform:rotate(90deg)">${svg('chevronRight', 12)}</span>
              </button>
              <div class="topbar-dropdown" id="profileDropdown" style="width:230px">
                <div class="topbar-dropdown-header">
                  <div>
                    <div style="font-size:12.5px;font-weight:700;color:var(--ink)">Hanna Baptista</div>
                    <div style="font-size:11px;color:var(--ink-muted)">Senior Accounts Officer</div>
                  </div>
                </div>
                <div style="padding:6px">
                  <div class="profile-menu-item">${svg('people', 15)}<span>View Profile</span></div>
                  <div class="profile-menu-item">${svg('layers', 15)}<span>Switch Entity</span></div>
                  <div class="profile-menu-item" data-action="toggleTheme">${svg('moon', 15)}<span>Appearance</span></div>
                  <div class="profile-menu-item" data-toast="Signed Out|This is a demo workspace — session preserved.|info">${svg('chevronLeft', 15)}<span>Sign Out</span></div>
                </div>
              </div>
            </div>
          </div>
        </header>
      `;

      mainEl.insertAdjacentHTML('afterbegin', topBar);

      // Module-colored icon badge next to the page H1
      const moduleIconMap = { accounting: 'accounting', purchasing: 'purchasing', people: 'people' };
      const moduleIcon = moduleIconMap[appEl.dataset.module] || 'dashboard';
      const h1 = mainEl.querySelector('.page-headline-group h1');
      if (h1 && !h1.querySelector('.page-icon-badge')) {
        h1.insertAdjacentHTML('afterbegin', `<span class="page-icon-badge">${svg(moduleIcon, 23)}</span>`);
      }
    }

    // 3. Mount Global Overlays
    const overlays = `
      <div class="overlay-scrim" id="overlayScrim"></div>
      <div class="saas-cmdk" id="cmdkModal">
        <div class="cmdk-input-bar">
          ${svg('search', 18)}
          <input type="text" id="cmdkQueryInput" placeholder="Jump to workspace, invoice, employee, or action..." autocomplete="off">
        </div>
        <div class="cmdk-list" id="cmdkResultsList"></div>
      </div>
      <div class="saas-toast-deck" id="afxToastDeck"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlays);
    setTheme(getTheme());
  }

  // Live Table Sorter
  function initSorting() {
    document.querySelectorAll('table.saas-table, table.data-table').forEach(table => {
      const headers = table.querySelectorAll('thead th.sortable');
      headers.forEach(th => {
        const colIdx = Array.prototype.indexOf.call(th.parentNode.children, th);
        if (!th.querySelector('.sort-arrow')) {
          th.insertAdjacentHTML('beforeend', '<span class="sort-arrow">▲</span>');
        }

        th.addEventListener('click', () => {
          const isAsc = th.classList.contains('asc');
          headers.forEach(h => h.classList.remove('asc', 'desc'));
          th.classList.add(isAsc ? 'desc' : 'asc');

          const tbody = table.querySelector('tbody');
          if (!tbody) return;

          const rows = Array.from(tbody.querySelectorAll('tr'));
          rows.sort((a, b) => {
            const cellA = a.children[colIdx];
            const cellB = b.children[colIdx];
            if (!cellA || !cellB) return 0;

            const valA = cellA.dataset.sort !== undefined ? cellA.dataset.sort : cellA.textContent.trim();
            const valB = cellB.dataset.sort !== undefined ? cellB.dataset.sort : cellB.textContent.trim();

            const numA = parseFloat(valA.replace(/[^0-9.-]/g, ''));
            const numB = parseFloat(valB.replace(/[^0-9.-]/g, ''));

            if (!isNaN(numA) && !isNaN(numB)) {
              return isAsc ? numB - numA : numA - numB;
            }
            return isAsc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          });

          rows.forEach(r => tbody.appendChild(r));
        });
      });
    });
  }

  // Table Row Entrance Stagger (first page-load paint only)
  function initTableStagger() {
    document.querySelectorAll('table.saas-table tbody').forEach(tbody => {
      const rows = Array.from(tbody.children).slice(0, 14);
      rows.forEach((row, i) => {
        row.style.animationDelay = `${i * 28}ms`;
        row.classList.add('row-enter');
        row.addEventListener('animationend', () => row.classList.remove('row-enter'), { once: true });
      });
    });
  }

  // Live Filter Input
  function initFilter() {
    document.querySelectorAll('[data-filter]').forEach(input => {
      const table = document.querySelector(input.dataset.filter);
      if (!table) return;

      input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        let matches = 0;

        table.querySelectorAll('tbody tr').forEach(row => {
          const text = row.textContent.toLowerCase();
          const hit = !query || text.includes(query);
          row.style.display = hit ? '' : 'none';
          if (hit) matches++;
        });

        const countEl = document.querySelector('[data-count]');
        if (countEl && countEl.dataset.count) {
          countEl.textContent = countEl.dataset.count.replace('{n}', matches);
        }
      });
    });
  }

  // ==========================================================================
  // CHARTS ENGINE (Chart.js) — theme-aware, interactive, dark-mode reactive
  // ==========================================================================
  const chartRegistry = [];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function hexAlpha(hex, alpha) {
    hex = (hex || '#1E39D6').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function fmtCurrency(v) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }

  function fmtCompact(v) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  }

  function chartTheme() {
    return {
      ink: cssVar('--ink'),
      inkSecondary: cssVar('--ink-secondary'),
      inkMuted: cssVar('--ink-muted'),
      border: cssVar('--border-subtle'),
      surface: cssVar('--surface'),
      brand: cssVar('--brand'),
      gold: cssVar('--gold'),
      pos: cssVar('--pos'),
      neg: cssVar('--neg'),
      warn: cssVar('--warn'),
    };
  }

  // Floating HTML tooltip, shared by every chart. A native canvas-drawn
  // tooltip is clipped to its own chart's bounds — fatal for a 148px donut,
  // which has no room to render one without covering the ring/center label.
  // Rendering it as a fixed-position DOM element lets it float freely above
  // everything, correctly anchored to the hovered point via caretX/caretY.
  function getChartTooltipEl() {
    let el = document.getElementById('afxChartTooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'afxChartTooltip';
      el.className = 'afx-chart-tooltip';
      document.body.appendChild(el);
    }
    return el;
  }

  function afxExternalTooltip(context) {
    const { chart, tooltip } = context;
    const el = getChartTooltipEl();

    if (!tooltip || tooltip.opacity === 0) {
      el.classList.remove('visible');
      return;
    }

    const titleLines = tooltip.title || [];
    const bodyLines = (tooltip.body || []).map(b => b.lines).flat();
    let html = '';
    if (titleLines.length) html += `<div class="afx-tt-title">${titleLines.join(' ')}</div>`;
    bodyLines.forEach((line, i) => {
      const colors = tooltip.labelColors && tooltip.labelColors[i];
      const sw = colors ? `<span class="afx-tt-swatch" style="background:${colors.backgroundColor}"></span>` : '';
      html += `<div class="afx-tt-row">${sw}<span>${line}</span></div>`;
    });
    el.innerHTML = html;

    const canvasRect = chart.canvas.getBoundingClientRect();
    const x = canvasRect.left + tooltip.caretX;
    const y = canvasRect.top + tooltip.caretY;

    el.classList.add('visible');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // Keep it inside the viewport horizontally
    const rect = el.getBoundingClientRect();
    let shiftX = 0;
    if (rect.left < 8) shiftX = 8 - rect.left;
    if (rect.right > window.innerWidth - 8) shiftX = (window.innerWidth - 8) - rect.right;
    if (shiftX) el.style.left = `${x + shiftX}px`;
  }

  function baseTooltip() {
    return { enabled: false, external: afxExternalTooltip };
  }

  function centerTextPlugin(getMain, getSub, t, mainSize = 17, subSize = 9.5) {
    return {
      id: `centerText-${Math.random().toString(36).slice(2)}`,
      afterDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        const sub = getSub();
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = t.ink;
        ctx.font = `800 ${mainSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.fillText(getMain(), cx, sub ? cy - (mainSize * 0.53) : cy);
        if (sub) {
          ctx.fillStyle = t.inkMuted;
          ctx.font = `600 ${subSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.fillText(sub, cx, cy + (mainSize * 0.6));
        }
        ctx.restore();
      },
    };
  }

  // Correct on-chart position for a programmatically-activated arc (doughnut)
  // segment — without this, Chart.js pins the tooltip at the event position
  // you pass it, which defaults to the canvas origin if not supplied.
  function arcTooltipPos(chart, datasetIndex, index) {
    try {
      const el = chart.getDatasetMeta(datasetIndex).data[index];
      return el.tooltipPosition();
    } catch (e) {
      return { x: chart.width / 2, y: chart.height / 2 };
    }
  }

  function registerChart(canvasId, factory) {
    const el = document.getElementById(canvasId);
    if (!el || typeof Chart === 'undefined') return null;
    const chart = factory(el, chartTheme());
    if (chart) chartRegistry.push({ canvasId, chart, factory, el });
    return chart;
  }

  function refreshChartThemes() {
    chartRegistry.forEach(entry => {
      entry.chart.destroy();
      entry.chart = entry.factory(entry.el, chartTheme());
    });
  }
  window.afxRefreshCharts = refreshChartThemes;

  function makeSparkline(canvasId, data, colorVar) {
    registerChart(canvasId, (el, t) => {
      const color = t[colorVar] || t.brand;
      return new Chart(el.getContext('2d'), {
        type: 'line',
        data: {
          labels: data.map((_, i) => i),
          datasets: [{
            data,
            borderColor: color,
            backgroundColor: hexAlpha(color, 0.12),
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: color,
            tension: 0.4,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { display: false },
            tooltip: {
              ...baseTooltip(t),
              displayColors: false,
              callbacks: { title: () => '', label: (c) => fmtCompact(c.parsed.y) },
            },
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        },
      });
    });
  }

  // Compact radial progress ring — replaces a plain linear progress bar with
  // a small Chart.js doughnut + centered percentage, reused anywhere a KPI
  // tile shows a "used / total" ratio (leave quotas, attendance, balances).
  function makeRadialRing(canvasId, value, max, colorVar) {
    registerChart(canvasId, (el, t) => {
      const color = t[colorVar] || t.brand;
      const pct = max > 0 ? Math.round((value / max) * 100) : 0;
      return new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [value, Math.max(max - value, 0)],
            backgroundColor: [color, t.border],
            borderWidth: 0,
            borderRadius: 3,
            spacing: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          animation: { animateRotate: true, duration: 650 },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
        plugins: [centerTextPlugin(() => `${pct}%`, () => '', t, 10.5)],
      });
    });
  }

  // Shared fiscal data — referenced by both the Financial Overview and the
  // Executive Summary so the two can never report different numbers.
  const FY = {
    months: ['Jul 26', 'Aug 26', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 27', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [182000, 174000, 158000, 165000, 171000, 179000, 188000, 184000, 192000, 198000, 205000, 212000],
    expense: [106000, 88000, 98000, 101000, 104000, 109000, 112000, 108000, 115000, 118000, 121000, 124000],
    actualCount: 2,
    ageingLabels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
    ageing: [142100, 78600, 56900, 38500],
    cashMonths: ['Sep 25', 'Oct', 'Nov', 'Dec', 'Jan 26', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug 26'],
    cash: [42647, 50000, 39706, 54412, 47059, 58824, 27941, 7353, -27941, -66176, -89706, -117854],
    poStatusLabels: ['Fulfilled', 'To Receive & Bill', 'To Bill', 'To Receive', 'Draft', 'Cancelled'],
    poStatus: [3, 1, 1, 1, 1, 1],
  };

  function initDashboardCharts() {
    const months = FY.months;
    const revenue = FY.revenue;
    const expense = FY.expense;
    const actualCount = FY.actualCount;

    registerChart('trajectoryChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            type: 'bar',
            label: 'Revenue',
            data: revenue,
            backgroundColor: (ctx) => ctx.dataIndex < actualCount ? t.brand : hexAlpha(t.brand, 0.22),
            borderRadius: 4,
            maxBarThickness: 20,
            order: 2,
          },
          {
            type: 'bar',
            label: 'Expense',
            data: expense,
            backgroundColor: (ctx) => ctx.dataIndex < actualCount ? t.gold : hexAlpha(t.gold, 0.28),
            borderRadius: 4,
            maxBarThickness: 20,
            order: 2,
          },
          {
            type: 'line',
            label: 'Net',
            data: revenue.map((r, i) => r - expense[i]),
            borderColor: t.pos,
            backgroundColor: t.pos,
            borderWidth: 2.5,
            pointRadius: (ctx) => ctx.dataIndex < actualCount ? 4 : 0,
            pointHoverRadius: 5,
            pointBackgroundColor: t.surface,
            pointBorderColor: t.pos,
            pointBorderWidth: 2,
            tension: 0.35,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...baseTooltip(t),
            callbacks: { label: (c) => `${c.dataset.label}: ${fmtCurrency(c.parsed.y)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.inkMuted, font: { size: 10.5 } }, border: { display: false } },
          y: {
            grid: { color: t.border },
            ticks: { color: t.inkMuted, font: { size: 10 }, callback: (v) => fmtCompact(v) },
            border: { display: false },
          },
        },
      },
    }));

    registerChart('ageingDonut', (el, t) => new Chart(el.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: FY.ageingLabels,
        datasets: [{
          data: FY.ageing,
          backgroundColor: [t.brand, hexAlpha(t.brand, 0.72), hexAlpha(t.brand, 0.4), t.gold],
          borderColor: t.surface,
          borderWidth: 3,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: { animateRotate: true, duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...baseTooltip(t),
            callbacks: { label: (c) => `${c.label}: ${fmtCurrency(c.parsed)}` },
          },
        },
      },
      plugins: [centerTextPlugin(() => '$316.1K', () => 'Outstanding', t)],
    }));

    registerChart('cashFlowChart', (el, t) => {
      const cmonths = FY.cashMonths;
      const balances = FY.cash;
      return new Chart(el.getContext('2d'), {
        type: 'line',
        data: {
          labels: cmonths,
          datasets: [{
            label: 'Bank Balance',
            data: balances,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: t.surface,
            tension: 0.3,
            fill: 'origin',
            segment: {
              borderColor: (ctx) => (ctx.p0.parsed.y < 0 || ctx.p1.parsed.y < 0) ? t.neg : t.brand,
              backgroundColor: (ctx) => (ctx.p0.parsed.y < 0 || ctx.p1.parsed.y < 0) ? hexAlpha(t.neg, 0.1) : hexAlpha(t.brand, 0.14),
            },
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { ...baseTooltip(t), callbacks: { label: (c) => fmtCurrency(c.parsed.y) } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: t.inkMuted, font: { size: 10.5 } }, border: { display: false } },
            y: {
              ticks: { color: t.inkMuted, font: { size: 10 }, callback: (v) => fmtCompact(v) },
              grid: {
                color: (ctx) => ctx.tick.value === 0 ? t.inkMuted : t.border,
                lineWidth: (ctx) => ctx.tick.value === 0 ? 1.5 : 1,
              },
              border: { display: false },
            },
          },
        },
      });
    });

    registerChart('expenseBreakdownChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Cost of Goods Sold', 'Payroll & Benefits', 'Logistics & Freight', 'Utilities & Facility', 'Marketing & BD', 'Software & Tools', 'Other G&A'],
        datasets: [{
          data: [580000, 330000, 132000, 80000, 78000, 54000, 50000],
          backgroundColor: [t.brand, hexAlpha(t.brand, 0.82), hexAlpha(t.brand, 0.6), t.gold, hexAlpha(t.gold, 0.75), hexAlpha(t.inkMuted, 0.55), hexAlpha(t.inkMuted, 0.3)],
          borderRadius: 5,
          barThickness: 15,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => fmtCurrency(c.parsed.x) } },
        },
        scales: {
          x: { grid: { color: t.border }, ticks: { color: t.inkMuted, font: { size: 10 }, callback: (v) => fmtCompact(v) }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: t.inkSecondary, font: { size: 11, weight: '600' } }, border: { display: false } },
        },
      },
    }));

    registerChart('budgetRadarChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Operations', 'Sales & Mktg', 'R&D / Product', 'Admin & Finance', 'HR & People', 'IT & Infra'],
        datasets: [
          {
            label: 'Budgeted',
            data: [92, 78, 65, 54, 38, 46],
            borderColor: hexAlpha(t.inkMuted, 0.7),
            backgroundColor: hexAlpha(t.inkMuted, 0.06),
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointRadius: 0,
          },
          {
            label: 'Actual',
            data: [88, 82, 58, 51, 41, 49],
            borderColor: t.brand,
            backgroundColor: hexAlpha(t.brand, 0.18),
            borderWidth: 2,
            pointBackgroundColor: t.brand,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: t.inkSecondary, boxWidth: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', padding: 14 } },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.r}% of plan` } },
        },
        scales: {
          r: {
            grid: { color: t.border },
            angleLines: { color: t.border },
            pointLabels: { color: t.inkSecondary, font: { size: 10.5 } },
            ticks: { display: false, backdropColor: 'transparent' },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    }));

    makeSparkline('sparkOutgoing', [2.9, 3.05, 3.0, 3.2, 3.35, 3.4, 3.63], 'brand');
    makeSparkline('sparkIncoming', [3.1, 3.0, 3.15, 3.25, 3.2, 3.35, 3.49], 'inkSecondary');
    makeSparkline('sparkInflow', [30, 34, 31, 38, 42, 39, 47], 'pos');
    makeSparkline('sparkOverdue', [52, 48, 45, 41, 39, 38.5, 38.5], 'gold');

    // Hover-sync: Receivables Ageing legend rows <-> donut segments
    document.querySelectorAll('[data-chart-link]').forEach(row => {
      const linked = chartRegistry.find(c => c.canvasId === row.dataset.chartLink);
      if (!linked) return;
      const segIndex = parseInt(row.dataset.segIndex, 10);
      row.addEventListener('mouseenter', () => {
        const pos = arcTooltipPos(linked.chart, 0, segIndex);
        linked.chart.setActiveElements([{ datasetIndex: 0, index: segIndex }]);
        linked.chart.tooltip.setActiveElements([{ datasetIndex: 0, index: segIndex }], pos);
        linked.chart.update();
      });
      row.addEventListener('mouseleave', () => {
        linked.chart.setActiveElements([]);
        linked.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
        linked.chart.update();
      });
    });
  }

  function initReportCharts() {
    registerChart('ledgerGroupChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Assets (Net)', 'Liabilities', 'Income', 'Expenses'],
        datasets: [{
          data: [293633, 184293, 363100, 253760],
          backgroundColor: [t.brand, t.gold, t.pos, t.neg],
          borderRadius: 6,
          barThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => fmtCurrency(c.parsed.x) } },
        },
        scales: {
          x: { grid: { color: t.border }, ticks: { color: t.inkMuted, callback: (v) => fmtCompact(v) }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: t.inkSecondary, font: { size: 11.5, weight: '700' } }, border: { display: false } },
        },
      },
    }));
  }

  function initListCharts() {
    registerChart('poStatusDonut', (el, t) => new Chart(el.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: FY.poStatusLabels,
        datasets: [{
          data: FY.poStatus,
          backgroundColor: [t.pos, t.brand, t.warn, hexAlpha(t.brand, 0.5), t.inkMuted, t.neg],
          borderColor: t.surface,
          borderWidth: 3,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: { animateRotate: true, duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => `${c.label}: ${c.parsed} order${c.parsed === 1 ? '' : 's'}` } },
        },
      },
      plugins: [centerTextPlugin(() => '8', () => 'Orders', t)],
    }));
  }

  function initSummaryCharts() {
    registerChart('sumTrendChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: FY.months,
        datasets: [
          {
            type: 'bar',
            label: 'Revenue',
            data: FY.revenue,
            backgroundColor: (ctx) => ctx.dataIndex < FY.actualCount ? t.brand : hexAlpha(t.brand, 0.22),
            borderRadius: 4,
            maxBarThickness: 18,
            order: 2,
          },
          {
            type: 'bar',
            label: 'Expense',
            data: FY.expense,
            backgroundColor: (ctx) => ctx.dataIndex < FY.actualCount ? t.gold : hexAlpha(t.gold, 0.28),
            borderRadius: 4,
            maxBarThickness: 18,
            order: 2,
          },
          {
            type: 'line',
            label: 'Net',
            data: FY.revenue.map((r, i) => r - FY.expense[i]),
            borderColor: t.pos,
            borderWidth: 2.5,
            pointRadius: (ctx) => ctx.dataIndex < FY.actualCount ? 4 : 0,
            pointHoverRadius: 5,
            pointBackgroundColor: t.surface,
            pointBorderColor: t.pos,
            pointBorderWidth: 2,
            tension: 0.35,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => `${c.dataset.label}: ${fmtCurrency(c.parsed.y)}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.inkMuted, font: { size: 10 } }, border: { display: false } },
          y: { grid: { color: t.border }, ticks: { color: t.inkMuted, font: { size: 10 }, callback: (v) => fmtCompact(v) }, border: { display: false } },
        },
      },
    }));

    registerChart('sumAgeingDonut', (el, t) => new Chart(el.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: FY.ageingLabels,
        datasets: [{
          data: FY.ageing,
          backgroundColor: [t.brand, hexAlpha(t.brand, 0.72), hexAlpha(t.brand, 0.4), t.gold],
          borderColor: t.surface,
          borderWidth: 3,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: { animateRotate: true, duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => `${c.label}: ${fmtCurrency(c.parsed)}` } },
        },
      },
      plugins: [centerTextPlugin(() => '$316.1K', () => 'Receivable', t)],
    }));

    registerChart('sumProcurementDonut', (el, t) => new Chart(el.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: FY.poStatusLabels,
        datasets: [{
          data: FY.poStatus,
          backgroundColor: [t.pos, t.brand, t.warn, hexAlpha(t.brand, 0.5), t.inkMuted, t.neg],
          borderColor: t.surface,
          borderWidth: 3,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: { animateRotate: true, duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => `${c.label}: ${c.parsed} order${c.parsed === 1 ? '' : 's'}` } },
        },
      },
      plugins: [centerTextPlugin(() => '8', () => 'Orders', t)],
    }));

    registerChart('sumApprovalBar', (el, t) => new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Casual Leave', 'Travel Expense', 'Purchase Order'],
        datasets: [{
          data: [3, 1, 1],
          backgroundColor: [t.warn, t.brand, hexAlpha(t.brand, 0.55)],
          borderRadius: 5,
          barThickness: 18,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => `${c.parsed.x} pending` } },
        },
        scales: {
          x: { grid: { color: t.border }, ticks: { color: t.inkMuted, stepSize: 1, font: { size: 10 } }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: t.inkSecondary, font: { size: 11, weight: '600' } }, border: { display: false } },
        },
      },
    }));

    registerChart('sumCashChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'line',
      data: {
        labels: FY.cashMonths,
        datasets: [{
          label: 'Bank Balance',
          data: FY.cash,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: 'origin',
          segment: {
            borderColor: (ctx) => (ctx.p0.parsed.y < 0 || ctx.p1.parsed.y < 0) ? t.neg : t.brand,
            backgroundColor: (ctx) => (ctx.p0.parsed.y < 0 || ctx.p1.parsed.y < 0) ? hexAlpha(t.neg, 0.1) : hexAlpha(t.brand, 0.14),
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => fmtCurrency(c.parsed.y) } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.inkMuted, font: { size: 10 }, maxTicksLimit: 6 }, border: { display: false } },
          y: {
            ticks: { color: t.inkMuted, font: { size: 10 }, callback: (v) => fmtCompact(v) },
            grid: {
              color: (ctx) => ctx.tick.value === 0 ? t.inkMuted : t.border,
              lineWidth: (ctx) => ctx.tick.value === 0 ? 1.5 : 1,
            },
            border: { display: false },
          },
        },
      },
    }));

    makeSparkline('sumSparkSurplus', [68, 72, 70, 79, 84, 97, 109.3], 'pos');
    makeSparkline('sumSparkReceivable', [284, 291, 303, 298, 309, 312, 316.1], 'brand');
    makeSparkline('sumSparkProcurement', [612, 704, 788, 851, 923, 986, 1048.5], 'gold');
    makeSparkline('sumSparkApprovals', [2, 3, 3, 4, 3, 4, 5], 'warn');
  }

  function initApprovalCharts() {
    makeRadialRing('ringPostApproval', 5, 10, 'pos');
    makeRadialRing('ringTeamCoverage', 1, 6, 'brand');
  }

  function initRecordCharts() {
    makeRadialRing('ringCasualRecord', 8, 10, 'brand');
    makeRadialRing('ringSickRecord', 5, 14, 'warn');
    makeRadialRing('ringEarnedRecord', 12, 20, 'pos');
    makeRadialRing('ringAttendanceRecord', 21, 22, 'gold');

    registerChart('salaryTrendChart', (el, t) => new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['June 2026', 'July 2026', 'August 2026'],
        datasets: [{
          label: 'Net Disbursed',
          data: [77440, 80960, 80960],
          backgroundColor: [hexAlpha(t.brand, 0.55), hexAlpha(t.brand, 0.78), t.brand],
          borderRadius: 5,
          maxBarThickness: 36,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip(t), callbacks: { label: (c) => fmtCurrency(c.parsed.y) } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.inkMuted, font: { size: 10.5 } }, border: { display: false } },
          y: { grid: { color: t.border }, ticks: { color: t.inkMuted, font: { size: 10 }, callback: (v) => fmtCompact(v) }, border: { display: false } },
        },
      },
    }));
  }

  function initLandingCharts() {
    registerChart('landingPreviewChart', (el, t) => {
      const actualCount = 2;
      return new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
          datasets: [{
            data: [160000, 190000, 60000, 40000, 32000],
            backgroundColor: (ctx) => ctx.dataIndex < actualCount ? t.brand : hexAlpha(t.brand, 0.18),
            borderRadius: 3,
            maxBarThickness: 46,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...baseTooltip(t), callbacks: { title: (c) => c[0].label, label: (c) => fmtCurrency(c.parsed.y) } },
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        },
      });
    });
  }

  function initPortalCharts() {
    makeRadialRing('ringCasualPortal', 8, 10, 'brand');
    makeRadialRing('ringMedicalPortal', 5, 14, 'pos');
    makeRadialRing('ringAttendancePortal', 21, 22, 'gold');
  }

  function initCharts() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
    Chart.defaults.font.size = 11.5;
    initSummaryCharts();
    initDashboardCharts();
    initReportCharts();
    initListCharts();
    initApprovalCharts();
    initRecordCharts();
    initPortalCharts();
    initLandingCharts();
  }

  // ==========================================================================
  // COUNT-UP NUMBER ANIMATION
  // ==========================================================================
  function animateCountUp(el) {
    const raw = el.dataset.countup;
    if (raw === undefined) return;
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    const decimals = el.dataset.countupDecimals ? parseInt(el.dataset.countupDecimals, 10) : 0;
    const duration = 1000;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCountUps() {
    const els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(animateCountUp);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCountUp(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    els.forEach(el => io.observe(el));
  }

  // ==========================================================================
  // SCROLL REVEAL — elements tagged .reveal fade/slide in as they enter view,
  // staggered by their position among sibling .reveal elements.
  // ==========================================================================
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
      return;
    }

    document.documentElement.classList.add('reveal-enabled');

    // Any entrance animation that starts below the fold is wasted — the user
    // never sees it play. Promote those to scroll-triggered reveals so every
    // page animates as you scroll, without touching per-page markup.
    document.querySelectorAll('.animate-enter').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0 && rect.top > window.innerHeight * 0.92) {
        el.classList.remove('animate-enter');
        el.classList.add('reveal');
      }
    });

    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    items.forEach(el => {
      const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
      // threshold 0 (not a ratio) so elements taller than the viewport,
      // like long tables, still trigger reliably as they scroll in.
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    items.forEach(el => io.observe(el));
  }

  // ==========================================================================
  // LANDING PAGE INTERACTIONS (header scroll state + preview parallax tilt)
  // ==========================================================================
  function initLandingInteractions() {
    const header = document.getElementById('landingHeader');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const tiltStage = document.getElementById('previewStage');
    const tiltTarget = tiltStage?.querySelector('.preview-window');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (tiltTarget && canHover && !reducedMotion) {
      let frame = null;
      tiltStage.addEventListener('mousemove', (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = null;
          const rect = tiltStage.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          tiltTarget.style.transform = `perspective(1400px) rotateY(${px * 5}deg) rotateX(${-py * 4}deg) translateY(-4px)`;
        });
      });
      tiltStage.addEventListener('mouseleave', () => {
        tiltTarget.style.transform = '';
      });
    }
  }

  // Wire Interactions
  function wireInteractions() {
    const appEl = document.querySelector('.app');

    // Button ripple feedback
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn || btn.disabled || btn.classList.contains('disabled')) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });

    // Internal navigation progress bar (any link to another page in the app)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!/\.html(#.*)?$/.test(href)) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank') return;
      startNavProgress();
    }, true);

    // Sidebar collapse
    document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
      appEl.classList.toggle('nav-collapsed');
    });

    // Top-bar dropdowns (notifications, profile menu)
    function toggleDropdown(triggerId, dropdownId) {
      const trigger = document.getElementById(triggerId);
      const dropdown = document.getElementById(dropdownId);
      if (!trigger || !dropdown) return;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !dropdown.classList.contains('open');
        document.querySelectorAll('.topbar-dropdown.open').forEach(d => d.classList.remove('open'));
        if (willOpen) dropdown.classList.add('open');
      });
    }
    toggleDropdown('notifBellBtn', 'notifDropdown');
    toggleDropdown('profileTrigger', 'profileDropdown');

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.topbar-dropdown, #notifBellBtn, #profileTrigger')) {
        document.querySelectorAll('.topbar-dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });

    document.querySelectorAll('.profile-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.action === 'toggleTheme') {
          setTheme(getTheme() === 'dark' ? 'light' : 'dark');
          refreshChartThemes();
        }
        document.getElementById('profileDropdown')?.classList.remove('open');
      });
    });

    // Top bar elevates once the page content scrolls beneath it
    document.querySelector('.page-viewport-canvas')?.addEventListener('scroll', (e) => {
      document.querySelector('.top-bar-deck')?.classList.toggle('scrolled', e.target.scrollTop > 4);
    });

    // Mobile nav
    document.getElementById('mobileNavTrigger')?.addEventListener('click', () => {
      appEl.classList.toggle('mobile-nav-open');
      document.getElementById('overlayScrim')?.classList.toggle('open');
    });

    // Theme toggle (every trigger, incl. the standalone landing page header)
    document.querySelectorAll('.theme-toggle-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        toast('Display Theme Updated', `Switched to ${getTheme()} mode`, 'info');
        refreshChartThemes();
      });
    });

    // Command palette
    document.getElementById('cmdkTriggerBtn')?.addEventListener('click', openCmdk);
    document.getElementById('cmdkQueryInput')?.addEventListener('input', (e) => {
      renderCmdkList(e.target.value);
    });

    document.getElementById('cmdkResultsList')?.addEventListener('click', (e) => {
      const act = e.target.closest('[data-action]');
      if (act) {
        const action = act.dataset.action;
        closeAll();
        if (action === 'toggleTheme') { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); refreshChartThemes(); }
        if (action === 'toggleNav') appEl.classList.toggle('nav-collapsed');
        if (action === 'openNewEntry') {
          const m = document.getElementById('mNew');
          if (m) {
            document.getElementById('overlayScrim')?.classList.add('open');
            m.classList.add('open');
          }
        }
        if (action === 'exportAudit') toast('Audit Pack Generated', 'Trial Balance and General Ledger exporting as XLSX.', 'success');
      }
    });

    // Tab buttons (with a sliding underline indicator on .page-nav-tabs)
    function positionTabSlider(bar, btn) {
      if (!bar.classList.contains('page-nav-tabs') || !btn) return;
      let slider = bar.querySelector('.tab-slider');
      if (!slider) {
        slider = document.createElement('span');
        slider.className = 'tab-slider';
        bar.appendChild(slider);
      }
      slider.style.left = btn.offsetLeft + 'px';
      slider.style.width = btn.offsetWidth + 'px';
      requestAnimationFrame(() => slider.classList.add('ready'));
    }

    document.querySelectorAll('.page-nav-tabs, .tabs').forEach(bar => {
      positionTabSlider(bar, bar.querySelector('button.active'));

      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        bar.querySelectorAll('button').forEach(b => b.classList.remove('active', 'on'));
        btn.classList.add('active', 'on');
        positionTabSlider(bar, btn);

        const panel = btn.dataset.tab;
        if (panel) {
          let revealedPanel = null;
          document.querySelectorAll('[data-panel]').forEach(p => {
            const show = p.dataset.panel === panel;
            p.hidden = !show;
            if (show) revealedPanel = p;
          });

          if (revealedPanel) {
            // Restart the entrance animation on every switch
            revealedPanel.classList.remove('panel-enter');
            void revealedPanel.offsetWidth;
            revealedPanel.classList.add('panel-enter');

            // Charts created while their tab panel was hidden (display:none)
            // measure a zero-size canvas — resize them now that the panel
            // has real layout dimensions.
            requestAnimationFrame(() => {
              chartRegistry.forEach(entry => {
                if (revealedPanel.contains(entry.el)) entry.chart.resize();
              });
            });
          }
        }
      });
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.page-nav-tabs').forEach(bar => {
        positionTabSlider(bar, bar.querySelector('button.active'));
      });
      document.querySelectorAll('.segmented-control').forEach(group => {
        positionSegmentedPill(group, group.querySelector('.btn.active'));
      });
    });

    // Segmented control (sliding pill)
    function positionSegmentedPill(group, btn) {
      const pill = group.querySelector('.segmented-pill');
      if (!pill || !btn) return;
      pill.style.left = `${btn.offsetLeft}px`;
      pill.style.width = `${btn.offsetWidth}px`;
    }

    document.querySelectorAll('.segmented-control').forEach(group => {
      positionSegmentedPill(group, group.querySelector('.btn.active'));
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        group.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        positionSegmentedPill(group, btn);
      });
    });

    // Native checkbox-option toggles (forms/drawers) — pop the custom square
    document.addEventListener('change', (e) => {
      const input = e.target.closest('.checkbox-option input[type="checkbox"]');
      if (!input || !input.checked) return;
      const square = input.nextElementSibling;
      if (square && square.classList.contains('checkbox-square')) popPulse(square);
    });

    // Checkbox selections & Row toggles
    document.addEventListener('click', (e) => {
      // Custom checkboxes
      const cbx = e.target.closest('.saas-checkbox, .cbx');
      if (cbx) {
        if (cbx.dataset.all !== undefined) {
          const table = cbx.closest('table');
          const check = !cbx.classList.contains('checked') && !cbx.classList.contains('on');
          cbx.classList.toggle('checked', check);
          cbx.classList.toggle('on', check);
          cbx.innerHTML = check ? '✓' : '';
          if (check) popPulse(cbx);

          table.querySelectorAll('tbody .saas-checkbox, tbody .cbx').forEach(c => {
            c.classList.toggle('checked', check);
            c.classList.toggle('on', check);
            c.innerHTML = check ? '✓' : '';
            c.closest('tr')?.classList.toggle('selected', check);
          });
        } else {
          const check = !cbx.classList.contains('checked') && !cbx.classList.contains('on');
          cbx.classList.toggle('checked', check);
          cbx.classList.toggle('on', check);
          cbx.innerHTML = check ? '✓' : '';
          cbx.closest('tr')?.classList.toggle('selected', check);
          if (check) popPulse(cbx);
        }

        const count = document.querySelectorAll('tbody tr.selected').length;
        document.querySelectorAll('[data-selcount]').forEach(el => {
          el.textContent = count ? `${count} selected` : '';
          el.style.display = count ? 'inline-flex' : 'none';
        });
        return;
      }

      // Filter chip remove
      const chipBtn = e.target.closest('.chip-remove-btn, .chip button');
      if (chipBtn) {
        const chip = chipBtn.closest('.filter-chip, .chip');
        if (chip) {
          chip.style.display = 'none';
          toast('Filter Cleared', 'Query parameter removed from statement view', 'info');
        }
        return;
      }

      // Collapsible Tree Rows (Trial Balance)
      const treeToggle = e.target.closest('.tree-toggle-icon, .chev');
      if (treeToggle) {
        const isOpen = treeToggle.textContent.trim() === '▾';
        treeToggle.textContent = isOpen ? '▸' : '▾';
        const lvl = parseInt(treeToggle.dataset.level || '0', 10);
        let nextRow = treeToggle.closest('tr')?.nextElementSibling;
        while (nextRow) {
          const lvlEl = nextRow.querySelector('[data-lvl]');
          const rLvl = lvlEl ? parseInt(lvlEl.dataset.lvl, 10) : 99;
          if (rLvl <= lvl) break;
          nextRow.style.display = isOpen ? 'none' : '';
          nextRow = nextRow.nextElementSibling;
        }
        return;
      }

      // Modal / Drawer Openers
      const op = e.target.closest('[data-open]');
      if (op) {
        e.preventDefault();
        const id = op.dataset.open;
        const target = document.getElementById(id);
        if (target) {
          document.getElementById('overlayScrim')?.classList.add('open');
          target.classList.add('open', 'on');
        }
        return;
      }

      // Closers
      if (e.target.closest('[data-close]')) {
        e.preventDefault();
        closeAll();
        return;
      }

      // Toasts
      const toastTrigger = e.target.closest('[data-toast]');
      if (toastTrigger) {
        e.preventDefault();
        const parts = toastTrigger.dataset.toast.split('|');
        toast(parts[0], parts[1] || '', parts[2] || 'info');
        if (toastTrigger.dataset.closeAfter !== undefined) {
          closeAll();
        }
      }
    });

    // Chart legend chip toggles (clickable dataset visibility)
    document.querySelectorAll('.chart-legend-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const entry = chartRegistry.find(c => c.canvasId === chip.dataset.chart);
        if (!entry) return;
        const dsIndex = parseInt(chip.dataset.datasetIndex, 10);
        const visible = entry.chart.isDatasetVisible(dsIndex);
        entry.chart.setDatasetVisibility(dsIndex, !visible);
        entry.chart.update();
        chip.classList.toggle('muted', visible);
      });
    });

    // Clickable KPI tiles that scroll to a related card and flash its chart segment
    document.querySelectorAll('[data-scroll-to]').forEach(tile => {
      tile.addEventListener('click', () => {
        const target = document.getElementById(tile.dataset.scrollTo);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.style.transition = 'box-shadow 0.3s ease';
          target.style.boxShadow = '0 0 0 3px var(--brand-glow)';
          setTimeout(() => { target.style.boxShadow = ''; }, 1600);
        }

        const flash = tile.dataset.flashChart;
        if (flash) {
          const [canvasId, segIndexRaw] = flash.split(':');
          const segIndex = parseInt(segIndexRaw, 10);
          const entry = chartRegistry.find(c => c.canvasId === canvasId);
          if (entry) {
            setTimeout(() => {
              const pos = arcTooltipPos(entry.chart, 0, segIndex);
              entry.chart.setActiveElements([{ datasetIndex: 0, index: segIndex }]);
              entry.chart.tooltip.setActiveElements([{ datasetIndex: 0, index: segIndex }], pos);
              entry.chart.update();
              setTimeout(() => {
                entry.chart.setActiveElements([]);
                entry.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                entry.chart.update();
              }, 1500);
            }, 350);
          }
        }
      });
    });

    // Sync button: spin + simulated refresh + toast with live timestamp
    document.getElementById('syncBtn')?.addEventListener('click', function () {
      if (this.classList.contains('is-syncing')) return;
      this.classList.add('is-syncing');
      this.disabled = true;
      setTimeout(() => {
        this.classList.remove('is-syncing');
        this.disabled = false;
        const stamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        toast('Ledger Synchronized', `Real-time ledger entries re-polled at ${stamp}.`, 'success');
      }, 900);
    });

    // Scrim click closes
    document.getElementById('overlayScrim')?.addEventListener('click', closeAll);

    // Global Hotkeys
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmdk();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        appEl.classList.toggle('nav-collapsed');
      }
      if (e.key === 'Escape') {
        closeAll();
      }

      // Command palette keyboard navigation
      if (document.getElementById('cmdkModal')?.classList.contains('open')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveCmdkFocus(1); }
        if (e.key === 'ArrowUp') { e.preventDefault(); moveCmdkFocus(-1); }
        if (e.key === 'Enter') { e.preventDefault(); activateCmdkFocused(); }
      }
    });

    initSorting();
    initFilter();
    initCharts();
    initCountUps();
    initTableStagger();
    initScrollReveal();
    initLandingInteractions();

    // Sidebar nav items cascade in on load. The class is left in place —
    // the animation's `both` fill settles on the element's normal state, and
    // the active item's ::before fires its own animationend, so cleaning up
    // on that event would cut this animation short.
    document.querySelectorAll('.sidebar-nav-scroll .nav-item-link').forEach((el, i) => {
      el.style.animationDelay = `${60 + i * 30}ms`;
      el.classList.add('nav-in');
    });
  }

  // Boot
  runEntranceProgress();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildStudioShell();
      wireInteractions();
    });
  } else {
    buildStudioShell();
    wireInteractions();
  }
})();
