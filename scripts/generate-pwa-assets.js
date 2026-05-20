const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// ── Directories ──────────────────────────────────────────
const ICONS_DIR       = path.join(__dirname, '../public/icons');
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

[ICONS_DIR, SCREENSHOTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Helper: draw a simple plane icon on canvas ────────────
function createBaseIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0A4F8C';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Plane emoji / text
  ctx.fillStyle = '#FFFFFF';
  ctx.font      = `bold ${size * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✈', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// ── Helper: maskable icon (icon inside 80% safe zone) ─────
function createMaskableIcon(size) {
  const canvas  = createCanvas(size, size);
  const ctx     = canvas.getContext('2d');
  const padding = size * 0.1; // 10% padding = 80% safe zone

  // Background (full bleed)
  ctx.fillStyle = '#0A4F8C';
  ctx.fillRect(0, 0, size, size);

  // Icon centered within safe zone
  ctx.fillStyle = '#FFFFFF';
  ctx.font      = `bold ${(size - padding * 2) * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✈', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// ── Helper: shortcut icon ─────────────────────────────────
function createShortcutIcon(size, emoji) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  ctx.fillStyle = '#1A6DBF';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font      = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// ── Helper: screenshot placeholder ───────────────────────
function createScreenshot(width, height, label) {
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#F4F7FA';
  ctx.fillRect(0, 0, width, height);

  // Nav bar
  ctx.fillStyle = '#0A4F8C';
  ctx.fillRect(0, 0, width, height * 0.08);

  // Nav text
  ctx.fillStyle = '#FFFFFF';
  ctx.font      = `bold ${height * 0.035}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('✈ SkyWay', width * 0.03, height * 0.04);

  // Card
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor   = 'rgba(10,79,140,0.1)';
  ctx.shadowBlur    = 20;
  ctx.beginPath();
  ctx.roundRect(width * 0.05, height * 0.12, width * 0.9, height * 0.7, 12);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Card label
  ctx.fillStyle = '#0A4F8C';
  ctx.font      = `bold ${height * 0.045}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SkyWay — Flight Management', width / 2, height * 0.3);

  ctx.fillStyle = '#5A6A78';
  ctx.font      = `${height * 0.03}px Arial`;
  ctx.fillText(label, width / 2, height * 0.42);

  return canvas.toBuffer('image/png');
}

// ── Generate all assets ───────────────────────────────────
async function generate() {
  console.log('🚀 Generating PWA assets...\n');

  // 1. icon-192.png
  fs.writeFileSync(path.join(ICONS_DIR, 'icon-192.png'), createBaseIcon(192));
  console.log('✅ icon-192.png');

  // 2. icon-192-maskable.png
  fs.writeFileSync(path.join(ICONS_DIR, 'icon-192-maskable.png'), createMaskableIcon(192));
  console.log('✅ icon-192-maskable.png');

  // 3. icon-512.png
  fs.writeFileSync(path.join(ICONS_DIR, 'icon-512.png'), createBaseIcon(512));
  console.log('✅ icon-512.png');

  // 4. icon-512-maskable.png
  fs.writeFileSync(path.join(ICONS_DIR, 'icon-512-maskable.png'), createMaskableIcon(512));
  console.log('✅ icon-512-maskable.png');

  // 5. shortcut-search-96.png
  fs.writeFileSync(path.join(ICONS_DIR, 'shortcut-search-96.png'), createShortcutIcon(96, '🔍'));
  console.log('✅ shortcut-search-96.png');

  // 6. shortcut-bookings-96.png
  fs.writeFileSync(path.join(ICONS_DIR, 'shortcut-bookings-96.png'), createShortcutIcon(96, '📋'));
  console.log('✅ shortcut-bookings-96.png');

  // 7. desktop screenshot (1280x720)
  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'desktop.png'),
    createScreenshot(1280, 720, 'Search, book, and manage flights')
  );
  console.log('✅ screenshots/desktop.png');

  // 8. mobile screenshot (390x844)
  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'mobile.png'),
    createScreenshot(390, 844, 'Search, book, and manage flights')
  );
  console.log('✅ screenshots/mobile.png');

  console.log('\n🎉 All PWA assets generated successfully!');
  console.log('📁 Icons     → /public/icons/');
  console.log('📁 Screenshots → /public/screenshots/');
}

generate().catch(console.error);
