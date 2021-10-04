import nock from 'nock';
import { probe, evaluate } from '../../src/clients/probe-client';
import { ProbeUrl } from '../../src/types';

describe('evaluate', () => {
  it('returns result based on response time', () => {
    expect(evaluate({} as ProbeUrl, 200, 1499)).toBeTruthy();
    expect(evaluate({} as ProbeUrl, 100, 1500)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 200, 1500)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 300, 1500)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 400, 1500)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 500, 1500)).toBeFalsy();
  });

  it('returns result based on status', () => {
    expect(evaluate({} as ProbeUrl, 200, 10)).toBeTruthy();
    expect(evaluate({} as ProbeUrl, 299, 10)).toBeTruthy();
    expect(evaluate({} as ProbeUrl, 300, 10)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 100, 10)).toBeTruthy();
    expect(evaluate({} as ProbeUrl, 300, 10)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 400, 10)).toBeFalsy();
    expect(evaluate({} as ProbeUrl, 500, 10)).toBeFalsy();
  });

  it('returns result based on expected slow', () => {
    expect(evaluate({ expectedSlow: 5000 } as ProbeUrl, 200, 4999)).toBeFalsy();
    expect(
      evaluate({ expectedSlow: 5000 } as ProbeUrl, 200, 5000),
    ).toBeTruthy();
    expect(
      evaluate({ expectedSlow: 5000 } as ProbeUrl, 200, 5001),
    ).toBeTruthy();
  });

  it('returns result based on expected status', () => {
    expect(evaluate({ expectedStatus: 200 } as ProbeUrl, 200, 10)).toBeTruthy();
    expect(evaluate({ expectedStatus: 200 } as ProbeUrl, 400, 10)).toBeFalsy();
    expect(evaluate({ expectedStatus: 299 } as ProbeUrl, 299, 10)).toBeTruthy();
    expect(evaluate({ expectedStatus: 567 } as ProbeUrl, 200, 10)).toBeFalsy();
    expect(evaluate({ expectedStatus: 100 } as ProbeUrl, 100, 10)).toBeTruthy();
    expect(evaluate({ expectedStatus: 567 } as ProbeUrl, 300, 10)).toBeFalsy();
  });
});

describe('GET', () => {
  it('should handle status 200', async () => {
    nock('https://example.com').get('/').reply(200, {});
    const response = await probe({ url: 'https://example.com' });
    expect(response.status).toEqual(200);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeTruthy();
  });

  it('should return false if response is not expected status', async () => {
    nock('https://example.com').get('/').reply(200, {});
    const response = await probe({
      url: 'https://example.com',
      expectedStatus: 567,
    });
    expect(response.status).toEqual(200);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeFalsy();
  });

  it('should return false if response is slower than 1500 ms', async () => {
    nock('https://example.com').get('/').delayConnection(1500).reply(200, {});
    const response = await probe({ url: 'https://example.com' });
    expect(response.status).toEqual(200);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeFalsy();
  });

  it('should return true if response is slower than expected slow', async () => {
    nock('https://example.com').get('/').delayConnection(500).reply(200, {});
    const response = await probe({
      url: 'https://example.com',
      expectedSlow: 500,
    });
    expect(response.status).toEqual(200);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeTruthy();
  });

  it('should return false if response is quicker than expected slow', async () => {
    nock('https://example.com').get('/').delayConnection(400).reply(200, {});
    const response = await probe({
      url: 'https://example.com',
      expectedSlow: 500,
    });
    expect(response.status).toEqual(200);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeFalsy();
  });

  it('should handle status 500', async () => {
    nock('https://example.com').get('/').reply(500, {});
    const response = await probe({ url: 'https://example.com' });
    expect(response.status).toEqual(500);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeFalsy();
  });

  it('should handle errors', async () => {
    nock('https://example.com')
      .get('/')
      .replyWithError('something awful happened');
    const response = await probe({ url: 'https://example.com' });
    expect(response.status).toBeUndefined();
    expect(response.totalTime).toBeUndefined();
    expect(response.result).toBeFalsy();
  });
});

describe('POST', () => {
  it('should handle status 200', async () => {
    nock('https://example.com').post('/', { some: 'body' }).reply(200, {});
    const response = await probe({
      url: 'https://example.com',
      method: 'POST',
      json: { some: 'body' },
    });
    expect(response.status).toEqual(200);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeTruthy();
  });

  it('should handle status 500', async () => {
    nock('https://example.com').post('/', { some: 'body' }).reply(500, {});
    const response = await probe({
      url: 'https://example.com',
      method: 'POST',
      json: { some: 'body' },
    });
    expect(response.status).toEqual(500);
    expect(response.totalTime).toBeGreaterThan(0);
    expect(response.result).toBeFalsy();
  });

  it('should handle errors', async () => {
    nock('https://example.com')
      .post('/', { some: 'body' })
      .replyWithError('something awful happened');
    const response = await probe({
      url: 'https://example.com',
      method: 'POST',
      json: { some: 'body' },
    });
    expect(response.status).toBeUndefined();
    expect(response.totalTime).toBeUndefined();
    expect(response.result).toBeFalsy();
  });
});
