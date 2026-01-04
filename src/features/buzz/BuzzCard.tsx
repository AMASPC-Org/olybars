import { Badge } from '../../components/ui/Badge';
import { MapPin } from 'lucide-react';

// Based on docs/specs/05_Hyperlocal_Intelligence_and_Data_Models.md
export interface Venue {
  id: string;
  name: string;
  type: 'dive' | 'cocktail' | 'brewery' | 'arcade';
  location: {
    distance: string;
  };
  current_buzz: {
    status: 'dead' | 'chill' | 'buzzing' | 'packed';
  };
  vibes: string[];
}

const BuzzCard = ({ venue }: { venue: Venue }) => {
  return (
    <div className="rounded-lg bg-slate-900 p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{venue.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin size={14} />
            <span>{venue.location.distance}</span>
          </div>
        </div>
        <Badge label={venue.current_buzz.status} variant={venue.current_buzz.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge label={venue.type} variant="outline" />
        {venue.vibes.map((vibe) => (
          <Badge key={vibe} label={vibe} variant="default" />
        ))}
      </div>

      <div className="mt-4">
        <button className="h-11 w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400">
          Check In
        </button>
      </div>
    </div>
  );
};

export default BuzzCard;
