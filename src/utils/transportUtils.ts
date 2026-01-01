/**
 * Transport Utilities
 * Handles deep linking for ride-share apps.
 */

export const getUberDeepLink = (destAddress: string, destLat: number, destLng: number) => {
    // Uber URI scheme: uber://?action=setPickup&pickup=my_location&dropoff[latitude]=LAT&dropoff[longitude]=LNG&dropoff[nickname]=NAME
    const encodedAddress = encodeURIComponent(destAddress);
    return `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}&dropoff[formatted_address]=${encodedAddress}`;
};

export const getLyftDeepLink = (destLat: number, destLng: number) => {
    // Lyft URI scheme: lyft://ridetype?id=lyft&destination[latitude]=LAT&destination[longitude]=LNG
    return `lyft://ridetype?id=lyft&destination[latitude]=${destLat}&destination[longitude]=${destLng}`;
};

/**
 * Fallback to web link if app isn't installed
 */
export const getUberWebLink = (destAddress: string) => {
    return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destAddress)}`;
};

export const getLyftWebLink = (destLat: number, destLng: number) => {
    return `https://www.lyft.com/ride?id=lyft&destination[latitude]=${destLat}&destination[longitude]=${destLng}`;
};
