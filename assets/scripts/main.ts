class App {
  init: boolean;

  constructor() {
    this.init = true;
    console.log('app');
  }
}

const ready = () => {
  new App();
};

document.addEventListener('DOMContentLoaded', ready);
