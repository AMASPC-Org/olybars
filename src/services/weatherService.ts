export type WeatherCondition = 'sunny' | 'raining' | 'cloudy' | 'cold';

export interface WeatherData {
    condition: WeatherCondition;
    temp: number;
    description: string;
}

/**
 * Weather Service
 * Currently using mock data, but structured for future API integration.
 */
export const weatherService = {
    getCurrentWeather: async (): Promise<WeatherData> => {
        // Mocking a rainy day in Olympia (statistically likely!)
        // In the future, this would call a weather API (e.g. OpenWeather)
        return {
            condition: 'raining',
            temp: 45,
            description: 'Pouring Rain'
        };
    }
};
