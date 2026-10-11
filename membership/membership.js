// =====================================================================
// Membership 페이지 — UI 프로토타입 (결제·가입 처리 없음)
//
// 요금제 수정: 아래 PLANS 만 고치면 됨 (가격, 혜택, 버튼).
//   price / note 는 결제 주기(monthly, yearly)별 문구.
//   가격이 정해지면 price 에 '$9' 같은 값을 넣으면 됨.
//
// TODO(billing): 결제 연결 시
//   - cta.waitlist 버튼 -> 대기자 등록 API 또는 결제(Stripe 등) 체크아웃으로 교체
//   - 서버에서 구독 상태 확인 후 혜택 제공 (프론트 표시만으로 권한 주지 말 것)
// =====================================================================

const PLANS = [
  {
    no: 'PLAN 01',
    name: 'OPEN ACCESS',
    price: { monthly: 'FREE', yearly: 'FREE' },
    note: { monthly: 'Free forever', yearly: 'Free forever' },
    benefitsTitle: 'Included',
    benefits: [
      'Public research papers',
      'Open engineering documentation',
      'Selected 2D drawings',
      'Public development logs',
      'Community access (planned)',
    ],
    cta: { label: 'GET STARTED', href: '../research/index.html' }, // 무료 = 공개 자료로 바로 이동
  },
  {
    no: 'PLAN 02',
    name: 'GARAGE+',
    tag: 'FOR THE BUILDERS',
    featured: true,
    price: { monthly: 'COMING SOON', yearly: 'COMING SOON' },
    note: { monthly: 'Monthly price to be announced', yearly: 'Yearly price to be announced' },
    benefitsTitle: 'Proposed benefits', // 확정 전 — 실제 제공 약속 아님
    benefits: [
      'Extended 3D CAD library',
      'Premium engineering tools',
      'Advanced software features',
      'Downloadable project resources',
      'Exclusive engineering updates',
      'Future member benefits',
    ],
    cta: { label: 'JOIN WAITLIST', waitlist: true },
  },
];

const plansBox = document.getElementById('plans');
const billing = document.querySelector('.billing');
const period = () => billing.querySelector('input:checked').value;

plansBox.innerHTML = PLANS.map((p, i) => `
  <article class="plan${p.featured ? ' featured' : ''}">
    ${p.tag ? `<span class="plan-tag">${p.tag}</span>` : ''}
    <p class="plan-no">${p.no}</p>
    <h3>${p.name}</h3>
    <p class="plan-price" data-plan="${i}"></p>
    <p class="plan-note" data-plan="${i}"></p>
    <p class="plan-list-title">${p.benefitsTitle}</p>
    <ul>${p.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
    ${p.cta.href
      ? `<a class="plan-btn" href="${p.cta.href}">${p.cta.label}</a>`
      : `<button type="button" class="plan-btn" data-waitlist>${p.cta.label}</button>`}
    ${p.cta.waitlist ? '<p class="plan-msg" role="status" hidden>The waitlist is not open yet. This is a preview — nothing was submitted.</p>' : ''}
  </article>`).join('');

function renderPrices() {
  const per = period();
  plansBox.querySelectorAll('.plan-price').forEach(el => { el.textContent = PLANS[el.dataset.plan].price[per]; });
  plansBox.querySelectorAll('.plan-note').forEach(el => { el.textContent = PLANS[el.dataset.plan].note[per]; });
}
billing.addEventListener('change', renderPrices);
renderPrices();

// 프로토타입: 실제 등록 없음. 성공한 것처럼 보이지 않게 안내만 표시
plansBox.addEventListener('click', e => {
  const btn = e.target.closest('[data-waitlist]');
  if (btn) btn.parentElement.querySelector('.plan-msg').hidden = false;
});
