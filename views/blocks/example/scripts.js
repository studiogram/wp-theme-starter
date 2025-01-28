import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import View from '../../../assets/scripts/views/View';

export class BlockExemple extends View {
  constructor(el) {
    console.log('editor script: ', this.el);
    super(el);
    this.el = el;
    this.elems();
    this.initSlider();
  }

  elems() {
    this.next = this.el.querySelector('.next');
    this.prev = this.el.querySelector('.prev');
    this.slider = this.el.querySelector('.swiper');
  }

  initSlider() {
    const swiper = new Swiper(this.slider, {
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
      observer: true,
      observeSlideChildren: true,
      on: {
        observerUpdate: () => {
          console.log('observe changes');
          // this.update();
          // swiper.update();
          // swiper.updateSlides();
        },
      },
    });
    this.swiper = swiper;
  }

  destroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
}

// import Swiper from 'swiper';
// import { Navigation, Pagination } from 'swiper/modules';
// import View from '../../../assets/scripts/views/View';

// export class BlockExemple extends View {
//   constructor(el) {
//     super(el);
//     this.el = el;
//     this.elems();
//     this.initSlider();

//     // const $ = jQuery.noConflict();
//     // $(document).on(
//     //   'change',
//     //   '.acf-field input, .acf-field textarea, .acf-field select',
//     //   this.updateBlock.bind(this)
//     // );
//   }

//   updateBlock() {
//     const { select } = wp.data;
//     const selectedBlockId =
//       select('core/block-editor').getSelectedBlockClientId();
//     const blockId = this.el.getAttribute('data-block-id');
//     if (selectedBlockId === blockId) {
//       this.destroy();
//       this.initSlider();
//     }
//   }

//   elems() {
//     this.blockId = this.el.getAttribute('data-block-id');
//     this.next = this.el.querySelector('.next');
//     this.prev = this.el.querySelector('.prev');
//     this.slider = this.el.querySelector('.swiper');
//   }

//   initSlider() {
//     this.swiper = new Swiper(this.slider, {
//       modules: [Navigation, Pagination],
//       slidesPerView: 1,
//       spaceBetween: 24,
//       speed: 1000,
//       loop: true,
//       pagination: {
//         el: '.swiper-pagination',
//         clickable: true,
//       },
//       navigation: {
//         nextEl: this.next,
//         prevEl: this.prev,
//       },
//       breakpoints: {
//         768: {
//           slidesPerView: 2,
//         },
//       },
//       // observer: true,
//       // observeSlideChildren: true,
//       // on: {
//       //   observerUpdate: () => {
//       //     this.update();
//       //     this.updateSlides();
//       //   },
//       // },
//     });
//   }

//   destroy() {
//     if (this.swiper) {
//       this.swiper.destroy();
//     }
//   }
// }
