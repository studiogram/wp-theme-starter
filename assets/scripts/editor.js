import domReady from '@wordpress/dom-ready';
import views from './views/list';

class Editor {
  constructor() {
    console.log('Editor');
    this.test();
    // this.init();
  }

  test() {
    const { getBlocks: getBlockList } = wp.data.select('core/editor');
    let blockList = getBlockList().map((block) => block.clientId);
    wp.data.subscribe(() => {
      const newBlockList = getBlockList().map((block) => block.clientId);
      const blockListChanged = newBlockList.length !== blockList.length;
      if (!blockListChanged) {
        return;
      }
      if (newBlockList > blockList) {
        const added = newBlockList.filter((x) => !blockList.includes(x));
        added.forEach((id) => {
          const blockElementSelector = `[data-block-id="block_${id}"]`;
          const interval = setInterval(() => {
            const element = document.querySelector(blockElementSelector);
            if (element) {
              console.log('Element found for new block:', element);
              clearInterval(interval);
            }
          }, 100);
        });
      } else if (newBlockList < blockList) {
        const removed = blockList.filter((x) => !newBlockList.includes(x));
        removed.forEach((id) => {
          console.log('removed id: ', id);
        });
      }
      blockList = newBlockList;
    });
  }

  async init() {
    await this.whenEditorIsReady();
    console.log('is ready');
    this.initViews();
  }

  async whenEditorIsReady() {
    return new Promise((resolve) => {
      const { select, subscribe } = wp.data;
      const unsubscribe = subscribe(() => {
        if (
          select('core/editor').isCleanNewPost() ||
          select('core/block-editor').getBlockCount() > 0
        ) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  initViews() {
    for (const view in views) {
      const foundViews = document.querySelectorAll(`[data-view="${view}"]`);
      foundViews.forEach((foundView) => {
        new views[view](foundView);
      });
    }
  }
}

domReady(() => {
  new Editor();
});
