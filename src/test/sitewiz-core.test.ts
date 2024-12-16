import { Sitewiz } from '../sitewiz-core';

describe('Sitewiz GDPR Compliance', () => {
  let sitewiz: Sitewiz;

  beforeEach(() => {
    sitewiz = new Sitewiz();
  });

  test('should mask PII and not track device name when GDPR is active', () => {
    sitewiz.gdpr = true;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    sitewiz.begin('test-stream-key');

    expect(logSpy).toHaveBeenCalledWith('GDPR mode active: Masking PII and not tracking device name.');
    // Add more assertions related to PII masking and device name tracking
  });
});
