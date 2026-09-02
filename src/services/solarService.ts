export interface SolarState {
  isDaytime: boolean;
  sunriseTime: string;
  sunsetTime: string;
  solarProgressPercent: number; // 0% at sunrise, 100% at sunset
  solarPhase: 'Dawn' | 'Daylight' | 'Golden Hour' | 'Dusk' | 'Night';
}

export function calculateSolarState(): SolarState {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Standard Solar Epoch (Sunrise 06:00 = 360m, Sunset 18:30 = 1110m)
  const sunriseMinutes = 6 * 60;
  const sunsetMinutes = 18 * 60 + 30;

  const isDaytime = currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes;

  let solarPhase: SolarState['solarPhase'] = 'Night';
  let solarProgressPercent = 0;

  if (currentMinutes >= sunriseMinutes - 30 && currentMinutes < sunriseMinutes + 30) {
    solarPhase = 'Dawn';
  } else if (currentMinutes >= sunsetMinutes - 45 && currentMinutes < sunsetMinutes) {
    solarPhase = 'Golden Hour';
  } else if (currentMinutes >= sunsetMinutes && currentMinutes < sunsetMinutes + 45) {
    solarPhase = 'Dusk';
  } else if (isDaytime) {
    solarPhase = 'Daylight';
  } else {
    solarPhase = 'Night';
  }

  if (isDaytime) {
    solarProgressPercent = Math.round(
      ((currentMinutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes)) * 100
    );
  } else {
    solarProgressPercent = 0;
  }

  return {
    isDaytime,
    sunriseTime: '06:00 AM',
    sunsetTime: '06:30 PM',
    solarProgressPercent,
    solarPhase,
  };
}
