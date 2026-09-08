import { PriceTrendDataPoint, MedicineVolatilitySummary } from '../types';

export const MEDICINE_PRICE_HISTORIES: Record<string, PriceTrendDataPoint[]> = {
  // Januvia 100mg (Sitagliptin) - Dynamic patent off-cliff drop & generic competition influx
  'med-01': [
    {
      date: 'Sep 2025',
      shortDate: 'Sep 25',
      timestamp: 1726000000000,
      brandMrp: 445.0,
      lowestGenericPrice: 285.0,
      averageGenericPrice: 320.0,
      janAushadhiGovPrice: 95.0,
      volatilityIndex: 4.2,
      marketEvent: 'Pre-patent expiry baseline'
    },
    {
      date: 'Oct 2025',
      shortDate: 'Oct 25',
      timestamp: 1728600000000,
      brandMrp: 440.0,
      lowestGenericPrice: 260.0,
      averageGenericPrice: 295.0,
      janAushadhiGovPrice: 95.0,
      volatilityIndex: 6.8,
      marketEvent: 'First 3 generic ANDAs approved by CDSCO'
    },
    {
      date: 'Nov 2025',
      shortDate: 'Nov 25',
      timestamp: 1731200000000,
      brandMrp: 435.0,
      lowestGenericPrice: 210.0,
      averageGenericPrice: 250.0,
      janAushadhiGovPrice: 92.0,
      volatilityIndex: 12.5,
      marketEvent: 'Glenmark Zita 100 launched at 52% discount',
      eventSeverity: 'success'
    },
    {
      date: 'Dec 2025',
      shortDate: 'Dec 25',
      timestamp: 1733800000000,
      brandMrp: 435.0,
      lowestGenericPrice: 175.0,
      averageGenericPrice: 215.0,
      janAushadhiGovPrice: 92.0,
      volatilityIndex: 18.2,
      marketEvent: 'Lupin Sitaglu entered bidding war',
      eventSeverity: 'info'
    },
    {
      date: 'Jan 2026',
      shortDate: 'Jan 26',
      timestamp: 1736400000000,
      brandMrp: 435.0,
      lowestGenericPrice: 155.0,
      averageGenericPrice: 190.0,
      janAushadhiGovPrice: 90.0,
      volatilityIndex: 14.1,
      marketEvent: 'Retail pharmacy network price war'
    },
    {
      date: 'Feb 2026',
      shortDate: 'Feb 26',
      timestamp: 1739000000000,
      brandMrp: 435.0,
      lowestGenericPrice: 140.0,
      averageGenericPrice: 172.0,
      janAushadhiGovPrice: 90.0,
      volatilityIndex: 9.6,
      marketEvent: 'NPPA Price Ceiling revision notice',
      eventSeverity: 'warning'
    },
    {
      date: 'Mar 2026',
      shortDate: 'Mar 26',
      timestamp: 1741600000000,
      brandMrp: 435.0,
      lowestGenericPrice: 135.0,
      averageGenericPrice: 160.0,
      janAushadhiGovPrice: 88.0,
      volatilityIndex: 7.2
    },
    {
      date: 'Apr 2026',
      shortDate: 'Apr 26',
      timestamp: 1744200000000,
      brandMrp: 435.0,
      lowestGenericPrice: 130.0,
      averageGenericPrice: 152.0,
      janAushadhiGovPrice: 88.0,
      volatilityIndex: 5.4
    },
    {
      date: 'May 2026',
      shortDate: 'May 26',
      timestamp: 1746800000000,
      brandMrp: 435.0,
      lowestGenericPrice: 125.0,
      averageGenericPrice: 145.0,
      janAushadhiGovPrice: 85.0,
      volatilityIndex: 4.8
    },
    {
      date: 'Jun 2026',
      shortDate: 'Jun 26',
      timestamp: 1749400000000,
      brandMrp: 435.0,
      lowestGenericPrice: 122.0,
      averageGenericPrice: 140.0,
      janAushadhiGovPrice: 85.0,
      volatilityIndex: 3.5,
      marketEvent: 'Government Jan Aushadhi national expansion tender'
    },
    {
      date: 'Jul 2026',
      shortDate: 'Jul 26',
      timestamp: 1752000000000,
      brandMrp: 435.0,
      lowestGenericPrice: 120.0,
      averageGenericPrice: 138.0,
      janAushadhiGovPrice: 85.0,
      volatilityIndex: 3.1
    },
    {
      date: 'Aug 2026',
      shortDate: 'Aug 26',
      timestamp: 1754600000000,
      brandMrp: 435.0,
      lowestGenericPrice: 120.0,
      averageGenericPrice: 136.0,
      janAushadhiGovPrice: 85.0,
      volatilityIndex: 2.8,
      marketEvent: 'Current stable market equilibrium'
    }
  ],

  // Telma 40 (Telmisartan) - Mature, low-volatility compound
  'med-02': [
    {
      date: 'Sep 2025',
      shortDate: 'Sep 25',
      timestamp: 1726000000000,
      brandMrp: 145.0,
      lowestGenericPrice: 36.0,
      averageGenericPrice: 48.0,
      janAushadhiGovPrice: 14.0,
      volatilityIndex: 3.2
    },
    {
      date: 'Oct 2025',
      shortDate: 'Oct 25',
      timestamp: 1728600000000,
      brandMrp: 145.0,
      lowestGenericPrice: 34.0,
      averageGenericPrice: 46.0,
      janAushadhiGovPrice: 14.0,
      volatilityIndex: 3.0
    },
    {
      date: 'Nov 2025',
      shortDate: 'Nov 25',
      timestamp: 1731200000000,
      brandMrp: 145.0,
      lowestGenericPrice: 33.0,
      averageGenericPrice: 44.0,
      janAushadhiGovPrice: 14.0,
      volatilityIndex: 2.5
    },
    {
      date: 'Dec 2025',
      shortDate: 'Dec 25',
      timestamp: 1733800000000,
      brandMrp: 145.0,
      lowestGenericPrice: 32.0,
      averageGenericPrice: 42.0,
      janAushadhiGovPrice: 13.5,
      volatilityIndex: 2.1
    },
    {
      date: 'Jan 2026',
      shortDate: 'Jan 26',
      timestamp: 1736400000000,
      brandMrp: 145.0,
      lowestGenericPrice: 31.0,
      averageGenericPrice: 40.0,
      janAushadhiGovPrice: 13.5,
      volatilityIndex: 2.4
    },
    {
      date: 'Feb 2026',
      shortDate: 'Feb 26',
      timestamp: 1739000000000,
      brandMrp: 145.0,
      lowestGenericPrice: 30.0,
      averageGenericPrice: 39.0,
      janAushadhiGovPrice: 13.0,
      volatilityIndex: 2.8,
      marketEvent: 'NPPA annual DPCO wholesale review'
    },
    {
      date: 'Mar 2026',
      shortDate: 'Mar 26',
      timestamp: 1741600000000,
      brandMrp: 145.0,
      lowestGenericPrice: 29.5,
      averageGenericPrice: 38.0,
      janAushadhiGovPrice: 13.0,
      volatilityIndex: 1.9
    },
    {
      date: 'Apr 2026',
      shortDate: 'Apr 26',
      timestamp: 1744200000000,
      brandMrp: 145.0,
      lowestGenericPrice: 29.0,
      averageGenericPrice: 37.0,
      janAushadhiGovPrice: 13.0,
      volatilityIndex: 1.6
    },
    {
      date: 'May 2026',
      shortDate: 'May 26',
      timestamp: 1746800000000,
      brandMrp: 145.0,
      lowestGenericPrice: 29.0,
      averageGenericPrice: 36.5,
      janAushadhiGovPrice: 12.5,
      volatilityIndex: 1.4
    },
    {
      date: 'Jun 2026',
      shortDate: 'Jun 26',
      timestamp: 1749400000000,
      brandMrp: 145.0,
      lowestGenericPrice: 28.5,
      averageGenericPrice: 35.0,
      janAushadhiGovPrice: 12.5,
      volatilityIndex: 1.5
    },
    {
      date: 'Jul 2026',
      shortDate: 'Jul 26',
      timestamp: 1752000000000,
      brandMrp: 145.0,
      lowestGenericPrice: 28.0,
      averageGenericPrice: 34.5,
      janAushadhiGovPrice: 12.0,
      volatilityIndex: 1.2
    },
    {
      date: 'Aug 2026',
      shortDate: 'Aug 26',
      timestamp: 1754600000000,
      brandMrp: 145.0,
      lowestGenericPrice: 28.0,
      averageGenericPrice: 34.0,
      janAushadhiGovPrice: 12.0,
      volatilityIndex: 1.1,
      marketEvent: 'Zero API supply disruption; stable pricing'
    }
  ],

  // Crestor 10mg (Rosuvastatin)
  'med-03': [
    {
      date: 'Sep 2025',
      shortDate: 'Sep 25',
      timestamp: 1726000000000,
      brandMrp: 310.0,
      lowestGenericPrice: 85.0,
      averageGenericPrice: 110.0,
      janAushadhiGovPrice: 24.0,
      volatilityIndex: 4.8
    },
    {
      date: 'Oct 2025',
      shortDate: 'Oct 25',
      timestamp: 1728600000000,
      brandMrp: 310.0,
      lowestGenericPrice: 80.0,
      averageGenericPrice: 104.0,
      janAushadhiGovPrice: 24.0,
      volatilityIndex: 5.1
    },
    {
      date: 'Nov 2025',
      shortDate: 'Nov 25',
      timestamp: 1731200000000,
      brandMrp: 310.0,
      lowestGenericPrice: 75.0,
      averageGenericPrice: 98.0,
      janAushadhiGovPrice: 24.0,
      volatilityIndex: 6.3,
      marketEvent: 'Torrent Rozucor 10 gained tier-1 hospital formulary'
    },
    {
      date: 'Dec 2025',
      shortDate: 'Dec 25',
      timestamp: 1733800000000,
      brandMrp: 310.0,
      lowestGenericPrice: 70.0,
      averageGenericPrice: 92.0,
      janAushadhiGovPrice: 22.0,
      volatilityIndex: 7.0
    },
    {
      date: 'Jan 2026',
      shortDate: 'Jan 26',
      timestamp: 1736400000000,
      brandMrp: 310.0,
      lowestGenericPrice: 66.0,
      averageGenericPrice: 86.0,
      janAushadhiGovPrice: 22.0,
      volatilityIndex: 5.4
    },
    {
      date: 'Feb 2026',
      shortDate: 'Feb 26',
      timestamp: 1739000000000,
      brandMrp: 310.0,
      lowestGenericPrice: 64.0,
      averageGenericPrice: 82.0,
      janAushadhiGovPrice: 22.0,
      volatilityIndex: 4.6
    },
    {
      date: 'Mar 2026',
      shortDate: 'Mar 26',
      timestamp: 1741600000000,
      brandMrp: 310.0,
      lowestGenericPrice: 62.0,
      averageGenericPrice: 79.0,
      janAushadhiGovPrice: 20.0,
      volatilityIndex: 4.1
    },
    {
      date: 'Apr 2026',
      shortDate: 'Apr 26',
      timestamp: 1744200000000,
      brandMrp: 310.0,
      lowestGenericPrice: 60.0,
      averageGenericPrice: 75.0,
      janAushadhiGovPrice: 20.0,
      volatilityIndex: 3.5
    },
    {
      date: 'May 2026',
      shortDate: 'May 26',
      timestamp: 1746800000000,
      brandMrp: 310.0,
      lowestGenericPrice: 59.0,
      averageGenericPrice: 74.0,
      janAushadhiGovPrice: 20.0,
      volatilityIndex: 3.0
    },
    {
      date: 'Jun 2026',
      shortDate: 'Jun 26',
      timestamp: 1749400000000,
      brandMrp: 310.0,
      lowestGenericPrice: 58.0,
      averageGenericPrice: 72.0,
      janAushadhiGovPrice: 19.5,
      volatilityIndex: 2.7
    },
    {
      date: 'Jul 2026',
      shortDate: 'Jul 26',
      timestamp: 1752000000000,
      brandMrp: 310.0,
      lowestGenericPrice: 58.0,
      averageGenericPrice: 71.0,
      janAushadhiGovPrice: 19.5,
      volatilityIndex: 2.4
    },
    {
      date: 'Aug 2026',
      shortDate: 'Aug 26',
      timestamp: 1754600000000,
      brandMrp: 310.0,
      lowestGenericPrice: 58.0,
      averageGenericPrice: 70.0,
      janAushadhiGovPrice: 19.5,
      volatilityIndex: 2.1
    }
  ],

  // Augmentin 625 Duo (Amoxicillin + Clavulanic Acid) - High volatility due to API raw material import spike
  'med-04': [
    {
      date: 'Sep 2025',
      shortDate: 'Sep 25',
      timestamp: 1726000000000,
      brandMrp: 201.0,
      lowestGenericPrice: 88.0,
      averageGenericPrice: 115.0,
      janAushadhiGovPrice: 45.0,
      volatilityIndex: 5.2
    },
    {
      date: 'Oct 2025',
      shortDate: 'Oct 25',
      timestamp: 1728600000000,
      brandMrp: 201.0,
      lowestGenericPrice: 86.0,
      averageGenericPrice: 112.0,
      janAushadhiGovPrice: 45.0,
      volatilityIndex: 4.8
    },
    {
      date: 'Nov 2025',
      shortDate: 'Nov 25',
      timestamp: 1731200000000,
      brandMrp: 201.0,
      lowestGenericPrice: 95.0,
      averageGenericPrice: 122.0,
      janAushadhiGovPrice: 48.0,
      volatilityIndex: 14.5,
      marketEvent: 'Global Clavulanate Potassium fermentation shortage spike',
      eventSeverity: 'warning'
    },
    {
      date: 'Dec 2025',
      shortDate: 'Dec 25',
      timestamp: 1733800000000,
      brandMrp: 215.0,
      lowestGenericPrice: 118.0,
      averageGenericPrice: 145.0,
      janAushadhiGovPrice: 52.0,
      volatilityIndex: 24.8,
      marketEvent: 'Peak raw API spot pricing (+38% spike in raw materials)',
      eventSeverity: 'warning'
    },
    {
      date: 'Jan 2026',
      shortDate: 'Jan 26',
      timestamp: 1736400000000,
      brandMrp: 215.0,
      lowestGenericPrice: 110.0,
      averageGenericPrice: 138.0,
      janAushadhiGovPrice: 52.0,
      volatilityIndex: 18.2,
      marketEvent: 'Government emergency import duty waiver'
    },
    {
      date: 'Feb 2026',
      shortDate: 'Feb 26',
      timestamp: 1739000000000,
      brandMrp: 205.0,
      lowestGenericPrice: 98.0,
      averageGenericPrice: 124.0,
      janAushadhiGovPrice: 48.0,
      volatilityIndex: 12.4
    },
    {
      date: 'Mar 2026',
      shortDate: 'Mar 26',
      timestamp: 1741600000000,
      brandMrp: 205.0,
      lowestGenericPrice: 85.0,
      averageGenericPrice: 112.0,
      janAushadhiGovPrice: 46.0,
      volatilityIndex: 8.9,
      marketEvent: 'Domestic production plants normalized'
    },
    {
      date: 'Apr 2026',
      shortDate: 'Apr 26',
      timestamp: 1744200000000,
      brandMrp: 205.0,
      lowestGenericPrice: 78.0,
      averageGenericPrice: 104.0,
      janAushadhiGovPrice: 44.0,
      volatilityIndex: 6.4
    },
    {
      date: 'May 2026',
      shortDate: 'May 26',
      timestamp: 1746800000000,
      brandMrp: 205.0,
      lowestGenericPrice: 74.0,
      averageGenericPrice: 98.0,
      janAushadhiGovPrice: 42.0,
      volatilityIndex: 5.1
    },
    {
      date: 'Jun 2026',
      shortDate: 'Jun 26',
      timestamp: 1749400000000,
      brandMrp: 205.0,
      lowestGenericPrice: 72.0,
      averageGenericPrice: 94.0,
      janAushadhiGovPrice: 42.0,
      volatilityIndex: 4.2
    },
    {
      date: 'Jul 2026',
      shortDate: 'Jul 26',
      timestamp: 1752000000000,
      brandMrp: 205.0,
      lowestGenericPrice: 71.0,
      averageGenericPrice: 92.0,
      janAushadhiGovPrice: 40.0,
      volatilityIndex: 3.5
    },
    {
      date: 'Aug 2026',
      shortDate: 'Aug 26',
      timestamp: 1754600000000,
      brandMrp: 205.0,
      lowestGenericPrice: 70.0,
      averageGenericPrice: 90.0,
      janAushadhiGovPrice: 40.0,
      volatilityIndex: 3.0,
      marketEvent: 'Re-stabilized at 65.8% generic savings vs MRP'
    }
  ],

  // Pantocid 40 (Pantoprazole Sodium)
  'med-05': [
    {
      date: 'Sep 2025',
      shortDate: 'Sep 25',
      timestamp: 1726000000000,
      brandMrp: 165.0,
      lowestGenericPrice: 38.0,
      averageGenericPrice: 52.0,
      janAushadhiGovPrice: 16.0,
      volatilityIndex: 2.8
    },
    {
      date: 'Oct 2025',
      shortDate: 'Oct 25',
      timestamp: 1728600000000,
      brandMrp: 165.0,
      lowestGenericPrice: 36.0,
      averageGenericPrice: 50.0,
      janAushadhiGovPrice: 16.0,
      volatilityIndex: 2.5
    },
    {
      date: 'Nov 2025',
      shortDate: 'Nov 25',
      timestamp: 1731200000000,
      brandMrp: 165.0,
      lowestGenericPrice: 35.0,
      averageGenericPrice: 48.0,
      janAushadhiGovPrice: 15.0,
      volatilityIndex: 2.2
    },
    {
      date: 'Dec 2025',
      shortDate: 'Dec 25',
      timestamp: 1733800000000,
      brandMrp: 165.0,
      lowestGenericPrice: 34.0,
      averageGenericPrice: 47.0,
      janAushadhiGovPrice: 15.0,
      volatilityIndex: 2.0
    },
    {
      date: 'Jan 2026',
      shortDate: 'Jan 26',
      timestamp: 1736400000000,
      brandMrp: 165.0,
      lowestGenericPrice: 33.0,
      averageGenericPrice: 45.0,
      janAushadhiGovPrice: 15.0,
      volatilityIndex: 2.1
    },
    {
      date: 'Feb 2026',
      shortDate: 'Feb 26',
      timestamp: 1739000000000,
      brandMrp: 165.0,
      lowestGenericPrice: 32.0,
      averageGenericPrice: 44.0,
      janAushadhiGovPrice: 14.5,
      volatilityIndex: 1.9
    },
    {
      date: 'Mar 2026',
      shortDate: 'Mar 26',
      timestamp: 1741600000000,
      brandMrp: 165.0,
      lowestGenericPrice: 32.0,
      averageGenericPrice: 43.0,
      janAushadhiGovPrice: 14.5,
      volatilityIndex: 1.7
    },
    {
      date: 'Apr 2026',
      shortDate: 'Apr 26',
      timestamp: 1744200000000,
      brandMrp: 165.0,
      lowestGenericPrice: 31.0,
      averageGenericPrice: 42.0,
      janAushadhiGovPrice: 14.0,
      volatilityIndex: 1.5
    },
    {
      date: 'May 2026',
      shortDate: 'May 26',
      timestamp: 1746800000000,
      brandMrp: 165.0,
      lowestGenericPrice: 31.0,
      averageGenericPrice: 41.0,
      janAushadhiGovPrice: 14.0,
      volatilityIndex: 1.4
    },
    {
      date: 'Jun 2026',
      shortDate: 'Jun 26',
      timestamp: 1749400000000,
      brandMrp: 165.0,
      lowestGenericPrice: 30.0,
      averageGenericPrice: 40.0,
      janAushadhiGovPrice: 13.5,
      volatilityIndex: 1.3
    },
    {
      date: 'Jul 2026',
      shortDate: 'Jul 26',
      timestamp: 1752000000000,
      brandMrp: 165.0,
      lowestGenericPrice: 30.0,
      averageGenericPrice: 39.5,
      janAushadhiGovPrice: 13.5,
      volatilityIndex: 1.2
    },
    {
      date: 'Aug 2026',
      shortDate: 'Aug 26',
      timestamp: 1754600000000,
      brandMrp: 165.0,
      lowestGenericPrice: 29.5,
      averageGenericPrice: 39.0,
      janAushadhiGovPrice: 13.0,
      volatilityIndex: 1.1
    }
  ]
};

