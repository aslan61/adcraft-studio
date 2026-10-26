import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runCreativeQaTestSuite, QaTestContext } from './creativeQaTester.ts';

describe('Creative QA Test Engine Suite', () => {
  const baseMockContext: QaTestContext = {
    aspectRatio: '9:16',
    showSafeZones: true,
    audioConfig: {
      name: 'Cyber Hype',
      genre: 'Phonk',
      volume: 0.6,
      isPlaying: false,
      soundBoost: true,
      isMuted: false
    },
    hookCopy: {
      headline: '🔥 Can You Beat Level 12?',
      subHook: 'Top 1% Mobile Gamers Only',
      ctaText: 'Play Free Today',
      toneArchetype: 'Hype / Viral',
      karaokeEffect: true,
      storeBadge: 'App Store',
      starRating: 4.9,
      reviewCount: '50k+',
      predictedCtrBoost: '+35%'
    },
    assets: [
      {
        id: 'nr-01',
        name: 'Demo Gameplay',
        url: 'https://example.com/demo.mp4',
        type: 'video',
        resolution: '1080x1920',
        tag: 'Gameplay',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        aspectRatio: '9:16'
      }
    ],
    activeAssetId: 'nr-01',
    deviceConfig: {
      model: 'iPhone 16 Pro',
      color: 'Titanium Black',
      yaw: 0,
      pitch: 0,
      roll: 0,
      shadowIntensity: 0.8,
      zoom: 100,
      motionPreset: 'Floating Drift'
    },
    duration: 15,
    language: 'en'
  };

  test('Passes all QA compliance tests with optimal creative settings', () => {
    const report = runCreativeQaTestSuite(baseMockContext);

    assert.equal(report.failedCount, 0);
    assert.ok(report.overallScore >= 95, `Expected score >= 95, got ${report.overallScore}`);
    assert.equal(report.grade, 'A+');
    assert.equal(report.platformCompliance.tikTok, true);
    assert.equal(report.platformCompliance.reels, true);
    assert.equal(report.platformCompliance.shorts, true);
    assert.equal(report.platformCompliance.appStore, true);
  });

  test('Detects muted audio and flags as critical failure', () => {
    const report = runCreativeQaTestSuite({
      ...baseMockContext,
      audioConfig: {
        ...baseMockContext.audioConfig,
        isMuted: true
      }
    });

    assert.ok(report.failedCount > 0);
    const audioItem = report.items.find((i) => i.id === 'qa-audio-muted');
    assert.ok(audioItem);
    assert.equal(audioItem.status, 'fail');
    assert.equal(report.platformCompliance.tikTok, false);
  });

  test('Detects missing CTA text and flags failure', () => {
    const report = runCreativeQaTestSuite({
      ...baseMockContext,
      hookCopy: {
        ...baseMockContext.hookCopy,
        ctaText: ''
      }
    });

    const ctaItem = report.items.find((i) => i.id === 'qa-cta-missing');
    assert.ok(ctaItem);
    assert.equal(ctaItem.status, 'fail');
  });

  test('Flags warning when safe zones are disabled', () => {
    const report = runCreativeQaTestSuite({
      ...baseMockContext,
      showSafeZones: false
    });

    const safeZoneItem = report.items.find((i) => i.id === 'qa-safe-zones');
    assert.ok(safeZoneItem);
    assert.equal(safeZoneItem.status, 'warning');
  });

  test('Outputs Turkish localized messages when language is tr', () => {
    const report = runCreativeQaTestSuite({
      ...baseMockContext,
      language: 'tr'
    });

    const ratioItem = report.items.find((i) => i.id === 'qa-aspect-ratio');
    assert.ok(ratioItem);
    assert.ok(ratioItem.title.includes('En-Boy Oranı Kontrolü'));
  });
});
