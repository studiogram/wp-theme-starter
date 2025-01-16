export default class View {
  constructor(el) {
    this.el = el;
    this.events = [];
    this.elements();
    this.events();
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
    this.eventList.push({
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
    for (const event of this.eventList) {
      if (event.dom) event.target.removeEventListener(event.name, event.fn);
      else event.target.off(event.name, event.fn);
      event.destroyed = true;
    }
  }
}
