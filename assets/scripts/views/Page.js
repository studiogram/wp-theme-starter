import { Renderer } from '@unseenco/taxi';
import { views, blocks } from './list';

export default class Page extends Renderer {
  initialLoad() {
    console.log('initialLoad');
    this.onEnter();
    this.onEnterCompleted();
  }

  onEnter() {
    this.page = document.querySelector('[data-taxi]').lastElementChild;
    this.views = [];
    this.blocks = [];
    this.elements();
    this.events();
    this.initViews();
  }

  initViews() {
    for (const view in views) {
      const foundViews = this.page.querySelectorAll(`[data-view="${view}"]`);
      foundViews.forEach((foundView) => {
        new views[view](foundView);
      });
    }
    for (const block in blocks) {
      const foundBlocks = this.page.querySelectorAll(`[data-block="${block}"]`);
      foundBlocks.forEach((foundBlock) => {
        new blocks[block](foundBlock);
      });
    }
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
