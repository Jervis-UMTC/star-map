import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

try {
  const pFont = 'normal 24px "Cormorant Garamond", serif';
  const prepared = prepareWithSegments("hello world", pFont);
  const res = layoutWithLines(prepared, 800, 36);
  console.log(res);
} catch (e) {
  console.error("error", e);
}