import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let listingCount = 0;
const energyListings = new Map();
const quantumEnergyBalances = new Map();
const stxBalances = new Map();

// Simulated contract functions
function createEnergyListing(amount: number, pricePerUnit: number, expiration: number, seller: string) {
  const listingId = ++listingCount;
  const currentBalance = quantumEnergyBalances.get(seller) || 0;
  if (currentBalance < amount) throw new Error('Insufficient quantum energy balance');
  quantumEnergyBalances.set(seller, currentBalance - amount);
  energyListings.set(listingId, {
    seller,
    amount,
    pricePerUnit,
    expiration: Date.now() + expiration * 1000 // Convert to milliseconds
  });
  return listingId;
}

function purchaseEnergy(listingId: number, amount: number, buyer: string) {
  const listing = energyListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (listing.amount < amount) throw new Error('Insufficient energy in listing');
  const totalCost = listing.pricePerUnit * amount;
  const buyerBalance = stxBalances.get(buyer) || 0;
  if (buyerBalance < totalCost) throw new Error('Insufficient balance');
  stxBalances.set(buyer, buyerBalance - totalCost);
  const sellerBalance = stxBalances.get(listing.seller) || 0;
  stxBalances.set(listing.seller, sellerBalance + totalCost);
  const buyerEnergyBalance = quantumEnergyBalances.get(buyer) || 0;
  quantumEnergyBalances.set(buyer, buyerEnergyBalance + amount);
  listing.amount -= amount;
  if (listing.amount === 0) {
    energyListings.delete(listingId);
  } else {
    energyListings.set(listingId, listing);
  }
  return true;
}

describe('Quantum Energy Marketplace Contract', () => {
  beforeEach(() => {
    listingCount = 0;
    energyListings.clear();
    quantumEnergyBalances.clear();
    stxBalances.clear();
  });
  
  it('should create a new energy listing', () => {
    quantumEnergyBalances.set('seller1', 1000);
    const id = createEnergyListing(500, 10, 3600, 'seller1');
    expect(id).toBe(1);
    const listing = energyListings.get(id);
    expect(listing.amount).toBe(500);
    expect(listing.pricePerUnit).toBe(10);
    expect(quantumEnergyBalances.get('seller1')).toBe(500);
  });
  
  it('should allow purchasing energy', () => {
    quantumEnergyBalances.set('seller2', 1000);
    stxBalances.set('buyer1', 10000);
    const id = createEnergyListing(1000, 5, 7200, 'seller2');
    expect(purchaseEnergy(id, 200, 'buyer1')).toBe(true);
    expect(stxBalances.get('buyer1')).toBe(9000);
    expect(quantumEnergyBalances.get('buyer1')).toBe(200);
    const updatedListing = energyListings.get(id);
    expect(updatedListing.amount).toBe(800);
  });
  
  it('should not allow purchasing more energy than available', () => {
    quantumEnergyBalances.set('seller3', 500);
    stxBalances.set('buyer2', 10000);
    const id = createEnergyListing(500, 8, 3600, 'seller3');
    expect(() => purchaseEnergy(id, 600, 'buyer2')).toThrow('Insufficient energy in listing');
  });
  
  it('should not allow purchasing with insufficient balance', () => {
    quantumEnergyBalances.set('seller4', 1000);
    stxBalances.set('buyer3', 100);
    const id = createEnergyListing(1000, 10, 3600, 'seller4');
    expect(() => purchaseEnergy(id, 20, 'buyer3')).toThrow('Insufficient balance');
  });
});

