import { Component } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var PESDK;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
    private _camera: Camera,
    private _file: File,
    private _webview: WebView,
    private _sanatizer: DomSanitizer
  ) {}

  async setupCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this._camera.DestinationType.FILE_URI,
      encodingType: this._camera.EncodingType.JPEG,
    };

    const tempImage = await this._camera.getPicture(options);

    const tempFilename = tempImage.substr(tempImage.lastIndexOf('/') + 1);
    const tempBaseFilesystemPath = tempImage.substr(
      0,
      tempImage.lastIndexOf('/') + 1
    );
    const newBaseFilesystemPath = this._file.dataDirectory;
    await this._file.copyFile(
      tempBaseFilesystemPath,
      tempFilename,
      newBaseFilesystemPath,
      tempFilename
    );

    const storedPhoto = newBaseFilesystemPath + tempFilename;
    const displayImage = this._webview.convertFileSrc(storedPhoto);
    const safeImage: SafeResourceUrl = this._sanatizer.bypassSecurityTrustResourceUrl(
      displayImage
    );
    this.onButtonClick(safeImage['changingThisBreaksApplicationSecurity']);
  }

  pesdk_success(result) {
    console.log(result);
    if (result != null) {
      alert('PESDK result: ' + result.image);
    } else
      console.log('pesdk_success: result is null, the editor was canceled');
  }

  pesdk_failure(error) {
    console.log('pesdk_failure: ' + JSON.stringify(error));
  }

  onButtonClick(ImageUrl) {
    /* The license should have an extension like this:
       for iOS: "xxx.ios", example: pesdk_license.ios
       for Android: "xxx.android", example: pesdk_license.android
       then pass just the name without the extension to the
       `unlockWithLicense` function */
    // PESDK.unlockWithLicense('www/assets/pesdk_license');
    console.log(ImageUrl);
    var config = {
      // Configure sticker tool
      sticker: {
        // Enable personal stickers
        personalStickers: true,
        // Configure stickers
        categories: [
          // Create sticker category with stickers
          {
            identifier: 'example_sticker_category_logos',
            name: 'Logos',
            thumbnailURI: PESDK.loadResource('www/assets/icon/favicon.png'),
            // items: [
            //   {
            //     identifier: 'example_sticker_logos_ionic',
            //     name: 'Ionic',
            //     stickerURI: PESDK.loadResource('/www/assets/icon/favicon.png'),
            //   },
            //   {
            //     identifier: 'example_sticker_logos_imgly',
            //     name: 'img.ly',
            //     tintMode: 'colorized',
            //     stickerURI: PESDK.loadResource('/www/assets/icon/favicon.png'),
            //   },
            // ],
          },
          // Use existing sticker category
          { identifier: 'imgly_sticker_category_emoticons' },
          // Modify existing sticker category
          {
            identifier: 'imgly_sticker_category_shapes',
            items: [
              { identifier: 'imgly_sticker_shapes_badge_01' },
              { identifier: 'imgly_sticker_shapes_arrow_02' },
              { identifier: 'imgly_sticker_shapes_spray_03' },
            ],
          },
        ],
      },
    };

    PESDK.openEditor(
      this.pesdk_success,
      this.pesdk_failure,
      PESDK.loadResource(ImageUrl),
      config
    );
  }
}
