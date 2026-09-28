/* ============================================================
   Coffee House — interactivity entry point
   burger menu, slider, catalog tabs + show more, product modal
   ============================================================ */
import { initBurgerMenu } from './burger.js';
import { initSlider } from './slider.js';
import { initCatalog } from './catalog.js';

const mqMobile = window.matchMedia('(max-width: 768px)');

initBurgerMenu(mqMobile);
initSlider();
initCatalog(mqMobile);
