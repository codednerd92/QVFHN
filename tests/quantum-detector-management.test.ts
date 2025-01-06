import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let detectorCount = 0;
const detectors = new Map();

// Simulated contract functions
function registerDetector(location: string, detectorType: string, efficiency: number, owner: string) {
  const detectorId = ++detectorCount;
  detectors.set(detectorId, {
    owner,
    location,
    type: detectorType,
    efficiency,
    status: "active",
    energyHarvested: 0,
    lastMaintenance: Date.now()
  });
  return detectorId;
}

function updateDetectorStatus(detectorId: number, newStatus: string, updater: string) {
  const detector = detectors.get(detectorId);
  if (!detector) throw new Error('Invalid detector');
  if (detector.owner !== updater) throw new Error('Not authorized');
  if (!['active', 'maintenance', 'inactive'].includes(newStatus)) throw new Error('Invalid status');
  detector.status = newStatus;
  detectors.set(detectorId, detector);
  return true;
}

function recordEnergyHarvest(detectorId: number, energyAmount: number, recorder: string) {
  const detector = detectors.get(detectorId);
  if (!detector) throw new Error('Invalid detector');
  if (detector.owner !== recorder) throw new Error('Not authorized');
  detector.energyHarvested += energyAmount;
  detectors.set(detectorId, detector);
  return true;
}

describe('Quantum Detector Management Contract', () => {
  beforeEach(() => {
    detectorCount = 0;
    detectors.clear();
  });
  
  it('should register a new quantum detector', () => {
    const id = registerDetector('CERN LHC', 'Casimir Effect Detector', 95, 'scientist1');
    expect(id).toBe(1);
    const detector = detectors.get(id);
    expect(detector.location).toBe('CERN LHC');
    expect(detector.type).toBe('Casimir Effect Detector');
    expect(detector.efficiency).toBe(95);
    expect(detector.status).toBe('active');
  });
  
  it('should update detector status', () => {
    const id = registerDetector('Fermilab', 'Quantum Vacuum Fluctuation Sensor', 90, 'scientist2');
    expect(updateDetectorStatus(id, 'maintenance', 'scientist2')).toBe(true);
    const detector = detectors.get(id);
    expect(detector.status).toBe('maintenance');
  });
  
  it('should record energy harvest', () => {
    const id = registerDetector('LIGO', 'Gravitational Wave Detector', 98, 'scientist3');
    expect(recordEnergyHarvest(id, 1000, 'scientist3')).toBe(true);
    const detector = detectors.get(id);
    expect(detector.energyHarvested).toBe(1000);
  });
  
  it('should not allow unauthorized status updates', () => {
    const id = registerDetector('CERN CMS', 'Higgs Field Fluctuation Detector', 92, 'scientist4');
    expect(() => updateDetectorStatus(id, 'inactive', 'unauthorized_user')).toThrow('Not authorized');
  });
});

