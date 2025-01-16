import Page from '../../../assets/scripts/views/Page';

export default class FrontPage extends Page {
  onEnter() {
    console.log('HOME ENTER');
  }
  onLeaveCompleted() {
    console.log('HOME LEAVE COMPLETED');
  }
}
