const setWatermark = (str,width,height,font) => {
  const id = 'watermarkbyelmagnifico';
  if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
  const can = document.createElement('canvas');
  can.width = width;
  can.height = height;
  const cans = can.getContext('2d');
  cans.rotate((-20 * Math.PI) / 180);
  cans.font = font;
  cans.fillStyle = 'rgba(200, 200, 200, 0.30)';
  cans.textBaseline = 'Middle';
  cans.fillText(str, can.width / 10, can.height / 2);
  const div = document.createElement('div');
  div.id = id;
  div.style.pointerEvents = 'none';
  div.style.top = '15px';
  div.style.left = '0px';
  div.style.position = 'fixed';
  div.style.zIndex = '10000000';
  div.style.width = `${document.documentElement.clientWidth}px`;
  div.style.height = `${document.documentElement.clientHeight}px`;
  div.style.background = `url(${can.toDataURL('image/png')}) left top repeat`;
  document.body.appendChild(div);
  return id;
};
const watermark = {
  set: (str,width,height,font) => {
      let id = setWatermark(str,width,height,font);;
      if (document.getElementById(id) === null) id = setWatermark(str,width,height,font);;
  },
  del: () => {
      let id = 'watermarkbyelmagnifico';
      if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
  },
};