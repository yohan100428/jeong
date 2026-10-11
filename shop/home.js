// 스토어 홈: 카테고리 카드와 추천 상품을 products.js 데이터로 그림 (나머지 섹션은 index.html 에 정적으로 있음)
document.getElementById('cats').innerHTML = PRODUCT_CATEGORIES.map((c, i) => {
  const n = PRODUCTS.filter(p => p.category === c.id).length;
  return `
  <li><a class="cat" href="catalog.html?cat=${c.id}">
    <span class="cat-no">SYS / ${String(i + 1).padStart(2, '0')}</span>
    ${categoryIcon(c.id)}
    <b>${esc(c.name)}</b>
    <span class="cat-count">${n ? `${n} item${n > 1 ? 's' : ''}` : 'No items yet'}</span>
    <span class="cat-arrow" aria-hidden="true">→</span>
  </a></li>`;
}).join('');

const featured = PRODUCTS.filter(p => p.featured).slice(0, 6);
document.getElementById('featured').innerHTML = featured.map(productCard).join('')
  || '<li class="empty">No featured products yet.</li>';
