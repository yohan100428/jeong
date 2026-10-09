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
