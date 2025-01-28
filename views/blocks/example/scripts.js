import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import View from '../../../assets/scripts/views/View';

export class BlockExemple extends View {
  constructor(el, editor = false) {
    super(el, editor);
    this.el = el;
    this.elems();
    this.initSlider();
  }

  elems() {
    this.next = this.el.querySelector('.next');
    this.prev = this.el.querySelector('.prev');
    this.wrapper = this.el.querySelector('.swiper-wrapper');
  }

  initSlider() {
    this.swiper = new Swiper(this.el.querySelector('.swiper'), {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      spaceBetween: 24,
      speed: 1000,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: this.next,
        prevEl: this.prev,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
      },
    });
  }

  update() {
    setTimeout(() => {
      if (this.swiper) {
        this.swiper.update();
        this.swiper.updateSlides();
      }
    }, 1000);
  }

  destroy() {
    super.destroy();
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
}
