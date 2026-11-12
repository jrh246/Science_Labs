import './completion-status.css';

export function createCompletionStatus(app, getState, {
  selector, readyLabel, savedLabel, id = 'lab-complete-feedback',
  statusClass = 'lab-completion-status', errorClass = 'lab-save-error'
}) {
  let text = '';
  let failed = false;
  let announcement = 0;

  function currentText() {
    return text || (getState().complete && !failed
      ? '✓ Saved. Your completed work is saved on this device.' : '');
  }

  function refresh() {
    const status = app.querySelector(`#${id}`);
    if (status) {
      const value = currentText();
      if (status.textContent !== value) status.textContent = value;
      status.classList.toggle(errorClass, failed);
    }
    const button = app.querySelector(selector);
    if (button) button.textContent = getState().complete && !failed ? savedLabel : readyLabel;
  }

  return {
    html() {
      return `<p id="${id}" class="${statusClass}${failed ? ' ' + errorClass : ''}" role="status" aria-live="polite" aria-atomic="true">${currentText()}</p>`;
    },
    refresh,
    persisted(success) {
      announcement++;
      if (!success) text = 'Your work could not be saved on this device. Download your report to keep a copy.';
      else if (failed) text = '';
      failed = !success;
      refresh();
    },
    invalidate() {
      announcement++;
      getState().complete = false;
      text = '';
      failed = false;
      refresh();
    },
    complete(save) {
      const state = getState();
      const previous = state.complete;
      state.complete = true;
      const stored = save();
      if (!stored) state.complete = previous;
      failed = !stored;
      text = stored
        ? '✓ Saved just now. Your completed work is saved on this device.'
        : 'Your work could not be saved on this device. Download your report to keep a copy.';
      refresh();

      // Repeated clicks must produce a fresh announcement in the existing live region.
      const status = app.querySelector(`#${id}`);
      const current = ++announcement;
      if (status) {
        status.textContent = '';
        requestAnimationFrame(() => {
          if (current !== announcement || !status.isConnected) return;
          status.textContent = text;
          status.scrollIntoView({ block: 'nearest', behavior: 'instant' });
          if (stored && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            status.getAnimations().forEach(animation => animation.cancel());
            status.animate([{ backgroundColor: '#dcefe3' }, { backgroundColor: 'transparent' }], { duration: 900 });
          }
        });
      }
      return stored;
    }
  };
}
