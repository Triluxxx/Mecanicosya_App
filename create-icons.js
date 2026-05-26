const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icon.png (1024x1024)
const iconCanvas = createCanvas(1024, 1024);
const iconCtx = iconCanvas.getContext('2d');
iconCtx.fillStyle = '#3B82F6';
iconCtx.fillRect(0, 0, 1024, 1024);
iconCtx.fillStyle = '#FFFFFF';
iconCtx.font = 'bold 400px Arial';
iconCtx.textAlign = 'center';
iconCtx.textBaseline = 'middle';
iconCtx.fillText('M', 512, 512);
fs.writeFileSync('./assets/icon.png', iconCanvas.toBuffer('image/png'));

// Create adaptive-icon.png (1024x1024)
const adaptiveCanvas = createCanvas(1024, 1024);
const adaptiveCtx = adaptiveCanvas.getContext('2d');
adaptiveCtx.fillStyle = '#3B82F6';
adaptiveCtx.fillRect(0, 0, 1024, 1024);
adaptiveCtx.fillStyle = '#FFFFFF';
adaptiveCtx.font = 'bold 400px Arial';
adaptiveCtx.textAlign = 'center';
adaptiveCtx.textBaseline = 'middle';
adaptiveCtx.fillText('M', 512, 512);
fs.writeFileSync('./assets/adaptive-icon.png', adaptiveCanvas.toBuffer('image/png'));

// Create splash.png (1284x2778)
const splashCanvas = createCanvas(1284, 2778);
const splashCtx = splashCanvas.getContext('2d');
splashCtx.fillStyle = '#111827';
splashCtx.fillRect(0, 0, 1284, 2778);
splashCtx.fillStyle = '#3B82F6';
splashCtx.font = 'bold 200px Arial';
splashCtx.textAlign = 'center';
splashCtx.textBaseline = 'middle';
splashCtx.fillText('MecánicosYa', 642, 1389);
fs.writeFileSync('./assets/splash.png', splashCanvas.toBuffer('image/png'));

console.log('Icons created successfully!');
