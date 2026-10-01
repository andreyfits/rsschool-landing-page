import { lockScroll, unlockScroll } from './scroll-lock.js';

const INFO_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 7.66663V11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 5.00667L8.00667 4.99926" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.99967 14.6667C11.6816 14.6667 14.6663 11.6819 14.6663 8.00004C14.6663 4.31814 11.6816 1.33337 7.99967 1.33337C4.31778 1.33337 1.33301 4.31814 1.33301 8.00004C1.33301 11.6819 4.31778 14.6667 7.99967 14.6667Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const ALERT_TEXT = 'The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.';

/* Small DOM factory: el('p.card__name', { text: 'x' }) or el('div', {...}, children) */
function el(tagSpec, props = {}, children = []) {
  const [tag, ...classes] = tagSpec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const [key, value] of Object.entries(props)) {
    if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else node[key] = value;
  }
  node.append(...children);
  return node;
}

function optionButton(key, label, onClick) {
  const btn = el('button.option', { type: 'button' }, [
    el('span.option__key', { text: key.toUpperCase() }),
    el('span.option__value', { text: label }),
  ]);
  btn.dataset.key = key;
  btn.addEventListener('click', onClick);
  return btn;
}

/* Product modal: lazy-built overlay, option pills, live price */
export function createModal() {
  let overlay = null;
  let refs = null;
  let currentProduct = null;
  let selectedSize = 's';
  let selectedAdditives = new Set();

  const updateTotal = () => {
    if (!currentProduct) return;
    const sizeAdd = Number(currentProduct.sizes[selectedSize]?.price ?? 0);
    const addsTotal = [...selectedAdditives]
      .reduce((sum, i) => sum + Number(currentProduct.additives[i].price), 0);
    refs.totalPrice.textContent = `$${(Number(currentProduct.price) + sizeAdd + addsTotal).toFixed(2)}`;
  };

  const close = () => {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('modal-open');
    unlockScroll();
  };

  function build() {
    overlay = el('div.modal-overlay', { hidden: true });

    const modal = el('div.modal', { role: 'dialog' });
    modal.setAttribute('aria-modal', 'true');

    const img = el('img', { alt: '' });
    const imgWrap = el('div.modal__image', {}, [img]);

    const name = el('h3.modal__name');
    const desc = el('p.modal__description');
    const sizes = el('div.modal__options');
    const adds = el('div.modal__options');
    const totalPrice = el('span.modal__price');
    const total = el('div.modal__total', {}, [
      el('span', { text: 'Total:' }),
      totalPrice,
    ]);
    const alert = el('p.modal__alert', { html: `${INFO_ICON_SVG}<span>${ALERT_TEXT}</span>` });
    const closeBtn = el('button.modal__close', { type: 'button', text: 'Close' });

    const content = el('div.modal__content', {}, [
      name,
      desc,
      el('p.modal__label', { text: 'Size' }),
      sizes,
      el('p.modal__label', { text: 'Additives' }),
      adds,
      total,
      alert,
      closeBtn,
    ]);

    modal.append(imgWrap, content);
    overlay.append(modal);
    document.body.append(overlay);

    refs = { img, name, desc, sizes, adds, totalPrice };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (!modal.contains(e.target)) close();
    });
    document.addEventListener('keydown', ({ key }) => {
      if (key === 'Escape' && !overlay.hidden) close();
    });
  }

  function fill(product) {
    currentProduct = product;
    selectedSize = 's';
    selectedAdditives = new Set();

    refs.img.src = product.image;
    refs.img.alt = product.name;
    refs.name.textContent = product.name;
    refs.desc.textContent = product.description;

    refs.sizes.replaceChildren(
      ...Object.entries(product.sizes).map(([key, { size }]) => {
        const btn = optionButton(key, size, () => {
          selectedSize = key;
          refs.sizes.querySelectorAll('.option').forEach((o) => {
            o.classList.toggle('option--active', o.dataset.key === key);
          });
          updateTotal();
        });
        btn.classList.toggle('option--active', key === selectedSize);
        return btn;
      }),
    );

    refs.adds.replaceChildren(
      ...product.additives.map(({ name: additiveName }, i) =>
        optionButton(String(i + 1), additiveName, (e) => {
          const active = e.currentTarget.classList.toggle('option--active');
          if (active) selectedAdditives.add(i);
          else selectedAdditives.delete(i);
          updateTotal();
        }),
      ),
    );

    updateTotal();
  }

  return {
    open(product) {
      if (!overlay) build();
      fill(product);
      overlay.hidden = false;
      document.body.classList.add('modal-open');
      lockScroll();
    },
    close,
  };
}
