// =====================================================================
// 개발용 관리자 모드 (임시 기능 — 나중에 통째로 삭제)
// 프론트엔드 화면 개발용 모의 상태. 실제 권한 없음, 서버/데이터 접근 변경 없음.
//
// 삭제 방법:
//   1) 이 파일 삭제
//   2) 각 페이지의 <script src=".../js/dev-admin.js"></script> 한 줄 삭제
//      (index.html, login.html, research/index.html, research/doc.html, research/upload.html)
//   삭제 후 research/upload.html 폼은 자동으로 숨겨짐 (실제 인증 붙이면 upload.js 의 applyGate 교체)
//   main.js 는 window.adminMode 가 없으면 알아서 무시하므로 수정 불필요.
//
// 실제 인증 도입 시: adminMode.isAdmin 을 서버 권한 확인 결과로 교체.
// 상태 변경 알림: window.addEventListener('adminchange', e => e.detail.isAdmin)
// main.js 다음에 로드해야 함 (lang, profile, drawer 사용).
// =====================================================================

document.head.insertAdjacentHTML('beforeend', `<style>
.admin-switch { display: flex; align-items: center; gap: 8px; padding: 6px 4px; background: none; border: 0; color: var(--muted); font: inherit; font-size: .8rem; cursor: pointer; }
.admin-switch .track { position: relative; width: 36px; height: 20px; border-radius: 999px; background: #3A3640; transition: background .2s; }
.admin-switch .thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s; }
.admin-switch[aria-checked="true"] { color: var(--fg); }
.admin-switch[aria-checked="true"] .track { background: var(--accent); box-shadow: inset 0 0 0 1px var(--accent-hi); }
.admin-switch[aria-checked="true"] .thumb { transform: translateX(16px); }
.admin-badge { padding: 2px 8px; border: 1px solid var(--accent-hi); border-radius: 999px; color: var(--accent-hi); font-size: .72rem; white-space: nowrap; }
body.admin .profile-btn { color: var(--accent-hi); }
#drawer .admin-menu { margin-top: 16px; padding-top: 8px; border-top: 1px solid var(--line); }
#drawer .drawer-label { margin: 8px 28px; font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-hi); }
@media (max-width: 600px) {
  header .wrap { padding-inline: 12px; }
  .logo { font-size: 1.1rem; letter-spacing: .2em; }
  .actions { gap: 4px; }
  .actions .icon-btn { padding: 4px; }
  .lang { padding: 4px 2px; }
  .admin-badge, .admin-switch .label { display: none; }
  .admin-switch .track { width: 30px; height: 18px; }
  .admin-switch .thumb { width: 14px; height: 14px; }
  .admin-switch[aria-checked="true"] .thumb { transform: translateX(12px); }
}
</style>`);

{ // 블록으로 감쌈: render 등 이름이 research.js/doc.js 전역과 충돌하지 않게
  const adminMode = window.adminMode = { isAdmin: false, setIsAdmin() {} };
  const KEY = 'jeong-admin';
  try { adminMode.isAdmin = localStorage.getItem(KEY) === '1'; } catch {}

  const actions = document.querySelector('.actions');
  profile.insertAdjacentHTML('beforebegin', '<span class="admin-badge" hidden>Administrator</span>');
  lang.insertAdjacentHTML('beforebegin', `
    <button type="button" class="admin-switch" role="switch" aria-checked="false" aria-label="관리자 모드 (개발용)">
      <span class="track" aria-hidden="true"><span class="thumb"></span></span><span class="label" aria-hidden="true">Admin</span>
    </button>`);

  // 관리자 메뉴: 기능 생기면 soon() 을 <a href> 로 교체
  const soon = name => `<span class="soon" aria-disabled="true">${name} <small>Coming Soon</small></span>`;
  drawer.insertAdjacentHTML('beforeend', `
    <nav class="admin-menu" aria-label="관리자 메뉴" hidden>
      <p class="drawer-label">Admin</p>
      ${soon('Admin Dashboard')}${soon('Research Management')}<a href="${new URL('research/upload.html', ROOT).href}">Upload Research</a>${soon('Content Management')}
    </nav>`);

  const badge = actions.querySelector('.admin-badge');
  const toggle = actions.querySelector('.admin-switch');
  const menu = drawer.querySelector('.admin-menu');

  const render = () => {
    const on = adminMode.isAdmin;
    document.body.classList.toggle('admin', on);
    toggle.setAttribute('aria-checked', on);
    badge.hidden = menu.hidden = !on;
  };
  adminMode.setIsAdmin = v => {
    adminMode.isAdmin = v;
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch {}
    render();
    dispatchEvent(new CustomEvent('adminchange', { detail: { isAdmin: v } }));
  };
  toggle.addEventListener('click', () => adminMode.setIsAdmin(!adminMode.isAdmin));
  addEventListener('storage', e => { if (e.key === KEY) { adminMode.isAdmin = e.newValue === '1'; render(); } }); // 다른 탭과 동기화
  render();
}
