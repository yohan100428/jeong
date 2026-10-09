const ROOT = new URL('..', document.currentScript.src); // 사이트 루트 (js/ 의 상위)
const profile = document.querySelector('.profile-btn');

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

// ---- 로그인 (모의) ----
// ponytail: 아무 값이나 통과하는 가짜 로그인, 이름만 localStorage 에 저장. 실제 인증 붙일 때 auth 만 서버 세션으로 교체.
const auth = {
  get user() { try { return JSON.parse(localStorage.getItem('jeong-user')); } catch { return null; } },
  login(name) { try { localStorage.setItem('jeong-user', JSON.stringify({ name })); } catch {} },
  logout() { try { localStorage.removeItem('jeong-user'); } catch {} },
};

// 프로필 팝업 (native popover: 바깥 클릭·Esc 로 닫힘)
document.body.insertAdjacentHTML('beforeend', `
  <div id="profile-pop" class="profile-pop" popover role="dialog" aria-label="계정">
    <p class="pop-name"></p><p class="pop-sub"></p><div class="pop-action"></div>
  </div>`);
const pop = document.getElementById('profile-pop');
profile.popoverTargetElement = pop;

function renderProfile() {
  const u = auth.user;
  profile.classList.toggle('signed-in', !!u);
  profile.setAttribute('aria-label', u ? `프로필 (${u.name})` : '프로필');
  pop.querySelector('.pop-name').textContent = u ? u.name : '로그인이 필요합니다';
  pop.querySelector('.pop-sub').textContent = u ? (adminMode.isAdmin ? 'Administrator' : '일반 사용자') : 'JEONG MOTORS 계정으로 로그인하세요.';
  // 로그인 후 지금 보던 페이지로 돌아오도록 next 전달
  pop.querySelector('.pop-action').innerHTML = u
    ? '<button type="button" class="pop-btn" data-logout>로그아웃</button>'
    : `<a class="pop-btn primary" href="${new URL('login.html', ROOT).href}?next=${encodeURIComponent(location.href)}">로그인</a>`;
}
pop.addEventListener('beforetoggle', e => {
  profile.setAttribute('aria-expanded', e.newState === 'open');
  if (e.newState === 'open') renderProfile();
});
pop.addEventListener('click', e => {
  if (e.target.closest('[data-logout]')) { auth.logout(); renderProfile(); pop.hidePopover(); }
});
addEventListener('storage', e => { if (e.key === 'jeong-user') renderProfile(); });
renderProfile();
