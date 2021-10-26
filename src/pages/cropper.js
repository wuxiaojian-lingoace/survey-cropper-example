import { Upload, Button, Dialog } from '@alifd/next';
import { Component } from 'react';
import '@alifd/next/dist/next.css';
import { saveAs } from 'file-saver';

import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
// plan 1: [not work in IE/Edge] IE don't support File Constructor
// function dataURL2File(dataURL, filename) { 
//     const arr = dataURL.split(','),
//         mime = arr[0].match(/:(.*?);/)[1],
//         bstr = atob(arr[1]),
//         u8arr = new Uint8Array(bstr.length);
//     let n = bstr.length;
//     while (n--) {
//         u8arr[n] = bstr.charCodeAt(n);
//     }

//     // base64 -> File (File Constructor not work in IE/Edge)
//     return new File([u8arr], filename, { type: mime });
// }

// plan 2: base64 -> Blob -> File, IE9+
function dataURL2Blob2File(dataURL, fileName) {
    const arr = dataURL.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        u8arr = new Uint8Array(bstr.length);
    let n = bstr.length;
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    // Blob to File
    // set lastModifiedDate and name
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    return blob;
};

class App extends Component {
    constructor(props) {
        super(props);
        this.uploader = new Upload.Uploader({
            action: 'http://127.0.0.1:6001/upload.do',
            onSuccess: this.onSuccess,
            name: 'file'
        });
    }

    state = {
        file:null,
        src: null,
        visible: false,
        img: null
    };

    onSuccess = (value) => {
        this.setState({
            img: value.url
        });
    };

    onSelect = (files) => {
        const reader = new FileReader();
        reader.onload = () => {
            this.setState({
                file:files[0],
                src: reader.result,
                visible: true
            });
        };
        reader.readAsDataURL(files[0]);
    };

    onCancel = () => {
        this.setState({
            visible: false
        });
    };

    onOk = () => {

        const selectFile =this.state.file;
        const data = this.cropperRef.getCroppedCanvas({
            imageSmoothingQuality: 'low',
        }).toDataURL(selectFile.type);
        const file = dataURL2Blob2File(data, selectFile.name);
        saveAs(file, selectFile.name);
        this.setState({
            visible: false
        });
    };

    saveCropperrRef = (ref) => {
        this.cropperRef = ref;
    };

    render() {
        return (
            <div>
                <Upload.Selecter onSelect={this.onSelect}
                >
                    <Button>Select file</Button>
                </Upload.Selecter>
                <Dialog
                    visible={this.state.visible}
                    onCancel={this.onCancel}
                    onOk={this.onOk}
                    onClose={this.onCancel}
                    isFullScreen>
                    <Cropper
                        onInitialized={(instance) => {
                          this.cropperRef = instance;
                        }}
                        rotatable={true}
                        src={this.state.src}
                        style={{height: 300, width: 400}}
                    />
                </Dialog>
                <div><img src={this.state.img} style={{width: 100}}/></div>
            </div>
        );
    }
}

export default App;