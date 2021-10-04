export interface App {
  name: string;
  slackChannel: string;
  simulations: Simulation[];
}

export interface Simulation {
  type: 'error' | 'slow';
  properties: ErrorSimulationProperties | SlowSimulationProperties;
  target: ProbeUrl[];
  verify: ProbeUrl[];
}

export interface ErrorSimulationProperties extends SimulationProperties {
  status: number;
}

export interface SlowSimulationProperties extends SimulationProperties {
  timeout: number;
}

export interface SimulationProperties {
  whitelisted?: TrafficPattern;
  blacklisted?: TrafficPattern;
}

export interface TrafficPattern {
  paths?: string[];
  headers?: Header[];
}

export interface Header {
  key: string;
  value: string;
}

export interface ProbeUrl {
  url: string;
  method?: 'POST' | 'GET';
  json?: Object;
  headers?: Record<string, string>;
  expectedStatus?: number;
  expectedSlow?: number;
}

export interface ProbeResult {
  status?: number;
  totalTime?: number;
  probeUrl: ProbeUrl;
  result: boolean;
}

export interface SimulationContext {
  appKey: string;
  app: App;
  simulation: Simulation;
}

export interface SlackContext {
  obj: any;
  messages: string[];
  color: string;
  image?: string;
  user: string;
}

export interface Template {
  text: string;
  image: string;
}
