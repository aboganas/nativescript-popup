import { Common, PopupOptions } from './popup.common';
import { View } from 'tns-core-modules/ui/core/view';
import { topmost } from 'tns-core-modules/ui/frame';
import { ios } from 'tns-core-modules/ui/utils';
import { screen, device } from 'tns-core-modules/platform';
import { layout } from 'tns-core-modules/utils/utils';
import { Color } from 'tns-core-modules/color';
export class Popup extends Common {
  private _popupController: UIViewController;
  private _options: PopupOptions;
  resolve;
  reject;
  constructor(options?: PopupOptions) {
    super();
    this._options = new PopupOptions();
    if (options) {
      Object.keys(options).forEach(key => {
        this._options[key] = options[key];
      });
    }

    this._popupController = UIViewController.new();
    this._popupController.modalPresentationStyle =
      UIModalPresentationStyle.Popover;
  }

  public showPopup(source: any, view: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
      const isTablet = device.deviceType === 'Tablet';
      let nativeView;
      if (!this._popupController.popoverPresentationController.delegate) {
        this._popupController.popoverPresentationController.delegate = UIPopoverPresentationControllerDelegateImpl.initWithOwner(
          new WeakRef(this)
        );
      }
      if (this._options.backgroundColor) {
        this._popupController.view.backgroundColor = new Color(
          this._options.backgroundColor
        ).ios;
      }
      if (this._options.hideArrow) {
        this._popupController.popoverPresentationController.permittedArrowDirections = 0;
      }
      if (view instanceof View) {
        topmost()._addView(view);
        let height;
        let width;
        switch (this._options.unit) {
          case 'px':
            if (this._options.height && !this._options.width) {
              height = this._options.height;
              width =
                this._options.height *
                (screen.mainScreen.widthPixels /
                  screen.mainScreen.heightPixels);
            } else if (this._options.width && !this._options.height) {
              height =
                this._options.width *
                (screen.mainScreen.widthPixels /
                  screen.mainScreen.heightPixels);
              width = this._options.width;
            } else {
              width = this._options.width;
              height = this._options.height;
            }

            ios._layoutRootView(
              view,
              CGRectMake(
                0,
                isTablet ? 0 : ios.getStatusBarHeight(),
                layout.toDeviceIndependentPixels(width),
                layout.toDeviceIndependentPixels(height)
              )
            );
            break;
          case '%':
            if (this._options.height && !this._options.width) {
              height =
                screen.mainScreen.heightDIPs * (this._options.height / 100);
              width =
                height *
                (screen.mainScreen.widthPixels /
                  screen.mainScreen.heightPixels);
            } else if (this._options.width && !this._options.height) {
              width = screen.mainScreen.widthDIPs * (this._options.width / 100);
              height =
                width *
                (screen.mainScreen.widthPixels /
                  screen.mainScreen.heightPixels);
            } else {
              width = screen.mainScreen.widthDIPs * (this._options.width / 100);
              height =
                screen.mainScreen.heightDIPs * (this._options.height / 100);
            }
            ios._layoutRootView(
              view,
              CGRectMake(
                0,
                isTablet ? 0 : ios.getStatusBarHeight(),
                width,
                height
              )
            );
            break;
          default:
            if (this._options.height && !this._options.width) {
              height = this._options.height;
              width =
                this._options.height *
                (screen.mainScreen.widthPixels /
                  screen.mainScreen.heightPixels);
            } else if (this._options.width && !this._options.height) {
              height =
                this._options.width *
                (screen.mainScreen.widthPixels /
                  screen.mainScreen.heightPixels);
              width = this._options.width;
            } else {
              width = this._options.width ? this._options.width : 400;
              height = this._options.height ? this._options.height : 320;
            }
            ios._layoutRootView(
              view,
              CGRectMake(
                0,
                isTablet ? 0 : ios.getStatusBarHeight(),
                width,
                height
              )
            );
            break;
        }
        this._popupController.preferredContentSize =
          view.nativeView.bounds.size;
        nativeView = view.nativeView;
      } else if (view instanceof UIView) {
        nativeView = view;
      }
      if (source instanceof View) {
        this._popupController.popoverPresentationController.sourceView =
          source.nativeView;
        this._popupController.popoverPresentationController.sourceRect = CGRectMake(
          0,
          0,
          source.nativeView.frame.size.width,
          source.nativeView.frame.size.height
        );
        this._popupController.view.addSubview(nativeView);
        (<UINavigationController>topmost().ios
          .controller).presentModalViewControllerAnimated(
          this._popupController,
          true
        );
      } else if (source instanceof UIView) {
        this._popupController.popoverPresentationController.sourceView = source;
        this._popupController.popoverPresentationController.sourceRect = CGRectMake(
          0,
          0,
          source.frame.size.width,
          source.frame.size.height
        );
        this._popupController.view.addSubview(nativeView);
        (<UINavigationController>topmost().ios
          .controller).presentModalViewControllerAnimated(
          this._popupController,
          true
        );
      }
    });
  }

  public hidePopup(data?: any) {
    if (this.resolve) {
      this.resolve(data);
    }
    this._popupController.dismissModalViewControllerAnimated(true);
    this.resolve = null;
    this.reject = null;
  }
}

export class UIPopoverPresentationControllerDelegateImpl extends NSObject
  implements UIPopoverPresentationControllerDelegate {
  static ObjCProtocols = [UIPopoverPresentationControllerDelegate];
  private _owner: WeakRef<Popup>;
  static initWithOwner(owner: WeakRef<Popup>) {
    const delegate = new UIPopoverPresentationControllerDelegateImpl();
    delegate._owner = owner;
    return delegate;
  }
  popoverPresentationControllerDidDismissPopover(
    popoverPresentationController: UIPopoverPresentationController
  ): void {
    if (this._owner.get()) {
      this._owner.get().resolve();
      this._owner.get().resolve = null;
      this._owner.get().reject = null;
    }
  }
}
