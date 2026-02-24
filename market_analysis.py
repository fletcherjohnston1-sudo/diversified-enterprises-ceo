#!/usr/bin/env python3
import csv
from datetime import datetime, timedelta

def parse_csv(data):
    """Parse CSV data and return list of (date, value) tuples, skipping missing values"""
    lines = data.strip().split('\n')
    reader = csv.reader(lines)
    header = next(reader)
    results = []
    for row in reader:
        if len(row) == 2 and row[1] and row[1] != '.':
            try:
                date = datetime.strptime(row[0], '%Y-%m-%d')
                value = float(row[1])
                results.append((date, value))
            except:
                pass
    return results

def get_value_on_date(data, target_date):
    """Get value on or before target_date"""
    for date, value in reversed(data):
        if date <= target_date:
            return value
    return None

def calc_change(current, previous):
    """Calculate change in points and percentage"""
    if previous is None or previous == 0:
        return None, None
    points = current - previous
    pct = (points / previous) * 100
    return points, pct

# Current date
now = datetime(2026, 2, 20)  # Last trading day with data
week_ago = now - timedelta(days=7)
month_ago = now - timedelta(days=30)
three_weeks_ago = now - timedelta(days=21)

# S&P 500 data
sp500_raw = """observation_date,SP500
2025-11-25,6765.88
2025-11-26,6812.61
2025-11-27,
2025-11-28,6849.09
2025-12-01,6812.63
2025-12-02,6829.37
2025-12-03,6849.72
2025-12-04,6857.12
2025-12-05,6870.40
2025-12-08,6846.51
2025-12-09,6840.51
2025-12-10,6886.68
2025-12-11,6901.00
2025-12-12,6827.41
2025-12-15,6816.51
2025-12-16,6800.26
2025-12-17,6721.43
2025-12-18,6774.76
2025-12-19,6834.50
2025-12-22,6878.49
2025-12-23,6909.79
2025-12-24,6932.05
2025-12-25,
2025-12-26,6929.94
2025-12-29,6905.74
2025-12-30,6896.24
2025-12-31,6845.50
2026-01-01,
2026-01-02,6858.47
2026-01-05,6902.05
2026-01-06,6944.82
2026-01-07,6920.93
2026-01-08,6921.46
2026-01-09,6966.28
2026-01-12,6977.27
2026-01-13,6963.74
2026-01-14,6926.60
2026-01-15,6944.47
2026-01-16,6940.01
2026-01-19,
2026-01-20,6796.86
2026-01-21,6875.62
2026-01-22,6913.35
2026-01-23,6915.61
2026-01-26,6950.23
2026-01-27,6978.60
2026-01-28,6978.03
2026-01-29,6969.01
2026-01-30,6939.03
2026-02-02,6976.44
2026-02-03,6917.81
2026-02-04,6882.72
2026-02-05,6798.40
2026-02-06,6932.30
2026-02-09,6964.82
2026-02-10,6941.81
2026-02-11,6941.47
2026-02-12,6832.76
2026-02-13,6836.17
2026-02-16,
2026-02-17,6843.22
2026-02-18,6881.31
2026-02-19,6861.89
2026-02-20,6909.51"""

nasdaq_raw = """observation_date,NASDAQCOM
2025-11-25,23025.590
2025-11-26,23214.690
2025-11-27,
2025-11-28,23365.690
2025-12-01,23275.920
2025-12-02,23413.670
2025-12-03,23454.090
2025-12-04,23505.140
2025-12-05,23578.130
2025-12-08,23545.900
2025-12-09,23576.490
2025-12-10,23654.160
2025-12-11,23593.860
2025-12-12,23195.170
2025-12-15,23057.410
2025-12-16,23111.460
2025-12-17,22693.320
2025-12-18,23006.360
2025-12-19,23307.620
2025-12-22,23428.830
2025-12-23,23561.840
2025-12-24,23613.310
2025-12-25,
2025-12-26,23593.100
2025-12-29,23474.350
2025-12-30,23419.080
2025-12-31,23241.990
2026-01-01,
2026-01-02,23235.630
2026-01-05,23395.820
2026-01-06,23547.170
2026-01-07,23584.270
2026-01-08,23480.020
2026-01-09,23671.350
2026-01-12,23733.900
2026-01-13,23709.870
2026-01-14,23471.750
2026-01-15,23530.020
2026-01-16,23515.390
2026-01-19,
2026-01-20,22954.320
2026-01-21,23224.820
2026-01-22,23436.020
2026-01-23,23501.240
2026-01-26,23601.360
2026-01-27,23817.100
2026-01-28,23857.450
2026-01-29,23685.120
2026-01-30,23461.820
2026-02-02,23592.110
2026-02-03,23255.190
2026-02-04,22904.580
2026-02-05,22540.590
2026-02-06,23031.210
2026-02-09,23238.670
2026-02-10,23102.470
2026-02-11,23066.470
2026-02-12,22597.150
2026-02-13,22546.670
2026-02-16,
2026-02-17,22578.380
2026-02-18,22753.630
2026-02-19,22682.730
2026-02-20,22886.070"""

