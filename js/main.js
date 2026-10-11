const ROOT = new URL('..', document.currentScript.src); // 사이트 루트 (js/ 의 상위)
const profile = document.querySelector('.profile-btn');

// 햄버거 서랍
const drawer = document.getElementById('drawer');
document.querySelector('.menu-btn').addEventListener('click', () => drawer.showModal());
drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('a, .close')) drawer.close(); });

// 언어 전환: 기본 영어. data-ko 속성이 있는 요소만 한국어로 바뀜
const lang = document.querySelector('.lang');
function setLang(l) {
  document.documentElement.lang = l;
  document.querySelectorAll('[data-ko]').forEach(el => {
    el.dataset.en ??= el.textContent;
    el.textContent = l === 'ko' ? el.dataset.ko : el.dataset.en;
  });
  lang.value = l;
  try { localStorage.setItem('lang', l); } catch {}
}
lang.addEventListener('change', () => setLang(lang.value));
try { if (localStorage.getItem('lang') === 'ko') setLang('ko'); } catch {}

// ---- 로그인 (모의) ----
// ponytail: 아무 값이나 통과하는 가짜 로그인, 이름만 localStorage 에 저장. 실제 인증 붙일 때 auth 만 서버 세션으로 교체.
const auth = {
  get user() { try { return JSON.parse(localStorage.getItem('jeong-user')); } catch { return null; } },
  login(name) { try { localStorage.setItem('jeong-user', JSON.stringify({ name })); } catch {} },
  logout() { try { localStorage.removeItem('jeong-user'); } catch {} },
};

// 프로필 팝업 (native popover: 바깥 클릭·Esc 로 닫힘)
document.body.insertAdjacentHTML('beforeend', `
  <div id="profile-pop" class="profile-pop" popover role="dialog" aria-label="Account">
    <p class="pop-name"></p><p class="pop-sub"></p><div class="pop-action"></div>
  </div>`);
const pop = document.getElementById('profile-pop');
profile.popoverTargetElement = pop;

function renderProfile() {
  const u = auth.user;
  profile.classList.toggle('signed-in', !!u);
  profile.setAttribute('aria-label', u ? `Profile (${u.name})` : 'Profile');
  pop.querySelector('.pop-name').textContent = u ? u.name : 'Sign in required';
  pop.querySelector('.pop-sub').textContent = u ? (window.adminMode?.isAdmin ? 'Administrator' : 'Member') : 'Sign in with your JEONG MOTORS account.';
  // 로그인 후 지금 보던 페이지로 돌아오도록 next 전달
  pop.querySelector('.pop-action').innerHTML = u
    ? '<button type="button" class="pop-btn" data-logout>Sign out</button>'
    : `<a class="pop-btn primary" href="${new URL('login.html', ROOT).href}?next=${encodeURIComponent(location.href)}">Sign in</a>`;
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
