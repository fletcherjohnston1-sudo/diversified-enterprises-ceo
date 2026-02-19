import { NextResponse } from 'next/server';
import fs from 'fs';

const GARMIN_FILE = '/home/clawd/.openclaw/shared-data/garmin/today.json';

export async function GET() {
  const healthData: any = {
    garmin: null,
    lastUpdated: new Date().toISOString(),
  };

  try {
    if (fs.existsSync(GARMIN_FILE)) {
      const data = JSON.parse(fs.readFileSync(GARMIN_FILE, 'utf-8'));
      
      // Training Readiness
      const tr = Array.isArray(data.training_readiness) ? data.training_readiness[0] : data.training_readiness;
      
      // Sleep
      const sleepDTO = data.sleep?.dailySleepDTO;
      const sleepScores = sleepDTO?.sleepScores;
      const sleepScore = sleepScores?.overall?.value;
      
      // Body Battery - get latest value from array
      const bb = Array.isArray(data.body_battery) ? data.body_battery[0] : null;
      const bbValues = bb?.bodyBatteryValuesArray;
      const bodyBattery = Array.isArray(bbValues) && bbValues.length > 0 
        ? bbValues[bbValues.length - 1][1] 
        : null;
      
      // Heart Rate
      const hrData = data.heart_rate?.allMetrics?.metricsMap?.WELLNESS_RESTING_HEART_RATE;
      const restingHR = Array.isArray(hrData) ? hrData[0]?.value : null;
      
      // Stress
      const stressLevel = data.stress?.avgStressLevel;
      
      // Steps
      const steps = (data.steps || []).reduce((sum: number, s: any) => sum + (s.steps || 0), 0);

      healthData.garmin = {
        date: data.date,
        training_readiness: {
          score: tr?.score || null,
          level: tr?.level || 'Unknown',
        },
        sleep_score: sleepScore || null,
        body_battery: bodyBattery || null,
        resting_hr: restingHR || null,
        stress_level: stressLevel || null,
        steps: steps,
      };
    }
  } catch (error) {
    console.error('Error loading Garmin data:', error);
  }

  return NextResponse.json(healthData);
}
