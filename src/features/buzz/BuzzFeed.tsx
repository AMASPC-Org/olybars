import BuzzCard, { Venue } from './BuzzCard';

const MOCK_VENUES: Venue[] = [
  {
    id: 'brotherhood-lounge',
    name: 'The Brotherhood Lounge',
    type: 'dive',
    location: { distance: '0.2 mi' },
    current_buzz: { status: 'chill' },
    vibes: ['pool', 'dark', 'cash only'],
  },
  {
    id: 'hannahs-bar',
    name: "Hannah's Bar & Grill",
    type: 'cocktail',
    location: { distance: '0.5 mi' },
    current_buzz: { status: 'buzzing' },
    vibes: ['dancing', 'loud', 'patio'],
  },
  {
    id: 'well-80',
    name: 'Well 80 Brewhouse',
    type: 'brewery',
    location: { distance: '1.1 mi' },
    current_buzz: { status: 'chill' },
    vibes: ['family friendly', 'patio', 'good food'],
  },
];

const BuzzFeed = () => {
  return (
    <div className="space-y-4 p-4">
      {MOCK_VENUES.map((venue) => (
        <BuzzCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
};

export default BuzzFeed;
