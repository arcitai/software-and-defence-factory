// Map GitHub's label colors to the dashboard palette; no untrusted inline CSS.
export function issueLabelTone(color) {
  if (!/^[a-f0-9]{6}$/i.test(color || '')) return 'neutral';
  const [r,g,b] = color.match(/../g).map(value => parseInt(value,16) / 255);
  const max=Math.max(r,g,b), min=Math.min(r,g,b), delta=max-min;
  if (delta < .025) return 'neutral';
  let hue=max===r ? ((g-b)/delta)%6 : max===g ? (b-r)/delta+2 : (r-g)/delta+4;
  hue=(hue*60+360)%360;
  if(hue<15||hue>=345)return 'red';
  if(hue<45)return 'orange';
  if(hue<75)return 'yellow';
  if(hue<165)return 'green';
  if(hue<195)return 'cyan';
  if(hue<255)return 'blue';
  return 'purple';
}
