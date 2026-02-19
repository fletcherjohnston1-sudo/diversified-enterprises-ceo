'use client';

import { useEffect, useState } from 'react';

interface GarminData {
  date?: string;
  training_readiness?: {
    score: number | null;
    level: string;
  };
  sleep_score?: number | null;
  body_battery?: number | null;
  resting_hr?: number | null;
  stress_level?: number | null;
  steps?: number;
}

interface HealthData {
  garmin: GarminData | null;
  lastUpdated: string;
}

function getReadinessColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'HIGH': return '#22c55e';
    case 'MODERATE': return '#eab308';
    case 'LOW': return '#ef4444';
    default: return '#6b7280';
  }
}

function getReadinessEmoji(level: string): string {
  switch (level?.toUpperCase()) {
    case 'HIGH': return '🔥';
    case 'MODERATE': return '⚖️';
    case 'LOW': return '⚠️';
    default: return '📊';
  }
}

function MetricCard({ label, value, unit, emoji, color }: { 
  label: string; 
  value: number | string | null; 
  unit?: string; 
  emoji?: string;
  color?: string;
}) {
  if (value === null || value === undefined) return null;
  
  return (
    <div style={{
      backgroundColor: '#141414',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #2a2a2a',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{emoji || '📊'}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || '#fff', marginBottom: '4px' }}>
        {value}{unit && <span style={{ fontSize: '16px', color: '#9ca3af' }}>{unit}</span>}
      </div>
      <div style={{ fontSize: '14px', color: '#9ca3af' }}>{label}</div>
    </div>
  );
}

function GarminWidget({ data }: { data: GarminData | null }) {
  if (!data) {
    return (
      <div style={{
        backgroundColor: '#141414',
        borderRadius: '12px',
        padding: '40px',
        border: '1px solid #2a2a2a',
        textAlign: 'center',
        color: '#9ca3af',
      }}>
        No Garmin data available
      </div>
    );
  }

  const { training_readiness, sleep_score, body_battery, resting_hr, stress_level, steps } = data;

  return (
    <div style={{
      backgroundColor: '#141414',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #2a2a2a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          🏃 Garmin Health
        </h2>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {data.date || 'Today'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <MetricCard 
          label="Training Readiness" 
          value={training_readiness?.score ?? null} 
          unit="/100"
          emoji={getReadinessEmoji(training_readiness?.level || '')}
          color={getReadinessColor(training_readiness?.level || '')}
        />
        <MetricCard 
          label="Sleep Score" 
          value={sleep_score ?? null} 
          unit="/100"
          emoji="😴"
        />
        <MetricCard 
          label="Body Battery" 
          value={body_battery ?? null} 
          unit="/100"
          emoji="🔋"
          color={body_battery && body_battery < 50 ? '#ef4444' : body_battery && body_battery < 70 ? '#eab308' : '#22c55e'}
        />
        <MetricCard 
          label="Resting HR" 
          value={resting_hr ?? null} 
          unit="bpm"
          emoji="❤️"
        />
        <MetricCard 
          label="Stress" 
          value={stress_level ?? null} 
          unit="/100"
          emoji="🧠"
          color={stress_level && stress_level > 70 ? '#ef4444' : stress_level && stress_level > 40 ? '#eab308' : '#22c55e'}
        />
        <MetricCard 
          label="Steps" 
          value={steps ? steps.toLocaleString() : null} 
          emoji="👟"
        />
      </div>

      {training_readiness?.level && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: getReadinessColor(training_readiness.level) + '20',
          borderRadius: '8px',
          border: `1px solid ${getReadinessColor(training_readiness.level)}`,
          color: getReadinessColor(training_readiness.level),
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {getReadinessEmoji(training_readiness.level)} Training Readiness: {training_readiness.level}
        </div>
      )}
    </div>
  );
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealthData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load health data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', color: '#9ca3af' }}>
        Loading health data...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '24px' }}>
        💪 Health Dashboard
      </h1>

      {/* Garmin Widget */}
      <div style={{ marginBottom: '32px' }}>
        <GarminWidget data={healthData?.garmin || null} />
      </div>

      {/* Placeholder for future health data sources */}
      <div style={{ 
        backgroundColor: '#141414', 
        borderRadius: '12px', 
        padding: '24px', 
        border: '1px solid #2a2a2a',
        color: '#6b7280',
        textAlign: 'center',
      }}>
        <p>Additional health integrations coming soon...</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          Consider adding: Strava, Whoop, Oura, Apple Health, nutrition logs
        </p>
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        Last updated: {healthData?.lastUpdated ? new Date(healthData.lastUpdated).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
}
