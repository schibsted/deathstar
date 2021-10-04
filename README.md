![Death Star](deathstar.jpg)

Clouds are **chaotic**.<br />
**Unexpected events** happen all the time.<br />
Death Star helps us in **being proactive** and making sure we can **withstand disturbances in the cloud**.

Death Star is a way of creating controlled outage simulations and other types of simulated chaos in our environments, through the means of a Slack bot.

Its purpose is to, by creating our own short and controlled misbehaviours,...

- 🅰️ identify areas for improvement and...
- 🅱️ ensure we have enough error handling and other resilience capabilities in place so that our end users aren't significantly affected when we are in fact suffering behind the scenes.

### How does it work?

Death Star comes in two parts,...

- a Slack bot (this repo), which can be seen as the Death Star control plane. It is responsible for coordinating and carrying out simulations and...
- a middleware that need to be included in all services that are to be attacked by Death Star

The middleware act on signals from the Death Star control plane. Signals that are broadcasted during an outage simulation.

<a href="https://docs.google.com/drawings/d/1vuGsxQV6C2ggSQ-Fmfb195U48jDyO6awa9fXyeqOpAg/edit"><img src="https://docs.google.com/drawings/d/e/2PACX-1vTJ9IzmknGF72W6tFJyG0Ef4PLeKruBMglTd2n486AQsfGyknZOtgFzHd9odVx_Cz-9h3nVz3IbZJJa/pub?w=1438&amp;h=848"></a>

### Mkay, what is it capable of?

Death Star currently supports the following simulations:

- **`error`** - make the target under attack throw errors
- **`slow`** - make the target extremely slooow

All simulations can be applied to either all endpoints of a service or a selected few endpoints.

It's also possible to define a list of endpoints and HTTP headers that should be excluded from a simulation, because it might be that the same service is used to serve both external and internal users and we may or may not have the same resilience level in both use cases.

### How is this different from other chaos engineering tools?

For example, it differs from the most iconic chaos engineering tool Chaos Monkey, in various ways.

Death Star operates on the application level. It does not fiddle anything with the underlying infrastructure.

This means that Death Star works in exactly the same way, no matter if it's running on EC2, Heroku, Kubernetes, ECS or as a standalone service on someone's laptop.

It also means that it has the potential of carrying through more intelligent and tailored attacks, attacks that for example only target a predefined request pattern.

Part of the reasoning behind not touching the actual infrastructure comes from the fact that we (CNP) operate on a fairly high abstraction level. AWS manage most of our infrastructure and we should be able to trust them to for example launch new EC2 hosts if a few of ours die. Our time and energy is arguably better spent on making sure our applications are built to handle failure.

### What's the deal with the Star Wars theme?

Ehm... next question!
