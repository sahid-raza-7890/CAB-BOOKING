export const BADGES = [
  { id: 'first_ride', name: 'First Ride', description: 'Completed your first trip', icon: '🌟' },
  { id: 'pro', name: 'Pro Rider', description: 'Completed 10+ rides', icon: '🏆' },
  { id: 'night_owl', name: 'Night Owl', description: 'Took a ride after 10 PM', icon: '🦉' },
  { id: 'eco_warrior', name: 'Eco Warrior', description: 'Took 5 EV rides', icon: '🌱' },
];

export const getUserBadges = (userStats) => {
  const unlocked = [];
  if (userStats.totalRides >= 1) unlocked.push(BADGES.find(b => b.id === 'first_ride'));
  if (userStats.totalRides >= 10) unlocked.push(BADGES.find(b => b.id === 'pro'));
  if (userStats.nightRides >= 1) unlocked.push(BADGES.find(b => b.id === 'night_owl'));
  if (userStats.ecoRides >= 5) unlocked.push(BADGES.find(b => b.id === 'eco_warrior'));
  
  return unlocked;
};
