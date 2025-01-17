(function (factory) {
  typeof define === 'function' && define.amd ? define('editor', factory) :
  factory();
})((function () { 'use strict';

  class Editor {
    constructor() {
      console.log('editor');
    }
  }
  const ready = () => {
    new Editor();
  };
  document.addEventListener('DOMContentLoaded', ready);

}));
