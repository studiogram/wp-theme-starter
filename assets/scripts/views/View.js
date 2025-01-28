export default class View {
  constructor(el, editor = false) {
    this.el = el;
    this.eventsList = [];
    this.elements();
    this.events();
    if (editor) this.observeEditor();
  }

  observeEditor() {
    const $ = jQuery.noConflict();
    $(document).on(
      'change',
      '.acf-field input, .acf-field textarea, .acf-field select',
      this.updateBlock.bind(this)
    );
  }

  updateBlock() {
    const { select } = wp.data;
    const selectedBlockId =
      select('core/block-editor').getSelectedBlockClientId();
    const blockId = this.el.getAttribute('data-block-id').replace('block_', '');
    if (selectedBlockId === blockId) {
      this.update();
    }
  }

  elements() {}

  events() {}

  addEvent({ target, name, callback, dom = true, bind = this } = {}) {
    if (
      !target ||
      !name ||
      !callback ||
      (dom && !target.addEventListener) ||
      (!dom && !target.on)
    )
      return;

    const fn = bind ? callback.bind(bind) : callback;
    this.eventsList.push({
      target,
      name,
      fn,
      dom,
      destroyed: false,
    });
    if (dom) target.addEventListener(name, fn);
    else target.on(name, fn);
  }

  resize() {}

  update() {}

  destroy() {
    for (const event of this.eventsList) {
      if (event.dom) event.target.removeEventListener(event.name, event.fn);
      else event.target.off(event.name, event.fn);
      event.destroyed = true;
    }
  }
}
