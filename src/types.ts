export type OperationalPersona = 'citizen' | 'farmer' | 'disaster' | 'authority';

export interface WeatherTelemetry {
  cityId: string;
  cityName: string;
  coordinates: string;
  condition: string;
  conditionDescription: string;
  temp: number;
  feelsLike: number;
  rainProb: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  aqi: number;
  aqiStatus: string;
  pm25?: number;
  pm10?: number;
  uvIndex: number;
  uvStatus: string;
  confidence: number;
  stationConfidence: number;
  rootSoilMoisture: number;
  subsoilMoisture: number;
  evapotranspiration: number;
  soilTemp: number;
  surfacePressure: number;
  dewPoint: number;
  visibilityKm: number;
  cloudCover: number;
  timestamp: string;
  hourlyData?: any[];
  dailyData?: any[];
}

export interface SituationScenario {
  id: string;
  title: string;
  iconName: string;
  decision: string;
  decisionType: 'positive' | 'caution' | 'danger';
  confidence: number;
  confidenceLevel: string;
  whyExplanation: string;
  rainProb: number;
  rainThreshold: string;
  aqi: number;
  aqiThreshold: string;
  windSpeed: number;
  windThreshold: string;
  feelsLike: number;
  tempThreshold: string;
  recommendedAction: string;
  recheckInterval: string;
}

export interface ForecastWindow {
  horizon: string;
  label: string;
  temp: number;
  feelsLike: number;
  rainProb: number;
  risk: 'STABLE' | 'WATCH' | 'CAUTION' | 'LOW';
  confidence: number;
  condition: string;
  whatChanged: string;
  whyChanged: string;
  whatToExpect: string;
  recommendedAction: string;
}

export interface PlanEvaluationResult {
  query: string;
  riskLevel: string;
  riskClass: 'green' | 'yellow' | 'red';
  impactDescription: string;
  whatToExpect: string;
  aiRecommendation: string;
  bestTimeWindow: string;
}

export interface SmartAlertItem {
  id: string;
  title: string;
  severity: 'Advisory' | 'Moderate' | 'High' | 'Critical';
  severityColor: string;
  summary: string;
  timeWindow: string;
  details: string;
  iconName: string;
}

export interface DiurnalPoint {
  time: string;
  today: number;
  oneYearAgo: number;
  fiveYearBaseline: number;
}

export interface ClimateYearComparison {
  year: number | string;
  temp: number;
  minMax: string;
  precipitation: string;
  peakWind: string;
  label: string;
  anomaly?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'weathergpt';
  text: string;
  timestamp: string;
  grounded?: boolean;
  confidence?: number;
  telemetrySummary?: string;
  category?: string;
}

export interface FarmDirective {
  id: string;
  title: string;
  decision: string;
  status: 'positive' | 'delay' | 'critical';
  rationale: string;
  recommendedAction: string;
  metric1: string;
  metric2: string;
}

export interface BioIndicatorItem {
  id: string;
  name: string;
  icon: string;
  baselineWeight: number;
  implication: string;
  phenologyNote: string;
  active: boolean;
}

export interface ShelterLocation {
  id: string;
  name: string;
  address?: string;
  distanceKm: number;
  capacity: string;
  occupancy: string;
  amenities: string[];
  contact: string;
  status: 'Open' | 'Standby' | 'Full';
}
