import domReady from '@wordpress/dom-ready';
import { blocks } from './views/list';

class Editor {
  constructor() {
    this.blocks = {};
    this.init();
  }

  init() {
    const { getBlocks: getBlockList } = wp.data.select('core/editor');
    let blockList = getBlockList().map((block) => block.clientId);
    wp.data.subscribe(() => {
      const newBlockList = getBlockList().map((block) => block.clientId);
      const blockListChanged = newBlockList.length !== blockList.length;
      if (!blockListChanged) return;

      if (newBlockList > blockList) {
        /* Add blocks */
        const added = newBlockList.filter((x) => !blockList.includes(x));
        added.forEach((id) => {
          const blockElementSelector = `[data-block-id="block_${id}"]`;
          const interval = setInterval(() => {
            const element = document.querySelector(blockElementSelector);
            if (element) {
              const name = element.getAttribute('data-block');
              const blockClass = new blocks[name](element);
              this.blocks[id] = {
                name,
                element,
                blockClass,
              };
              clearInterval(interval);
            }
          }, 100);
        });
      } else if (newBlockList < blockList) {
        /* Remove blocks */
        const removed = blockList.filter((x) => !newBlockList.includes(x));
        removed.forEach((id) => {
          this.blocks[id].blockClass.destroy();
          delete this.blocks[id];
        });
      }
      blockList = newBlockList;
    });
  }
}

domReady(() => {
  new Editor();
});
