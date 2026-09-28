/* Counted scroll lock — burger menu and modal can hold it at once */
let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  document.body.classList.add('no-scroll');
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.body.classList.remove('no-scroll');
  }
}
