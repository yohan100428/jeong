// 모바일 메뉴 토글 + 현재 페이지 표시
const nav = document.querySelector('nav');
document.querySelector('.menu-btn')?.addEventListener('click', () => nav.classList.toggle('open'));
const here = location.pathname.split('/').pop() || 'index.html';
nav.querySelectorAll('a').forEach(a => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
