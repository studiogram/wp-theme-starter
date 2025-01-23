(function (factory) {
  typeof define === 'function' && define.amd ? define('admin', factory) :
  factory();
})((function () { 'use strict';

  class Admin {
    constructor() {
      console.log('admin');
    }
  }
  const ready = () => {
    new Admin();
  };
  document.addEventListener('DOMContentLoaded', ready);

}));
