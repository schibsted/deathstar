import got from 'got';
import { ProbeResult, ProbeUrl } from '../types';

const retry = 0;
const timeout = 10000;

export const evaluate = (
  probeUrl: ProbeUrl,
  status?: number,
  totalTime?: number,
): boolean => {
  if (totalTime && probeUrl.expectedSlow) {
    return totalTime >= probeUrl.expectedSlow;
  }
  if (totalTime && status) {
    return (
      (probeUrl.expectedStatus
        ? status === probeUrl.expectedStatus
        : status < 300) && totalTime < 1500
    );
  }
  return false;
};

export const probe = async (probeUrl: ProbeUrl): Promise<ProbeResult> => {
  try {
    const response = await (probeUrl.method === 'POST'
      ? got.post(probeUrl.url, {
          retry,
          timeout,
          responseType: 'json',
          json: probeUrl.json,
          headers: probeUrl.headers,
        })
      : got(probeUrl.url, {
          retry,
          timeout,
          headers: probeUrl.headers,
        }));
    return {
      result: evaluate(
        probeUrl,
        response.statusCode,
        response.timings?.phases.total,
      ),
      status: response.statusCode,
      totalTime: response.timings?.phases.total,
      probeUrl,
    };
  } catch (error: any) {
    return {
      result: evaluate(
        probeUrl,
        error.response?.statusCode,
        error.response?.timings.phases.total,
      ),
      status: error.response?.statusCode,
      totalTime: error.response?.timings.phases.total,
      probeUrl,
    };
  }
};
