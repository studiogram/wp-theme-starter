import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
gsap.registerPlugin(ScrollTrigger);

export default class Scroll {
  constructor(wrapper = document) {
    this.wrapper = wrapper;
    this.elements();
    this.init();
  }

  elements() {
    // this.blocks = [...this.wrapper.querySelectorAll(".blocks")];
  }

  init() {
    // if (this.blocks) {
    //   this.blocks.forEach((block) => {
    //     const tl = gsap.timeline({
    //       scrollTrigger: {
    //         trigger: block,
    //         scrub: true,
    //         start: "top bottom",
    //         end: "top 75%",
    //         markers: true,
    //       },
    //     });
    //     tl.fromTo(block, { autoAlpha: 0 }, { autoAlpha: 1 });
    //   });
    // }
  }

  onEnterCompleted() {}

  destroy() {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
