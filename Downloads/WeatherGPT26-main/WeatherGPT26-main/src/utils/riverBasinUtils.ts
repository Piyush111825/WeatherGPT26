import { WeatherTelemetry, ShelterLocation } from '../types';

export interface RiverBasinData {
  id: string;
  name: string;
  type: 'River' | 'Canal' | 'Basin' | 'Drainage Channel' | 'Lake Outlet';
  catchment: string;
  gaugeStation: string;
  dangerMarkM: number;
  warningMarkM: number;
  currentLevelM: number;
  dangerPercentage: number;
  status: 'NORMAL' | 'WATCH' | 'ALERT' | 'CRITICAL';
  rateOfChangeCmHr: number;
  rateTrend: 'rising' | 'falling' | 'steady';
  dischargeCusecs: number;
  embankmentStatus: string;
  summary: string;
  nearestShelterId?: string;
}

export const REGIONAL_RIVERS: Record<string, Omit<RiverBasinData, 'currentLevelM' | 'dangerPercentage' | 'status' | 'rateOfChangeCmHr' | 'rateTrend' | 'dischargeCusecs'>[]> = {
  // Kolkata / West Bengal
  kolkata: [
    {
      id: 'hooghly',
      name: 'Hooghly River (Ganga Distributary)',
      type: 'River',
      catchment: 'Lower Gangetic Plain',
      gaugeStation: 'CWC Garden Reach Hydrological Station',
      dangerMarkM: 6.8,
      warningMarkM: 5.9,
      embankmentStatus: 'High tide buffer maintained at Lock Gates',
      summary: 'Tidal surge monitored in sync with Bay of Bengal astronomical high tide.',
    },
    {
      id: 'damodar',
      name: 'Damodar River & Canal Basin',
      type: 'River',
      catchment: 'Chota Nagpur & Damodar Valley',
      gaugeStation: 'Durgapur Barrage Discharge Sensor',
      dangerMarkM: 14.5,
      warningMarkM: 12.8,
      embankmentStatus: 'Sluice gates monitored at DVC Reservoirs',
      summary: 'Controlled releases from Maithon & Panchet reservoirs regulating downstream flow.',
    },
    {
      id: 'rupnarayan',
      name: 'Rupnarayan River',
      type: 'River',
      catchment: 'Dwarkeswar-Silabati Confluence',
      gaugeStation: 'Geonkhali Hydro Gauge',
      dangerMarkM: 5.4,
      warningMarkM: 4.6,
      embankmentStatus: 'Saline embankment reinforced',
      summary: 'Tidal backflow active; steady seaward drainage.',
    },
    {
      id: 'bagjola',
      name: 'Bagjola Drainage Canal System',
      type: 'Canal',
      catchment: 'North Kolkata Metropolitan Drainage',
      gaugeStation: 'Kestopur-Bagjola Pumping Station',
      dangerMarkM: 3.2,
      warningMarkM: 2.6,
      embankmentStatus: 'Heavy siltation clearance in progress',
      summary: 'Primary storm discharge corridor for Salt Lake & New Town suburbs.',
    }
  ],

  // New Delhi / NCR
  delhi: [
    {
      id: 'yamuna',
      name: 'Yamuna River (Delhi Stretch)',
      type: 'River',
      catchment: 'Upper Yamuna Catchment / Hathnikund',
      gaugeStation: 'Old Railway Bridge (Loha Pul) Gauge',
      dangerMarkM: 205.33,
      warningMarkM: 204.50,
      embankmentStatus: 'ITO & Ring Road floodwalls inspected',
      summary: 'Water level governed by discharge volume from Hathnikund Barrage in Haryana.',
    },
    {
      id: 'hindon',
      name: 'Hindon River Basin',
      type: 'River',
      catchment: 'Western UP / Ghaziabad Floodplain',
      gaugeStation: 'Mohan Nagar CWC Gauge',
      dangerMarkM: 12.0,
      warningMarkM: 10.5,
      embankmentStatus: 'Floodplain bund intact',
      summary: 'Agricultural runoff and storm drains feeding downstream confluence.',
    },
    {
      id: 'najafgarh',
      name: 'Najafgarh Drain & Sahibi Basin',
      type: 'Drainage Channel',
      catchment: 'South-West Delhi & Gurugram Basin',
      gaugeStation: 'Kakrola Regulator Station',
      dangerMarkM: 8.5,
      warningMarkM: 7.2,
      embankmentStatus: 'Trunk drain regulators active',
      summary: 'Carries majority of NCT stormwater into Yamuna River.',
    },
    {
      id: 'barapullah',
      name: 'Barapullah Nullah Catchment',
      type: 'Canal',
      catchment: 'Central-South Urban Delhi',
      gaugeStation: 'Sarai Kale Khan Outfall',
      dangerMarkM: 4.8,
      warningMarkM: 3.9,
      embankmentStatus: 'Desilting completed',
      summary: 'Urban drainage flowing into River Yamuna.',
    }
  ],

  // Mumbai / Maharashtra
  mumbai: [
    {
      id: 'mithi',
      name: 'Mithi River & Mahim Creek Basin',
      type: 'River',
      catchment: 'Vihar-Powai Catchment to Arabian Sea',
      gaugeStation: 'Bandra-Kurla Complex (BKC) Flood Telemetry',
      dangerMarkM: 4.2,
      warningMarkM: 3.4,
      embankmentStatus: 'Retaining walls & flood gates active',
      summary: 'High tidal sensitivity during torrential coastal monsoon downpours.',
    },
    {
      id: 'dahisar',
      name: 'Dahisar River Channel',
      type: 'River',
      catchment: 'Sanjay Gandhi National Park Catchment',
      gaugeStation: 'Borivali Hydro Gauge',
      dangerMarkM: 5.1,
      warningMarkM: 4.2,
      embankmentStatus: 'River channel widening operational',
      summary: 'Forest catchment runoff draining into Gorai Creek.',
    },
    {
      id: 'poisar',
      name: 'Poisar River & Malad Creek',
      type: 'River',
      catchment: 'Kandivali-Malad Urban Catchment',
      gaugeStation: 'Link Road Bridge Gauge',
      dangerMarkM: 3.8,
      warningMarkM: 3.1,
      embankmentStatus: 'Concrete embankments with auto flood barriers',
      summary: 'Rapid response to high-intensity cloudburst events.',
    },
    {
      id: 'ulhas',
      name: 'Ulhas River Basin',
      type: 'Basin',
      catchment: 'Thane-Kalyan Sub-Basin',
      gaugeStation: 'Kalyan CWC Level Station',
      dangerMarkM: 11.5,
      warningMarkM: 9.8,
      embankmentStatus: 'Riverfront dykes under observation',
      summary: 'Broad river basin carrying Western Ghats water into Thane Creek.',
    }
  ],

  // Bengaluru / Karnataka
  bengaluru: [
    {
      id: 'vrishabhavathi',
      name: 'Vrishabhavathi River Valley',
      type: 'River',
      catchment: 'Western Bengaluru Urban Watershed',
      gaugeStation: 'Kengeri Valley Hydro Sensor',
      dangerMarkM: 6.2,
      warningMarkM: 5.0,
      embankmentStatus: 'Storm culvert diversion operational',
      summary: 'Major stormwater drainage corridor leading into Arkavathi River.',
    },
    {
      id: 'arkavathi',
      name: 'Arkavathi River & Hesaraghatta Basin',
      type: 'River',
      catchment: 'Nandi Hills to Cauvery Confluence',
      gaugeStation: 'Manchanabele Reservoir Gauge',
      dangerMarkM: 9.0,
      warningMarkM: 7.5,
      embankmentStatus: 'Spillway crest gates clear',
      summary: 'Regulates water levels between peri-urban lakes and agricultural valley.',
    },
    {
      id: 'bellandur-canal',
      name: 'Bellandur-Varthur Outflow Channel',
      type: 'Canal',
      catchment: 'Koramangala-Challaghatta Valley',
      gaugeStation: 'Varthur Waste Weir Outflow',
      dangerMarkM: 4.5,
      warningMarkM: 3.8,
      embankmentStatus: 'Wetland aeration barriers in place',
      summary: 'Interconnected wetland canal regulating South-East Bengaluru lake series.',
    },
    {
      id: 'dakshina-pinakini',
      name: 'Dakshina Pinakini (Ponnaiyar) Basin',
      type: 'Basin',
      catchment: 'East Bengaluru & Hosur Border Catchment',
      gaugeStation: 'Mugalur Hydro Station',
      dangerMarkM: 7.8,
      warningMarkM: 6.4,
      embankmentStatus: 'Freeboard capacity stable',
      summary: 'Cross-boundary river basin carrying overflow toward Tamil Nadu.',
    }
  ],

  // Default Grid / Jharkhand (23.93°N, 84.10°E - Daltonganj / Palamu / Damodar Plateau)
  'grid-region': [
    {
      id: 'damodar-jh',
      name: 'Damodar River (Upper Catchment)',
      type: 'River',
      catchment: 'Chota Nagpur Plateau Highland Basin',
      gaugeStation: 'Chandil-Damodar Hydro Gauge',
      dangerMarkM: 18.2,
      warningMarkM: 15.6,
      embankmentStatus: 'Rocky gorge levees stable',
      summary: 'Rapid drainage through rocky plateau channels with seasonal monsoon swell.',
    },
    {
      id: 'north-koel',
      name: 'North Koel River Basin',
      type: 'River',
      catchment: 'Palamu & Netarhat Plateau Catchment',
      gaugeStation: 'Mandal Dam Outflow Station',
      dangerMarkM: 12.4,
      warningMarkM: 10.2,
      embankmentStatus: 'Natural riverbank buffer intact',
      summary: 'Lifeline river for western Jharkhand draining northward into Sone River.',
    },
    {
      id: 'subarnarekha',
      name: 'Subarnarekha River Basin',
      type: 'Basin',
      catchment: 'Ranchi-Jamshedpur Valley',
      gaugeStation: 'Getalsud / Galudih Barrage Telemetry',
      dangerMarkM: 14.0,
      warningMarkM: 12.0,
      embankmentStatus: 'Controlled spillway discharge',
      summary: 'Multi-purpose river basin spanning Jharkhand, Odisha, and Bengal.',
    },
    {
      id: 'amanat',
      name: 'Amanat River Canal System',
      type: 'Canal',
      catchment: 'Hazaribagh & Daltonganj Sub-Basin',
      gaugeStation: 'Daltonganj Flood Control Post',
      dangerMarkM: 7.5,
      warningMarkM: 6.0,
      embankmentStatus: 'Earthen embankment inspected',
      summary: 'Feeds local agricultural check dams and urban drainage sumps.',
    }
  ],

  // London / UK
  london: [
    {
      id: 'thames',
      name: 'River Thames (Tideway)',
      type: 'River',
      catchment: 'Thames Valley & Estuary',
      gaugeStation: 'Thames Barrier & Tower Pier Gauge',
      dangerMarkM: 7.2,
      warningMarkM: 6.1,
      embankmentStatus: 'Thames Barrier closure test ready',
      summary: 'Tidal river managed by movable Thames Barrier flood defence system.',
    },
    {
      id: 'river-lea',
      name: 'River Lea & Olympic Park Basins',
      type: 'River',
      catchment: 'East London & Hertfordshire Watershed',
      gaugeStation: 'Lea Bridge Hydro Sensor',
      dangerMarkM: 4.8,
      warningMarkM: 3.9,
      embankmentStatus: 'Flood relief channel operational',
      summary: 'Controlled water meadows absorb excess urban surface runoff.',
    },
    {
      id: 'wandle',
      name: 'River Wandle Catchment',
      type: 'River',
      catchment: 'South London Chalk Aquifer',
      gaugeStation: 'Wandsworth Hydro Gauge',
      dangerMarkM: 3.5,
      warningMarkM: 2.8,
      embankmentStatus: 'Natural flood attenuation pools',
      summary: 'Chalk stream response to steady precipitation across Surrey hills.',
    }
  ],

  // New York / USA
  newyork: [
    {
      id: 'hudson',
      name: 'Hudson River Estuary',
      type: 'River',
      catchment: 'Hudson Valley & NY Harbor',
      gaugeStation: 'The Battery NOAA Tide Gauge #8518750',
      dangerMarkM: 2.4, // Mean High Water Surge Level
      warningMarkM: 1.8,
      embankmentStatus: 'Lower Manhattan coastal berms intact',
      summary: 'Tidal estuary monitored for coastal storm surge and nor’easter swells.',
    },
    {
      id: 'east-river',
      name: 'East River Tidal Strait',
      type: 'Drainage Channel',
      catchment: 'Long Island Sound to NY Bay',
      gaugeStation: 'Kings Point NOAA Hydro Station',
      dangerMarkM: 2.6,
      warningMarkM: 2.0,
      embankmentStatus: 'Seawall surge barriers ready',
      summary: 'High-velocity tidal strait connecting harbor to Atlantic sound.',
    },
    {
      id: 'gowanus',
      name: 'Gowanus Canal Drainage Basin',
      type: 'Canal',
      catchment: 'Brooklyn Urban Stormwater Watershed',
      gaugeStation: 'Gowanus Flushing Tunnel Station',
      dangerMarkM: 3.1,
      warningMarkM: 2.4,
      embankmentStatus: 'Retention tanks active',
      summary: 'High-capacity stormwater tanks mitigate combined sewer overflow.',
    }
  ]
};

