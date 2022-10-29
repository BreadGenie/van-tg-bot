import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';
import UserAgent from 'user-agents';

export const fetch = (
  url: RequestInfo,
  { headers, ...options }: RequestInit = {}
) => {
  return nodeFetch(url, {
    headers: {
      'user-agent': UserAgent.toString(),
      ...headers,
    },
    ...options,
  });
};
