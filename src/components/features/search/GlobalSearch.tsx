import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useDiscovery } from '../../../features/venues/contexts/DiscoveryContext';

interface GlobalSearchProps {
    placeholder?: string;
    className?: string;
    variant?: 'hero' | 'header';
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
    placeholder = "SEARCH BY BAR, CITY, OR VIBE...",
    className = "",
    variant = 'header'
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { searchQuery, setSearchQuery } = useDiscovery();


    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    const executeSearch = () => {
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    // Base styles
    const baseContainer = "relative flex items-center transition-all duration-300";
    const baseInput = "w-full focus:outline-none transition-all placeholder-slate-500 font-medium";

    // Variant styles
    const styles = {
        hero: {
            container: `${baseContainer} bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-white/15 focus-within:bg-white/20 focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(251,191,36,0.3)]`,
            input: `${baseInput} bg-transparent text-white text-lg py-4 pl-12 pr-12`,
            iconSize: 24,
            iconColor: "text-primary",
            clearPos: "right-4"
        },
        header: {
            container: `${baseContainer} bg-white/5 border border-white/10 rounded-full hover:bg-white/10 focus-within:border-primary/50`,
            input: `${baseInput} bg-transparent text-white text-sm py-2 pl-10 pr-10`,
            iconSize: 16,
            iconColor: "text-slate-400 group-focus-within:text-primary",
            clearPos: "right-3"
        }
    };

    const currentStyle = styles[variant];

    return (
        <div className={`${currentStyle.container} ${className} group`}>
            <Search
                size={currentStyle.iconSize}
                className={`absolute left-4 ${currentStyle.iconColor} transition-colors`}
                strokeWidth={variant === 'hero' ? 2 : 2.5}
            />

            <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (location.pathname !== '/') {
                        navigate('/');
                    }
                }}
                placeholder={placeholder}
                className={currentStyle.input}
            />

            {searchQuery && (
                <button
                    onClick={() => {
                        setSearchQuery('');
                        if (location.pathname !== '/') {
                            navigate('/');
                        }
                    }}
                    className={`absolute ${currentStyle.clearPos} p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors`}
                >
                    <X size={variant === 'hero' ? 20 : 16} />
                </button>
            )}
        </div>
    );
};