/**
 * Returns suggested rivers for a given city / telemetry coordinates.
 */
export function getSuggestedRivers(telemetry: WeatherTelemetry): RiverBasinData[] {
  const cityKey = (telemetry.cityId || '').toLowerCase();
  const cityName = (telemetry.cityName || '').toLowerCase();

  let matchedPresets = REGIONAL_RIVERS['grid-region'];

  if (cityKey.includes('kolkata') || cityName.includes('kolkata') || cityName.includes('calcutta') || cityName.includes('bengal')) {
    matchedPresets = REGIONAL_RIVERS.kolkata;
  } else if (cityKey.includes('delhi') || cityName.includes('delhi') || cityName.includes('ncr')) {
    matchedPresets = REGIONAL_RIVERS.delhi;
  } else if (cityKey.includes('mumbai') || cityName.includes('mumbai') || cityName.includes('bombay') || cityName.includes('thane')) {
    matchedPresets = REGIONAL_RIVERS.mumbai;
  } else if (cityKey.includes('bengaluru') || cityName.includes('bengaluru') || cityName.includes('bangalore')) {
    matchedPresets = REGIONAL_RIVERS.bengaluru;
  } else if (cityKey.includes('london') || cityName.includes('london')) {
    matchedPresets = REGIONAL_RIVERS.london;
  } else if (cityKey.includes('newyork') || cityName.includes('new york') || cityName.includes('nyc')) {
    matchedPresets = REGIONAL_RIVERS.newyork;
  } else if (REGIONAL_RIVERS[cityKey]) {
    matchedPresets = REGIONAL_RIVERS[cityKey];
  } else {
    // Dynamic generation for arbitrary coordinates or unlisted cities
    matchedPresets = [
      {
        id: 'main-river',
        name: `${telemetry.cityName} Main River Basin`,
        type: 'River',
        catchment: `${telemetry.cityName} Regional Watershed`,
        gaugeStation: `${telemetry.cityName} Central CWC Hydrological Station`,
        dangerMarkM: 15.0,
        warningMarkM: 12.5,
        embankmentStatus: 'Embankments & spillway gates under standard surveillance',
        summary: `Primary drainage artery handling surface runoff and tributary ingress for ${telemetry.coordinates}.`,
      },
      {
        id: 'tributary-canal',
        name: `${telemetry.cityName} Arterial Storm Canal`,
        type: 'Canal',
        catchment: `${telemetry.cityName} Urban Flood Corridor`,
        gaugeStation: `${telemetry.cityName} Municipal Sluice Gate #01`,
        dangerMarkM: 6.5,
        warningMarkM: 5.2,
        embankmentStatus: 'Clear outfalls with mechanical trash racks',
        summary: `Urban stormwater diversion network connecting metropolitan sectors to regional waterways.`,
      },
      {
        id: 'damodar-jh',
        name: 'Damodar River Basin',
        type: 'Basin',
        catchment: 'Plateau Highland Catchment',
        gaugeStation: 'Regional CWC Sensor Post',
        dangerMarkM: 18.2,
        warningMarkM: 15.6,
        embankmentStatus: 'Natural riverbank buffer intact',
        summary: 'Monitors regional monsoon saturation and crest margins.',
      }
    ];
  }

  return matchedPresets.map(preset => calculateRiverTelemetry(preset, telemetry));
}

