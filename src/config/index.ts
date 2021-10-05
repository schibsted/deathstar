import { App, TrafficPattern } from '../types';

// This is a bunch of common HTTP headers that we would like to pass along with all requests.
const headers = {
  headers: {
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
  },
};

// Traffic matching this pattern should be excluded simulations.
const blacklisted: TrafficPattern = {
  paths: ['/some-super-important-path'],
};

// Here's the juicy parts, the actual configuration
export const config: Record<string, App> = {
  // A config spans multiple apps. One map entry per app.
  'my-org/my-app': {
    name: 'MyApp',
    // This is a Slack channel id.
    // Death Star need to be installed in this channel.
    slackChannel: 'FOOBAR',
    // Here's a list of all simulations to be executed.
    simulations: [
      {
        // This simulation is of type `slow`.
        type: 'slow',
        properties: {
          // This means that HTTP requests will be delayed with 10000 ms.
          timeout: 10000,
          whitelisted: {
            // Apply this simulation to all paths.
            paths: ['/'],
          },
          // Exclude traffic matching the pattern defined above from the simulation.
          blacklisted,
        },
        target: [
          {
            // This is an endpoint on the app we're attacking.
            // We'll be monitoring this endpoint do verify that it's actually misbehaving.
            url: 'https://target.under.attack/blih/blah',
            // The HTTP headers defined above.
            ...headers,
          },
        ],
        verify: [
          {
            // This is an endpoint on a different app, an app that have a dependency on the app under attack.
            // We are monitoring this endpoint to verify that it's not affected by the ongoing attack.
            url: 'https://should.be.unaffected/blih/blah',
            // Same HTTP headers as above.
            ...headers,
          },
        ],
      },
      {
        // This simulation is of type `slow`.
        type: 'error',
        properties: {
          // This means that we'll make the app throw HTTP 555 errors.
          status: 555,
          whitelisted: {
            // Apply this simulation to all paths.
            paths: ['/'],
          },
          blacklisted,
        },
        target: [
          {
            url: 'https://target.under.attack/blih/blah',
            ...headers,
          },
        ],
        verify: [
          {
            url: 'https://should.be.unaffected/blih/blah',
            ...headers,
          },
        ],
      },
    ],
  },
};