djia_raw = """observation_date,DJIA
2025-11-25,47112.45
2025-11-26,47427.12
2025-11-27,
2025-11-28,47716.42
2025-12-01,47289.33
2025-12-02,47474.46
2025-12-03,47882.90
2025-12-04,47850.94
2025-12-05,47954.99
2025-12-08,47739.32
2025-12-09,47560.29
2025-12-10,48057.75
2025-12-11,48704.01
2025-12-12,48458.05
2025-12-15,48416.56
2025-12-16,48114.26
2025-12-17,47885.97
2025-12-18,47951.85
2025-12-19,48134.89
2025-12-22,48362.68
2025-12-23,48442.41
2025-12-24,48731.16
2025-12-25,
2025-12-26,48710.97
2025-12-29,48461.93
2025-12-30,48367.06
2025-12-31,48063.29
2026-01-01,
2026-01-02,48382.39
2026-01-05,48977.18
2026-01-06,49462.08
2026-01-07,48996.08
2026-01-08,49266.11
2026-01-09,49504.07
2026-01-12,49590.20
2026-01-13,49191.99
2026-01-14,49149.63
2026-01-15,49442.44
2026-01-16,49359.33
2026-01-19,
2026-01-20,48488.59
2026-01-21,49077.23
2026-01-22,49384.01
2026-01-23,49098.71
2026-01-26,49412.40
2026-01-27,49003.41
2026-01-28,49015.60
2026-01-29,49071.56
2026-01-30,48892.47
2026-02-02,49407.66
2026-02-03,49240.99
2026-02-04,49501.30
2026-02-05,48908.72
2026-02-06,50115.67
2026-02-09,50135.87
2026-02-10,50188.14
2026-02-11,50121.40
2026-02-12,49451.98
2026-02-13,49500.93
2026-02-16,
2026-02-17,49533.19
2026-02-18,49662.66
2026-02-19,49395.16
2026-02-20,49625.97"""

vix_raw = """observation_date,VIXCLS
2025-11-25,18.56
2025-11-26,17.19
2025-11-27,17.21
2025-11-28,16.35
2025-12-01,17.24
2025-12-02,16.59
2025-12-03,16.08
2025-12-04,15.78
2025-12-05,15.41
2025-12-08,16.66
2025-12-09,16.93
2025-12-10,15.77
2025-12-11,14.85
2025-12-12,15.74
2025-12-15,16.50
2025-12-16,16.48
2025-12-17,17.62
2025-12-18,16.87
2025-12-19,14.91
2025-12-22,14.08
2025-12-23,14.00
2025-12-24,13.47
2025-12-25,
2025-12-26,13.60
2025-12-29,14.20
2025-12-30,14.33
2025-12-31,14.95
2026-01-01,
2026-01-02,14.51
2026-01-05,14.90
2026-01-06,14.75
2026-01-07,15.38
2026-01-08,15.45
2026-01-09,14.49
2026-01-12,15.12
2026-01-13,15.98
2026-01-14,16.75
2026-01-15,15.84
2026-01-16,15.86
2026-01-19,18.84
2026-01-20,20.09
2026-01-21,16.90
2026-01-22,15.64
2026-01-23,16.09
2026-01-26,16.15
2026-01-27,16.35
2026-01-28,16.35
2026-01-29,16.88
2026-01-30,17.44
2026-02-02,16.34
2026-02-03,18.00
2026-02-04,18.64
2026-02-05,21.77
2026-02-06,17.76
2026-02-09,17.36
2026-02-10,17.79
2026-02-11,17.65
2026-02-12,20.82
2026-02-13,20.60
2026-02-16,21.20
2026-02-17,20.29
2026-02-18,19.62
2026-02-19,20.23"""

# Parse data
sp500 = parse_csv(sp500_raw)
nasdaq = parse_csv(nasdaq_raw)
djia = parse_csv(djia_raw)
vix = parse_csv(vix_raw)

# Get current values (Feb 20, 2026)
sp500_current = sp500[-1][1]
nasdaq_current = nasdaq[-1][1]
djia_current = djia[-1][1]
vix_current = get_value_on_date(vix, now)

# Get historical values
sp500_week = get_value_on_date(sp500, week_ago)
nasdaq_week = get_value_on_date(nasdaq, week_ago)
djia_week = get_value_on_date(djia, week_ago)

sp500_month = get_value_on_date(sp500, month_ago)
nasdaq_month = get_value_on_date(nasdaq, month_ago)
djia_month = get_value_on_date(djia, month_ago)

