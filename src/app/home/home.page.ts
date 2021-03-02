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
      quality: 10,
      destinationType: this._camera.DestinationType.DATA_URL,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE,
      sourceType: this._camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: true,
    };

    let imagen = await this._camera.getPicture(options);
    let base64ImageData = 'data:image/jpeg;base64,' + imagen;

    this.writeFile(base64ImageData, 'ImagesCarlos', 'sample.jpeg');
  }

  public async writeFile(base64Data: any, folderName: string, fileName: any) {
    let contentType = this.getContentType(base64Data);
    let DataBlob = this.base64toBlob(base64Data, contentType);
    console.log(DataBlob);
    // here iam mentioned this line this.file.externalRootDirectory is a native pre-defined file path storage. You can change a file path whatever pre-defined method.
    let filePath = this._file.dataDirectory + folderName;
    console.log(filePath);

    try {
      await this._file.checkDir(this._file.dataDirectory, folderName);
    } catch (error) {
      await this._file.createDir(this._file.dataDirectory, folderName, true);
    }

    this._file
      .checkDir(this._file.dataDirectory, folderName)
      .then((_) => console.log('Directory exists'))
      .catch((err) => console.log(`Directory doesn't exist`));

    this._file
      .writeFile(filePath, fileName, DataBlob, contentType)
      .then((success) => {
        console.log(success);
        this.EditImage(success.nativeURL);
        console.log('File Writed Successfully', success);
      })
      .catch((err) => {
        console.log('Error Occured While Writing File', err);
      });
  }
  //here is the method is used to get content type of an bas64 data
  public getContentType(base64Data: any) {
    let block = base64Data.split(';');
    let contentType = block[0].split(':')[1];
    return contentType;
  }

  //here is the method is used to convert base64 data to blob data
  public base64toBlob(b64Data: string, contentType) {
    let base64withoutspecialCharacteres = b64Data.split(',')[1];
    contentType = contentType || '';
    let sliceSize = 512;
    let byteCharacters = atob(base64withoutspecialCharacteres);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    let blob = new Blob(byteArrays, {
      type: contentType,
    });
    return blob;
  }

  /**
   *
   * ****************************************PESDK*****************************************+*
   */

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

  EditImage(ImageUrl) {
    /* The license should have an extension like this:
       for iOS: "xxx.ios", example: pesdk_license.ios
       for Android: "xxx.android", example: pesdk_license.android
       then pass just the name without the extension to the
       `unlockWithLicense` function */
    // PESDK.unlockWithLicense('www/assets/pesdk_license');
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
