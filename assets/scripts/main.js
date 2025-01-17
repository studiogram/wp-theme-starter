import { Core } from '@unseenco/taxi';
import Page from './views/Page';
import Loader from './transitions/Loader';
import Special from './transitions/Special';
import FrontPage from '../../views/templates/front-page/scripts';

class Main {
  constructor() {
    this.initTaxi();
    this.events();
    // this.initTaxi().then(this.start.bind(this));
    // console.log('App');
    // const blocks = document.querySelectorAll('[data-block]');
    // blocks.forEach((block) => {
    //   console.log(block.getAttribute('data-block'));
    // });

    // this.taxi.addRoute('', '/contact', 'special');
  }

  initTaxi() {
    this.taxi = new Core({
      renderers: {
        default: Page,
        frontPage: FrontPage,
      },
      transitions: {
        default: Loader,
        special: Special,
      },
      links:
        'a:not([target]):not([href^=\\#]):not([data-taxi-ignore]):not([lang])',
    });
  }

  events() {
    this.taxi.on('NAVIGATE_IN', ({ to, trigger }) => {
      //console.log('to: ', to);
      document.title = to.page.title;
      document.body.classList = to.page.body.classList;
    });
  }
}

const ready = () => {
  new Main();
};

document.addEventListener('DOMContentLoaded', ready);
