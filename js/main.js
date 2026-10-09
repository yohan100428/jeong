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
  pop.querySelector('.pop-sub').textContent = u ? (window.adminMode?.isAdmin ? 'Administrator' : '일반 사용자') : 'JEONG MOTORS 계정으로 로그인하세요.';
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