sp500_3weeks = get_value_on_date(sp500, three_weeks_ago)
nasdaq_3weeks = get_value_on_date(nasdaq, three_weeks_ago)
djia_3weeks = get_value_on_date(djia, three_weeks_ago)

# Calculate changes
sp500_w_pts, sp500_w_pct = calc_change(sp500_current, sp500_week)
nasdaq_w_pts, nasdaq_w_pct = calc_change(nasdaq_current, nasdaq_week)
djia_w_pts, djia_w_pct = calc_change(djia_current, djia_week)

sp500_m_pts, sp500_m_pct = calc_change(sp500_current, sp500_month)
nasdaq_m_pts, nasdaq_m_pct = calc_change(nasdaq_current, nasdaq_month)
djia_m_pts, djia_m_pct = calc_change(djia_current, djia_month)

# Print report
print("═══════════════════════════════════════════════════════")
print("        MORNING MARKET BRIEF - Monday, Feb 23, 2026")
print("═══════════════════════════════════════════════════════")
print()
print("📊 CURRENT CLOSES (as of Feb 20, 2026)")
print("───────────────────────────────────────────────────────")
print(f"  S&P 500:    {sp500_current:,.2f}")
print(f"  Nasdaq:     {nasdaq_current:,.2f}")
print(f"  Dow Jones:  {djia_current:,.2f}")
print(f"  VIX:        {vix_current:.2f}")
print()

print("📈 WEEKLY CHANGE (7 days)")
print("───────────────────────────────────────────────────────")
print(f"  S&P 500:    {sp500_w_pts:+.2f} pts ({sp500_w_pct:+.2f}%)")
print(f"  Nasdaq:     {nasdaq_w_pts:+.2f} pts ({nasdaq_w_pct:+.2f}%)")
print(f"  Dow Jones:  {djia_w_pts:+.2f} pts ({djia_w_pct:+.2f}%)")
print()

print("📅 MONTHLY CHANGE (30 days)")
print("───────────────────────────────────────────────────────")
print(f"  S&P 500:    {sp500_m_pts:+.2f} pts ({sp500_m_pct:+.2f}%)")
print(f"  Nasdaq:     {nasdaq_m_pts:+.2f} pts ({nasdaq_m_pct:+.2f}%)")
print(f"  Dow Jones:  {djia_m_pts:+.2f} pts ({djia_m_pct:+.2f}%)")
print()

# 3-week trend analysis
print("📉 3-WEEK TREND SUMMARY")
print("───────────────────────────────────────────────────────")
print(f"From Jan 30 to Feb 20:")
print(f"  S&P 500:    {sp500_3weeks:.2f} → {sp500_current:.2f} ({(sp500_current-sp500_3weeks)/sp500_3weeks*100:+.2f}%)")
print(f"  Nasdaq:     {nasdaq_3weeks:.2f} → {nasdaq_current:.2f} ({(nasdaq_current-nasdaq_3weeks)/nasdaq_3weeks*100:+.2f}%)")
print(f"  Dow Jones:  {djia_3weeks:.2f} → {djia_current:.2f} ({(djia_current-djia_3weeks)/djia_3weeks*100:+.2f}%)")
print()

print("🔍 KEY CONTEXT")
print("───────────────────────────────────────────────────────")

# Calculate key levels and observations
sp500_high = max([v for d, v in sp500[-30:]])
sp500_low = min([v for d, v in sp500[-30:]])
vix_recent_high = max([v for d, v in vix[-10:]])

print(f"• S&P 500 trading near {sp500_current:,.2f}")
print(f"  - 30-day range: {sp500_low:,.2f} - {sp500_high:,.2f}")
print(f"  - Distance from 30-day high: {((sp500_current-sp500_high)/sp500_high*100):.2f}%")
print()
print(f"• VIX at {vix_current:.2f} (recent peak: {vix_recent_high:.2f})")
if vix_current > 20:
    print("  - Elevated volatility persists")
elif vix_current > 17:
    print("  - Moderately elevated volatility")
else:
    print("  - Volatility normalizing")
print()

# Market direction
if sp500_w_pct > 0 and nasdaq_w_pct > 0 and djia_w_pct > 0:
    print("• Broad market strength across all indices")
elif sp500_w_pct < 0 and nasdaq_w_pct < 0 and djia_w_pct < 0:
    print("• Weakness across all major indices")
else:
    print("• Mixed performance across indices")

if sp500_m_pct < -2:
    print("• S&P 500 down significantly over 30 days")
elif sp500_m_pct > 2:
    print("• S&P 500 showing strong monthly gains")
else:
    print("• S&P 500 consolidating in recent range")
    
print()
print("═══════════════════════════════════════════════════════")
