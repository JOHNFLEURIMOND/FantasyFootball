const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  cache: false,
});

const { fleurimondColors } = require('../components/CSS/theme');

function luminance(hex) {
  const channels = [1, 3, 5]
    .map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('locked theme exposes the documented navy, surface, crimson, and text tokens', () => {
  assert.deepEqual(
    {
      background: fleurimondColors.background,
      backgroundDeep: fleurimondColors.backgroundDeep,
      surface: fleurimondColors.surface,
      surfaceBorder: fleurimondColors.surfaceBorder,
      accent: fleurimondColors.accent,
      accentHover: fleurimondColors.accentHover,
      text: fleurimondColors.text,
      textMuted: fleurimondColors.textMuted,
    },
    {
      background: '#0B0C1D',
      backgroundDeep: '#0A0B1A',
      surface: '#14162B',
      surfaceBorder: '#232742',
      accent: '#FF3B56',
      accentHover: '#E62E45',
      text: '#FFFFFF',
      textMuted: '#A0A5C0',
    }
  );
});

test('core text and active-control pairings meet WCAG AA contrast', () => {
  assert.ok(contrast(fleurimondColors.text, fleurimondColors.background) >= 4.5);
  assert.ok(contrast(fleurimondColors.textMuted, fleurimondColors.background) >= 4.5);
  assert.ok(contrast(fleurimondColors.backgroundDeep, fleurimondColors.accent) >= 4.5);
});
