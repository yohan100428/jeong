// 햄버거 서랍
const drawer = document.getElementById('drawer');
document.querySelector('.menu-btn').addEventListener('click', () => drawer.showModal());
drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('a, .close')) drawer.close(); });

// 언어 전환: data-en 속성 있는 요소만 바꿈
const lang = document.querySelector('.lang');
function setLang(l) {
  document.documentElement.lang = l;
  document.querySelectorAll('[data-en]').forEach(el => {
    el.dataset.ko ??= el.textContent;
    el.textContent = l === 'en' ? el.dataset.en : el.dataset.ko;
  });
  lang.value = l;
  try { localStorage.setItem('lang', l); } catch {}
}
lang.addEventListener('change', () => setLang(lang.value));
try { if (localStorage.getItem('lang') === 'en') setLang('en'); } catch {}

// ---- 개발용 관리자 모드 (프론트엔드 모의 상태, 실제 권한 없음) ----
// 로컬(file://, localhost)에서만 토글·관리자 메뉴가 생김. 공개 사이트에는 아예 안 만들어짐.
// 실제 인증 도입 시 adminMode.isAdmin 을 서버 세션/권한 확인 결과로 교체.
// 상태 변경 알림: window.addEventListener('adminchange', e => e.detail.isAdmin)
const IS_DEV = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
const adminMode = { isAdmin: false, setIsAdmin() {} };

if (IS_DEV) {
  const KEY = 'jeong-admin';
  try { adminMode.isAdmin = localStorage.getItem(KEY) === '1'; } catch {}

  const actions = document.querySelector('.actions');
  const profile = actions.querySelector('a.icon-btn');
  profile.insertAdjacentHTML('beforebegin', '<span class="admin-badge" hidden>Administrator</span>');
  actions.insertAdjacentHTML('beforeend', `
    <button type="button" class="admin-switch" role="switch" aria-checked="false" aria-label="관리자 모드 (개발용)">
      <span class="track" aria-hidden="true"><span class="thumb"></span></span><span class="label" aria-hidden="true">Admin</span>
    </button>`);

  // 관리자 메뉴: 기능 생기면 span 을 <a href> 로 교체 (Upload Research 는 연구자료 업로드와 연결 예정)
  const soon = name => `<span class="soon" aria-disabled="true">${name} <small>Coming Soon</small></span>`;
  drawer.insertAdjacentHTML('beforeend', `
    <nav class="admin-menu" aria-label="관리자 메뉴" hidden>
      <p class="drawer-label">Admin</p>
      ${['Admin Dashboard', 'Research Management', 'Upload Research', 'Content Management'].map(soon).join('')}
    </nav>`);

  const badge = actions.querySelector('.admin-badge');
  const toggle = actions.querySelector('.admin-switch');
  const menu = drawer.querySelector('.admin-menu');

  const render = () => {
    const on = adminMode.isAdmin;
    document.body.classList.toggle('admin', on);
    toggle.setAttribute('aria-checked', on);
    badge.hidden = menu.hidden = !on;
    profile.setAttribute('aria-label', on ? '프로필 (Administrator)' : '프로필');
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
