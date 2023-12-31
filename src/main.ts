import './style.scss';
import {
  segmentBackground,
  applyBlur,
  applyImageBackground,
  applyVideoBackground,
  applyScreenBackground,
  changeForegroundType,
} from 'virtual-bg';
import { calculateFPS } from './utils';

const inputVideoElement: HTMLVideoElement =
  document.querySelector('#inputVideoElement')!;

const toggleButtonElement: any = document.querySelector('#toggleButton')!;

const outputCanvasElement: HTMLCanvasElement | any =
  document.querySelector('.output_canvas')!;

const containerElement: HTMLDivElement | any =
  document.querySelector('#container')!;

const effectTypeSelectorElement: HTMLSelectElement | any =
  document.querySelector('#effectTypeSelector')!;

const foregroundTypeSelectorElement: HTMLSelectElement | any =
  document.querySelector('#foregroundTypeSelector')!;
const blurIntensitySliderElement: HTMLInputElement | any =
  document.querySelector('#blurIntensitySlider')!;

const imageBrowserInputElement: HTMLInputElement | any =
  document.querySelector('#imageBrowserInput')!;

const videoBrowserInputElement: HTMLInputElement | any =
  document.querySelector('#videoBrowserInput')!;
let screenStream: MediaStream;
let isScreenCaptureOn: boolean = false;

toggleButtonElement.onclick = async () => {
  let myStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  });

  const width =
    window.innerHeight > window.innerWidth
      ? myStream.getVideoTracks()[0].getSettings().height
      : myStream.getVideoTracks()[0].getSettings().width;
  const height =
    window.innerHeight > window.innerWidth
      ? myStream.getVideoTracks()[0].getSettings().width
      : myStream.getVideoTracks()[0].getSettings().height;

  // const width = myStream.getVideoTracks()[0].getSettings().width;
  // const height = myStream.getVideoTracks()[0].getSettings().height;

  inputVideoElement.srcObject = myStream;

  containerElement.style.display = 'unset';
  outputCanvasElement.style.width = width;
  outputCanvasElement.style.height = height;
  outputCanvasElement.style.aspectRatio = `${width}/${height}`;
  toggleButtonElement.style.display = 'none';

  segmentBackground(inputVideoElement, outputCanvasElement);
  applyBlur(0);
  const videoElement = document.createElement('video');
  videoElement.src = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  applyVideoBackground(videoElement);
  changeForegroundType('normal');
};

blurIntensitySliderElement.oninput = (e: any) => {
  const blurIntensity = e?.target?.value;
  applyBlur(blurIntensity);
};

effectTypeSelectorElement.onchange = (e: any) => {
  const type = e?.target?.value;

  if (type === 'blur') {
    (<HTMLDivElement>(
      document.querySelector('#blurIntensityContainer')
    )).style.display = 'unset';
    (<HTMLDivElement>(
      document.querySelector('#imageBrowserContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#videoBrowserContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#foregroundTypeSelectorContainer')
    )).style.display = 'none';
    applyBlur(7);
    if (isScreenCaptureOn) {
      stopScreenCapture();
    }
  } else if (type === 'image') {
    (<HTMLDivElement>(
      document.querySelector('#blurIntensityContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#imageBrowserContainer')
    )).style.display = 'unset';
    (<HTMLDivElement>(
      document.querySelector('#videoBrowserContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#foregroundTypeSelectorContainer')
    )).style.display = 'none';
    if (imageBrowserInputElement?.files[0]) {
      setBackgroundImage(imageBrowserInputElement?.files[0]);
    } else
      imageBrowserInputElement.onchange = (e: any) => {
        applyBlur(0);
        setBackgroundImage(e?.target?.files[0]);
      };
    if (isScreenCaptureOn) {
      stopScreenCapture();
    }
  } else if (type === 'video') {
    (<HTMLDivElement>(
      document.querySelector('#blurIntensityContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#imageBrowserContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#videoBrowserContainer')
    )).style.display = 'unset';
    (<HTMLDivElement>(
      document.querySelector('#foregroundTypeSelectorContainer')
    )).style.display = 'none';
    if (videoBrowserInputElement?.files[0]) {
      setBackgroundVideo(videoBrowserInputElement?.files[0]);
    } else
      videoBrowserInputElement.onchange = (e: any) => {
        applyBlur(0);
        setBackgroundVideo(e?.target?.files[0]);
      };
    if (isScreenCaptureOn) {
      stopScreenCapture();
    }
  } else if (type === 'screen') {
    (<HTMLDivElement>(
      document.querySelector('#blurIntensityContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#imageBrowserContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#videoBrowserContainer')
    )).style.display = 'none';
    (<HTMLDivElement>(
      document.querySelector('#foregroundTypeSelectorContainer')
    )).style.display = 'unset';
    setScreenBackground();
    (<HTMLSpanElement>(
      document.querySelector('#presenterOffsetContainer')
    )).style.display = 'unset';
    foregroundTypeSelectorElement.value = 'presenter';
    outputCanvasElement.style.transform = 'unset';
    foregroundTypeSelectorElement.onchange = (e: any) => {
      const type = e?.target?.value;
      if (type === 'normal') {
        changeForegroundType('normal');
        (<HTMLSpanElement>(
          document.querySelector('#presenterOffsetContainer')
        )).style.display = 'none';
        outputCanvasElement.style.transform = 'scaleX(-1)';
      } else if (type === 'presenter') {
        (<HTMLSpanElement>(
          document.querySelector('#presenterOffsetContainer')
        )).style.display = 'unset';
        changeForegroundType(
          'presenter',
          Number(
            (<HTMLInputElement>document.getElementById('presenterOffset')).value
          )
        );
        outputCanvasElement.style.transform = 'unset';
      }
    };
  }
};

function setBackgroundImage(imageFile: File) {
  applyBlur(0);
  const reader = new FileReader();
  reader.readAsDataURL(imageFile);
  reader.onload = (e: any) => {
    const imageUrl = e?.target?.result;
    const image = new Image();
    image.src = imageUrl;
    applyImageBackground(image);
  };
}

function setBackgroundVideo(videoFile: File) {
  applyBlur(0);
  const videoElement = document.createElement('video');
  const videoUrl = URL.createObjectURL(videoFile);
  videoElement.src = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  applyVideoBackground(videoElement);
  changeForegroundType('normal');
}

async function setScreenBackground() {
  applyBlur(0);
  // @ts-ignore
  screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  isScreenCaptureOn = true;
  applyScreenBackground(screenStream);
  changeForegroundType(
    'presenter',
    Number((<HTMLInputElement>document.getElementById('presenterOffset')).value)
  );

  screenStream.getVideoTracks()[0].addEventListener('ended', () => {
    isScreenCaptureOn = false;
    // console.log('screen capture ended');
  });
}

function stopScreenCapture() {
  let tracks = screenStream.getTracks();
  tracks.forEach((track) => track.stop());
  isScreenCaptureOn = false;
  outputCanvasElement.style.transform = 'scaleX(-1)';
}

(<HTMLInputElement>document.getElementById('presenterOffset')).oninput = (
  e: any
) => {
  if (
    isScreenCaptureOn &&
    (<HTMLInputElement>document.getElementById('foregroundTypeSelector'))
      .value === 'presenter'
  ) {
    changeForegroundType('presenter', e?.target?.value);
  }
};

calculateFPS();

if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  alert('Mobile Devices are not fully supported. Please visit from a desktop');
}
