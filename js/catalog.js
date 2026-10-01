import { createModal } from './modal.js';

const PRODUCTS_URL = 'js/products.json';
const INITIAL_MOBILE_CARDS = 4;

function createCard(product, index) {
  const card = document.createElement('li');
  card.className = 'card';
  card.dataset.category = product.category;
  card.dataset.index = index;

  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  img.loading = 'lazy';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card__image';
  imgWrap.append(img);

  const name = document.createElement('h2');
  name.className = 'card__name';
  name.textContent = product.name;

  const desc = document.createElement('p');
  desc.className = 'card__description';
  desc.textContent = product.description;

  const price = document.createElement('p');
  price.className = 'card__price';
  price.textContent = `$${Number(product.price).toFixed(2)}`;

  const body = document.createElement('div');
  body.className = 'card__body';
  body.append(name, desc, price);

  card.append(imgWrap, body);
  return card;
}

/* Catalog (menu page): fetch products, category tabs, mobile "show more" */
export async function initCatalog(mqMobile) {
  const grid = document.querySelector('.menu__grid');
  const tabsWrap = document.querySelector('.menu__tabs');
  const moreBtn = document.querySelector('.menu__more');
  if (!grid || !tabsWrap) return;

  const modal = createModal();
  let products = [];
  let activeCategory = tabsWrap.querySelector('.tab')?.dataset.category ?? 'coffee';
  let expanded = false;

  const visibleLimit = () => (mqMobile.matches ? INITIAL_MOBILE_CARDS : Infinity);

  function updateMoreButton(total) {
    if (!moreBtn) return;
    moreBtn.hidden = !(mqMobile.matches && grid.children.length < total);
  }

  function renderCategory() {
    const items = products.filter((p) => p.category === activeCategory);
    const limit = expanded ? items.length : Math.min(items.length, visibleLimit());
    grid.replaceChildren(
      ...items.slice(0, limit).map((p) => createCard(p, products.indexOf(p))),
    );
    updateMoreButton(items.length);
  }

  tabsWrap.addEventListener('click', ({ target }) => {
    const tab = target.closest('.tab');
    if (!tab || tab.classList.contains('tab--active')) return;

    tabsWrap.querySelectorAll('.tab').forEach((t) => {
      t.classList.remove('tab--active');
      t.setAttribute('aria-pressed', 'false');
    });
    tab.classList.add('tab--active');
    tab.setAttribute('aria-pressed', 'true');

    activeCategory = tab.dataset.category;
    expanded = false;
    renderCategory();
  });

  moreBtn?.addEventListener('click', () => {
    expanded = true;
    renderCategory();
  });

  mqMobile.addEventListener('change', () => {
    if (products.length) renderCategory();
  });

  grid.addEventListener('click', ({ target }) => {
    const card = target.closest('.card');
    const product = card && products[Number(card.dataset.index)];
    if (product) modal.open(product);
  });

  try {
    const res = await fetch(PRODUCTS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    products = await res.json();
    renderCategory();
  } catch (err) {
    grid.innerHTML = '<li class="menu__error">Could not load the menu. Please try again later.</li>';
    if (moreBtn) moreBtn.hidden = true;
    console.error('Failed to load products:', err);
  }
}
