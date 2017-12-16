import { Observable } from 'tns-core-modules/data/observable';
import { Popup } from 'nativescript-popup';

export class HelloWorldModel extends Observable {
  private popup: Popup;

  constructor() {
    super();
  }

  showPopup(source, view) {
    this.popup = new Popup({ width: 70, height: 70, unit: '%', elevation: 10 });
    this.popup.showPopup(source, view).then(data => {
      console.log(data);
    });
  }
  hidePopup(index) {
    this.popup.hidePopup(index);
  }
}
