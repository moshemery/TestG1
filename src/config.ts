export const isMobile = /Mobi|Android/i.test(navigator.userAgent);
export const vrMode = isMobile && window.innerWidth > window.innerHeight;
// Scale game objects relative to the reduced canvas width in VR mode
export const SCALE = vrMode ? 0.5 : 1;