export const MEDICINE_VOLATILITY_SUMMARIES: MedicineVolatilitySummary[] = [
  {
    medicineId: 'med-01',
    medicineName: 'Januvia 100mg',
    activeSalt: 'Sitagliptin Phosphate',
    category: 'Anti-diabetic & Incretins',
    brandMrp: 435.0,
    currentGeneric: 120.0,
    volatilityScore: 18.2,
    volatilityLevel: 'High (Fluctuating)',
    priceRangeMin: 120.0,
    priceRangeMax: 285.0,
    priceDeltaPercent: -57.8,
    trendDirection: 'down',
    primaryDriver: 'Post-patent cliff generic competition surge'
  },
  {
    medicineId: 'med-04',
    medicineName: 'Augmentin 625 Duo',
    activeSalt: 'Amoxicillin + Clavulanate',
    category: 'Infectious Disease (Antibiotic)',
    brandMrp: 205.0,
    currentGeneric: 70.0,
    volatilityScore: 24.8,
    volatilityLevel: 'High (Fluctuating)',
    priceRangeMin: 70.0,
    priceRangeMax: 118.0,
    priceDeltaPercent: -20.4,
    trendDirection: 'down',
    primaryDriver: 'Q4 API spot shortage followed by price crash'
  },
  {
    medicineId: 'med-03',
    medicineName: 'Crestor 10mg',
    activeSalt: 'Rosuvastatin Calcium',
    category: 'Cardiovascular (Lipids)',
    brandMrp: 310.0,
    currentGeneric: 58.0,
    volatilityScore: 7.0,
    volatilityLevel: 'Moderate',
    priceRangeMin: 58.0,
    priceRangeMax: 85.0,
    priceDeltaPercent: -31.7,
    trendDirection: 'down',
    primaryDriver: 'Gradual hospital institutional formulary tender discounts'
  },
  {
    medicineId: 'med-02',
    medicineName: 'Telma 40',
    activeSalt: 'Telmisartan IP',
    category: 'Cardiovascular (Hypertension)',
    brandMrp: 145.0,
    currentGeneric: 28.0,
    volatilityScore: 3.2,
    volatilityLevel: 'Low (Stable)',
    priceRangeMin: 28.0,
    priceRangeMax: 36.0,
    priceDeltaPercent: -22.2,
    trendDirection: 'stable',
    primaryDriver: 'Mature commoditized compound with low price fluctuation'
  },
  {
    medicineId: 'med-05',
    medicineName: 'Pantocid 40',
    activeSalt: 'Pantoprazole Sodium',
    category: 'Gastroenterology',
    brandMrp: 165.0,
    currentGeneric: 29.5,
    volatilityScore: 2.8,
    volatilityLevel: 'Low (Stable)',
    priceRangeMin: 29.5,
    priceRangeMax: 38.0,
    priceDeltaPercent: -22.3,
    trendDirection: 'stable',
    primaryDriver: 'High bulk volume production with minimal raw material swings'
  }
];
