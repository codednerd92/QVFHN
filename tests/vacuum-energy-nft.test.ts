import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mintVacuumEnergyNFT(name: string, description: string, energyPotential: number, rarity: number, imageUrl: string, creator: string) {
  const tokenId = ++lastTokenId;
  tokenMetadata.set(tokenId, {
    creator,
    name,
    description,
    energyPotential,
    rarity,
    discoveryTime: Date.now(),
    imageUrl
  });
  tokenOwners.set(tokenId, creator);
  return tokenId;
}

function transferVacuumEnergyNFT(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) throw new Error('Not authorized');
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Vacuum Energy NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new vacuum energy NFT', () => {
    const id = mintVacuumEnergyNFT('Quantum Vortex', 'A rare quantum vortex with high energy potential', 1000000, 95, 'https://example.com/quantum-vortex.jpg', 'scientist1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.name).toBe('Quantum Vortex');
    expect(metadata.energyPotential).toBe(1000000);
    expect(metadata.rarity).toBe(95);
    expect(tokenOwners.get(id)).toBe('scientist1');
  });
  
  it('should transfer vacuum energy NFT ownership', () => {
    const id = mintVacuumEnergyNFT('Casimir Cavity', 'A stable Casimir cavity for energy extraction', 500000, 80, 'https://example.com/casimir-cavity.jpg', 'scientist2');
    expect(transferVacuumEnergyNFT(id, 'scientist2', 'researcher1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('researcher1');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintVacuumEnergyNFT('Quantum Foam Bubble', 'A high-energy quantum foam bubble', 750000, 85, 'https://example.com/quantum-foam.jpg', 'scientist3');
    expect(() => transferVacuumEnergyNFT(id, 'unauthorized_user', 'researcher2')).toThrow('Not authorized');
  });
});