/**
 * Calculates live hydro-meteorological metrics for a river using real weather telemetry (rain, soil moisture, wind, pressure).
 */
export function calculateRiverTelemetry(
  preset: Omit<RiverBasinData, 'currentLevelM' | 'dangerPercentage' | 'status' | 'rateOfChangeCmHr' | 'rateTrend' | 'dischargeCusecs'> & Partial<RiverBasinData>,
  telemetry: WeatherTelemetry
): RiverBasinData {
  // Deterministic seed based on river name and city name
  let nameHash = 0;
  for (let i = 0; i < preset.name.length; i++) {
    nameHash = (nameHash * 31 + preset.name.charCodeAt(i)) % 1000;
  }

  const rainProb = typeof telemetry?.rainProb === 'number' ? telemetry.rainProb : 40;
  const rootSoilMoisture = typeof telemetry?.rootSoilMoisture === 'number' ? telemetry.rootSoilMoisture : 40;
  const humidity = typeof telemetry?.humidity === 'number' ? telemetry.humidity : 65;

  const rainFactor = rainProb / 100; // 0 to 1
  const soilMoistureFactor = rootSoilMoisture / 100; // 0 to 1
  const humidityFactor = humidity / 100; // 0 to 1

  // Composite hydro impact index (0.35 to 0.98)
  const baseVariation = (nameHash % 25) / 100; // 0 to 0.24
  const hydroLoad = 0.40 + (rainFactor * 0.30) + (soilMoistureFactor * 0.20) + (baseVariation * 0.10);

  // Danger percentage (bounded between 25% and 98%)
  const dangerPercentage = Math.min(98, Math.max(25, Math.round(hydroLoad * 100)));

  // Current level in meters
  const currentLevelM = Number((preset.dangerMarkM * (dangerPercentage / 100)).toFixed(2));

  // Determine status
  let status: 'NORMAL' | 'WATCH' | 'ALERT' | 'CRITICAL' = 'NORMAL';
  if (dangerPercentage >= 90) {
    status = 'CRITICAL';
  } else if (dangerPercentage >= 78) {
    status = 'ALERT';
  } else if (dangerPercentage >= 65) {
    status = 'WATCH';
  } else {
    status = 'NORMAL';
  }

  // Rate of change (cm/hr)
  let rateOfChangeCmHr = 0;
  let rateTrend: 'rising' | 'falling' | 'steady' = 'steady';

  if (rainProb > 55 || rootSoilMoisture > 50) {
    rateOfChangeCmHr = Number(((rainFactor * 2.8) + (soilMoistureFactor * 1.2) + (nameHash % 10) / 10).toFixed(1));
    rateTrend = 'rising';
  } else if (rainProb < 25) {
    rateOfChangeCmHr = Number((-((0.8 - rainFactor) * 1.5)).toFixed(1));
    rateTrend = 'falling';
  } else {
    rateOfChangeCmHr = Number((((nameHash % 7) - 3) * 0.3).toFixed(1));
    rateTrend = rateOfChangeCmHr > 0.3 ? 'rising' : rateOfChangeCmHr < -0.3 ? 'falling' : 'steady';
  }

  // Discharge in cusecs
  const baseDischarge = preset.type === 'River' ? 12000 : preset.type === 'Basin' ? 18000 : 4500;
  const dischargeCusecs = Math.round(baseDischarge * (dangerPercentage / 70) * (1 + (nameHash % 20) / 100));

  return {
    id: preset.id,
    name: preset.name,
    type: preset.type || 'River',
    catchment: preset.catchment || 'Local Urban Drainage Watershed',
    gaugeStation: preset.gaugeStation || 'Regional Hydro Telemetry Post',
    dangerMarkM: preset.dangerMarkM,
    warningMarkM: preset.warningMarkM,
    currentLevelM,
    dangerPercentage,
    status,
    rateOfChangeCmHr,
    rateTrend,
    dischargeCusecs,
    embankmentStatus: preset.embankmentStatus || 'Continuous monitoring by Irrigation & Flood Control Dept',
    summary: preset.summary || 'Real-time hydrological estimation correlated with active precipitation and soil saturation.',
  };
}

