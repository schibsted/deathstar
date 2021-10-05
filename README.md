# :boom: Death Star – Application-level chaos engineering
###### _Because a little chaos is good for you._

Clouds are **chaotic**.<br />
**Unexpected events** happen all the time.<br />
Death Star is here to help us **being proactive** and ensuring we can **withstand disturbances in the cloud**.

### Wait what, what's Death Star?

It's application-level chaos engineering.<br />
A way of creating controlled outage simulations and other types of simulated chaos, through the means of a Slack bot.

The underlying idea is that, by creating our own short and controlled misbehaviours, we can...

- 🅰️ identify areas for improvement and...
- 🅱️ ensure there's enough error handling and other resilience capabilities in place to avoid too much suffering, even though things are on fire behind the scenes.

A more in-depth reasoning and background can be found in this article: [INSERT LINK HERE](https://lolololol.rofl).

### How does it work?

Death Star comes in two parts,...

- a Slack bot (this repo), which can be seen as the Death Star control plane. It is responsible for coordinating and carrying out simulations and...
- a middleware that need to be included in all services that are to be attacked by Death Star

The middleware act on signals from the Death Star control plane. Signals that are broadcasted during an outage simulation.

<a href="https://docs.google.com/drawings/d/1vuGsxQV6C2ggSQ-Fmfb195U48jDyO6awa9fXyeqOpAg/edit"><img src="https://docs.google.com/drawings/d/e/2PACX-1vTJ9IzmknGF72W6tFJyG0Ef4PLeKruBMglTd2n486AQsfGyknZOtgFzHd9odVx_Cz-9h3nVz3IbZJJa/pub?w=1438&amp;h=848"></a>

### Mkay, what is it capable of?

Death Star currently supports the following simulations:

- **`error`** - make the target under attack throw HTTP errors
- **`slow`** - make the target extremely slooow

All simulations can be applied to either all endpoints of a service or a selected few endpoints.

It's also possible to define a list of endpoints and HTTP headers that should be excluded from a simulation, because it might be that the same service is used to serve both external and internal users and we may or may not have the same resilience level in both use cases.

### Getting started

* `git clone`, `npm install` and `npm run build`
* Make necessary changes to `src/config`
* `npm run start:web` to launch the control plane
* `npm run start:trigger my-org/my-app` as a cronjob, to trigger a run of a partiular simulation suite at a given time

### Required environment variables

* `AWS_ACCESS_KEY` - A AWS access key with write and read access to `BUCKET_NAME`.
* `AWS_SECRET_KEY` - A AWS secret key with write and read access to `BUCKET_NAME`.
* `AWS_REGION` - The AWS region where `BUCKET_NAME` is hosted. Defaults to `eu-north-1`.
* `BUCKET_NAME` - The name of a S3 bucket. You know, for state.
* `SLACK_SIGNING_SECRET` - A Slack signing secret, used to verify that requests from Slack are actually coming from Slack.
* `SLACK_TOKEN` - A Slack access token, for communicating with the Slack APIs.

### Simulation configuration

See [`src/config/index.ts`](src/config/index.ts) for a typical example configuration.