const swisseph = require('swisseph');
const chartService = require('../src/services/chartService');

describe('Birth Chart Calculation Engine', () => {
  // Mock data for consistent testing
  const testBirthData = {
    birthDate: '1990-01-01', // January 1, 1990
    birthTime: '12:00',      // 12:00 PM
    birthPlace: 'New York, USA',
    latitude: 40.7128,       // New York latitude
    longitude: -74.0060      // New York longitude
  };
  
  // Set up Swiss Ephemeris before tests
  beforeAll(() => {
    // Ensure ephemeris is set up properly
    const path = require('path');
    const ephePath = path.join(__dirname, '../ephe');
    swisseph.swe_set_ephe_path(ephePath);
  });
  
  test('Calculate Julian Day correctly', () => {
    // Expected Julian Day for January 1, 1990, 12:00 PM UTC
    const expectedJD = 2447893.0; // Approximate value
    
    // Calculate Julian Day directly for comparison
    const testDate = new Date('1990-01-01T12:00:00Z');
    const calculatedJD = swisseph.swe_julday(
      testDate.getUTCFullYear(),
      testDate.getUTCMonth() + 1,
      testDate.getUTCDate(),
      testDate.getUTCHours() + testDate.getUTCMinutes() / 60,
      swisseph.SE_GREG_CAL
    );
    
    // Allow for a small margin of error
    expect(Math.abs(calculatedJD - expectedJD)).toBeLessThan(0.1);
  });
  
  test('Calculate correct Sun position', async () => {
    // For January 1, 1990, the Sun should be in Capricorn
    const chart = await chartService.calculateBirthChart(testBirthData);
    const sun = chart.planets.find(p => p.name === 'Sun');
    
    expect(sun).toBeDefined();
    expect(sun.sign).toBe('Capricorn');
  });
  
  test('Calculate correct Moon position', async () => {
    const chart = await chartService.calculateBirthChart(testBirthData);
    const moon = chart.planets.find(p => p.name === 'Moon');
    
    expect(moon).toBeDefined();
    // We're not checking exact sign as it moves quickly and depends on exact time
    expect(moon.sign).toBeDefined();
  });
  
  test('Calculate houses correctly', async () => {
    const chart = await chartService.calculateBirthChart(testBirthData);
    
    // Should have 12 houses
    expect(chart.houses.length).toBe(12);
    
    // Houses should be numbered 1-12
    const houseNumbers = chart.houses.map(h => h.house);
    for (let i = 1; i <= 12; i++) {
      expect(houseNumbers).toContain(i);
    }
  });
  
  test('Calculate aspects correctly', async () => {
    const chart = await chartService.calculateBirthChart(testBirthData);
    
    // Should have at least some aspects
    expect(chart.aspects.length).toBeGreaterThan(0);
    
    // Verify aspect structure
    const firstAspect = chart.aspects[0];
    expect(firstAspect).toHaveProperty('planet1');
    expect(firstAspect).toHaveProperty('planet2');
    expect(firstAspect).toHaveProperty('type');
    expect(firstAspect).toHaveProperty('orb');
    
    // Aspect types should be from our defined list
    const validAspectTypes = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'];
    expect(validAspectTypes).toContain(firstAspect.type);
  });
  
  test('Generate interpretations correctly', async () => {
    const chart = await chartService.calculateBirthChart(testBirthData);
    
    // Should have interpretations
    expect(chart).toHaveProperty('interpretations');
    
    // Check interpretation structure
    const interpretations = chart.interpretations;
    expect(interpretations).toHaveProperty('ascendant');
    expect(interpretations).toHaveProperty('planetaryPositions');
    expect(interpretations).toHaveProperty('houseSystem');
    expect(interpretations).toHaveProperty('aspects');
    expect(interpretations).toHaveProperty('summary');
    
    // Verify planetary interpretations
    const planetInterpretations = interpretations.planetaryPositions;
    expect(planetInterpretations.length).toBeGreaterThan(0);
    
    // Each planet should have a title and description
    planetInterpretations.forEach(planet => {
      expect(planet).toHaveProperty('title');
      expect(planet).toHaveProperty('description');
      expect(typeof planet.description).toBe('string');
      expect(planet.description.length).toBeGreaterThan(10);
    });
  });
  
  test('Support different house systems', async () => {
    // Test with Placidus
    const placidusChart = await chartService.calculateBirthChart({
      ...testBirthData,
      houseSystem: 'placidus'
    });
    
    // Test with Whole Sign
    const wholeSignChart = await chartService.calculateBirthChart({
      ...testBirthData,
      houseSystem: 'whole-sign'
    });
    
    // Houses should be different between the two systems
    let isDifferent = false;
    for (let i = 0; i < 12; i++) {
      if (placidusChart.houses[i].sign !== wholeSignChart.houses[i].sign ||
          Math.abs(placidusChart.houses[i].degree - wholeSignChart.houses[i].degree) > 1) {
        isDifferent = true;
        break;
      }
    }
    
    expect(isDifferent).toBe(true);
  });
});