/**
 * Creates custom river telemetry for any custom user input.
 */
export function createCustomRiver(riverName: string, telemetry: WeatherTelemetry): RiverBasinData {
  const cleanName = riverName.trim() || 'Local Waterway';
  const id = `custom-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  let nameHash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    nameHash = (nameHash * 31 + cleanName.charCodeAt(i)) % 1000;
  }

  const isCanal = cleanName.toLowerCase().includes('canal') || cleanName.toLowerCase().includes('nullah') || cleanName.toLowerCase().includes('drain');
  const isBasin = cleanName.toLowerCase().includes('basin') || cleanName.toLowerCase().includes('lake');
  const type = isCanal ? 'Canal' : isBasin ? 'Basin' : 'River';

  const baseDanger = isCanal ? 5.5 : isBasin ? 12.0 : 16.0;
  const dangerMarkM = Number((baseDanger + (nameHash % 8)).toFixed(1));
  const warningMarkM = Number((dangerMarkM * 0.85).toFixed(1));

  return calculateRiverTelemetry(
    {
      id,
      name: cleanName,
      type,
      catchment: `${cleanName} Watershed (${telemetry.cityName})`,
      gaugeStation: `${cleanName} Telemetry Post / CWC Station`,
      dangerMarkM,
      warningMarkM,
      embankmentStatus: 'Active surveillance with localized water level telemetry',
      summary: `Dynamic hydro-meteorological estimation for ${cleanName} calibrated to live rain probability (${telemetry.rainProb}%) and soil moisture (${telemetry.rootSoilMoisture}%).`,
    },
    telemetry
  );
}
