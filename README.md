# :boom: Deathstar – Application-level chaos engineering
###### _Because a little chaos is good for you._

Clouds are **chaotic**.<br />
**Unexpected events** happen all the time.<br />
Deathstar is here to help us **being proactive** and ensuring we can **withstand disturbances in the cloud**.

### Wait what, what's Deathstar?

It's application-level chaos engineering.<br />
A way of creating controlled outage simulations and other types of simulated chaos, through the means of a Slack bot.

The underlying idea is that, by creating our own short and controlled misbehaviors, we can...

- 🅰️ identify areas for improvement and...
- 🅱️ ensure there's enough error handling and other resilience capabilities in place to avoid too much suffering, even though things are on fire behind the scenes.

More in-depth reasoning and background can be found in this article: [INSERT LINK HERE](https://lolololol.rofl).

### How does it work?

Deathstar comes in two parts,...

- a Slack bot (this repo), which can be seen as the Deathstar control plane. It is responsible for coordinating and carrying out simulations and...
- a middleware that needs to be included in all services that are to be attacked by Deathstar

The middleware act on signals from the Deathstar control plane. Signals that are broadcasted during an outage simulation.

<img src="https://docs.google.com/drawings/d/e/2PACX-1vTJ9IzmknGF72W6tFJyG0Ef4PLeKruBMglTd2n486AQsfGyknZOtgFzHd9odVx_Cz-9h3nVz3IbZJJa/pub?w=1438&amp;h=848">

### Mkay, what is it capable of?

Deathstar currently supports the following simulations:

- **`error`** - make the target under attack throw HTTP errors
- **`slow`** - make the target extremely slooow

All simulations can be applied to either all endpoints of a service or a selected few endpoints.

It's also possible to define a list of endpoints and HTTP headers that should be excluded from a simulation because it might be that the same service is used to serve both external and internal users and we may or may not have the same resilience level in both use cases.

### Getting started

1. `git clone`, `npm install` and `npm run build`
1. Make necessary changes to `src/config`
1. `npm run start:web` to launch the control plane
1. `npm run start:trigger my-org/my-app` as a cronjob, to trigger a run of a particular simulation suite at a given time

### Required environment variables

* `AWS_ACCESS_KEY` - A AWS access key with read and write permissions to `BUCKET_NAME`.
* `AWS_SECRET_KEY` - A AWS secret key with read and write permissions to `BUCKET_NAME`.
* `AWS_REGION` - The AWS region where `BUCKET_NAME` is hosted. Defaults to `eu-north-1`.
* `BUCKET_NAME` - The name of an S3 bucket. You know, for state.
* `SLACK_SIGNING_SECRET` - A Slack signing secret, used to verify that requests from Slack are actually coming from Slack.
* `SLACK_TOKEN` - A Slack access token, for communicating with the Slack APIs.

### Simulation configuration

See [`src/config/index.ts`](src/config/index.ts) for a typical example configuration.

### Emojis, emojis, emojis

The Slack bot uses a lot of custom emojis.
Scanning the code base for emojis and installing them in your Slack workspace is left as an exercise to the reader. Sorry.