class Editor {
  constructor() {
    console.log('editor');
  }
}

const ready = () => {
  new Editor();
};

document.addEventListener('DOMContentLoaded', ready);
