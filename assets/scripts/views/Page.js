import { Renderer } from '@unseenco/taxi';

export default class Page extends Renderer {
  initialLoad() {
    this.onEnter();
    this.onEnterCompleted();
  }

  onEnter() {
    this.views = [];
    this.elements();
    this.events();
  }

  elements() {}

  events() {}

  onEnterCompleted() {
    console.log('default onEnterCompleted');
  }

  onLeave() {
    console.log('default onLeave');
  }

  onLeaveCompleted() {
    console.log('default onLeaveCompleted');
  }
}
