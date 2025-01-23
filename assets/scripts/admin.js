class Admin {
  constructor() {
    console.log('admin');
  }
}

const ready = () => {
  new Admin();
};

document.addEventListener('DOMContentLoaded', ready);
