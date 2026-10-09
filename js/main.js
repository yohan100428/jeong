// 모바일 메뉴 열기/닫기
const nav = document.querySelector('nav');
const btn = document.querySelector('.menu-btn');
btn.addEventListener('click', () => btn.setAttribute('aria-expanded', nav.classList.toggle('open')));
nav.addEventListener('click', () => { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); });
