import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, TextInput, FlatList } from 'react-native';
import MapView, { Marker, LongPressEvent } from 'react-native-maps';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/MapStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ErrorPopup from '@/src/components/ErrorPopup';

// Типи для параметрів
/**
 * Parameters passed to the map screen for initializing location and address.
 */
export interface LocationGymParams {
    /** Latitude as a string, optional. Defaults can be applied if missing. */
    latitude?: string;
    /** Longitude as a string, optional. Defaults can be applied if missing. */
    longitude?: string;
    /** Address string, optional, can be used as initial search query. */
    address?: string;
}

/**
 * Geographic coordinate with latitude and longitude values.
 */
export type Coordinate = {
    /** Latitude in decimal degrees. */
    latitude: number;
    /** Longitude in decimal degrees. */
    longitude: number;
};

/**
 * Map region describing the visible area on the map.
 */
export type Region = {
    /** Center latitude of the region in decimal degrees. */
    latitude: number;
    /** Center longitude of the region in decimal degrees. */
    longitude: number;
    /** Latitude span of the region (zoom level). */
    latitudeDelta: number;
    /** Longitude span of the region (zoom level). */
    longitudeDelta: number;
};

/**
 * Suggestion returned from autocomplete API representing a place.
 */
export interface Suggestion {
    /** Unique identifier of the place in Google Places API. */
    place_id: string;
    /** Human-readable description of the place for display in suggestions. */
    description: string;
}

/**
 * MapSearchScreen component provides an interactive map interface to search and select locations.
 *
 * @remarks
 * * Initializes map region and marker from optional query parameters or defaults.
 * * Allows users to search locations with autocomplete suggestions using Google Places API.
 * * Supports selecting a suggestion to update the marker and center the map accordingly.
 * * Enables placing a marker by long-pressing on the map, with reverse geocoding to fetch the address.
 * * Displays error popups for API failures or missing data during search and reverse geocoding.
 * * Allows saving the selected location's coordinates and address, then navigates back with parameters.
 * * Utilizes theming from a custom ThemeContext for consistent styling.
 *
 * @returns {JSX.Element} Interactive map view with search input, suggestions list, marker placement, and save button.
 */
export default function MapSearchScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const rawParams = useLocalSearchParams();
    const params: LocationGymParams = {
        latitude: Array.isArray(rawParams.latitude) ? rawParams.latitude[0] : rawParams.latitude,
        longitude: Array.isArray(rawParams.longitude) ? rawParams.longitude[0] : rawParams.longitude,
        address: Array.isArray(rawParams.address) ? rawParams.address[0] : rawParams.address,
    };

    // Перевірка і приведення параметрів до string
    const latitude = Array.isArray(params.latitude)
        ? params.latitude[0]
        : params.latitude || '48.1486';
    const longitude = Array.isArray(params.longitude)
        ? params.longitude[0]
        : params.longitude || '17.1077';
    const address = Array.isArray(params.address) ? params.address[0] : params.address || '';

    const [searchQuery, setSearchQuery] = useState<string>(address);
    const [marker, setMarker] = useState<Coordinate>({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
    });
    const [region, setRegion] = useState<Region>({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [popup, setPopup] = useState({ visible: false, message: '' });

    useEffect(() => {
        console.log('Marker updated:', marker);
    }, [marker]);

    const showPopup = (message: string) => {
        setPopup({ visible: true, message });
    };

    const hidePopup = () => {
        setPopup({ visible: false, message: '' });
    };

    const handleMapPress = async (e: LongPressEvent) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setMarker({ latitude, longitude });
        setRegion({ ...region, latitude, longitude });
        console.log('New marker position:', { latitude, longitude });

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBbT6E0gbxKVG4LI-tnQ_4cZ8CndmJxoCE`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setSearchQuery(address);
                console.log('Address from coordinates:', address);
            } else {
                setSearchQuery('');
                console.log('No address found for these coordinates');
                showPopup('No address found for these coordinates');
            }
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
            setSearchQuery('');
            showPopup('Failed to perform reverse geocoding');
        }
    };

    const fetchSuggestions = async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=AIzaSyBbT6E0gbxKVG4LI-tnQ_4cZ8CndmJxoCE&language=en&components=country:sk`
            );
            const data = await response.json();
            console.log('Autocomplete response:', data);

            if (data.status === 'OK' && data.predictions) {
                setSuggestions(data.predictions);
            } else {
                setSuggestions([]);
                console.log('No autocomplete suggestions:', data.error_message || 'No results');
                showPopup(data.error_message || 'No search results found');
            }
        } catch (error) {
            console.error('Fetch suggestions error:', error);
            setSuggestions([]);
            showPopup('Failed to fetch suggestions');
        }
    };

    const handleSelectSuggestion = async (suggestion: Suggestion) => {
        try {
            const placeId = suggestion.place_id;
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyBbT6E0gbxKVG4LI-tnQ_4cZ8CndmJxoCE&language=en`
            );
            const data = await response.json();
            console.log('Place details response:', data);

            if (data.status === 'OK' && data.result?.geometry?.location) {
                const { lat, lng } = data.result.geometry.location;
                if (typeof lat === 'number' && typeof lng === 'number') {
                    console.log('Setting marker to:', { latitude: lat, longitude: lng });
                    setMarker({ latitude: lat, longitude: lng });
                    setRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });
                    mapRef.current?.animateToRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });
                    setSearchQuery(suggestion.description);
                    setSuggestions([]);
                    console.log('Selected location:', { lat, lng });
                    showPopup(`Found: ${suggestion.description}`);
                } else {
                    console.error('Invalid coordinates:', { lat, lng });
                    showPopup('Invalid coordinates');
                }
            } else {
                console.log('No place details:', data.error_message || 'No results');
                showPopup(data.error_message || 'Failed to retrieve coordinates');
            }
        } catch (error) {
            console.error('Select suggestion error:', error);
            showPopup('Failed to select suggestion');
        }
    };

    const handleSave = () => {
        console.log(marker.latitude);
        console.log(marker.longitude);
        router.back();
        router.setParams({
            latitude: marker.latitude.toString(),
            longitude: marker.longitude.toString(),
            address: searchQuery,
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.inputContainer }]}>
                <TextInput
                    style={{
                        height: 40,
                        backgroundColor: theme.inputBackground,
                        color: theme.inputText,
                        borderColor: theme.inputBorder,
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                        flex: 1,
                    }}
                    placeholder="Search location"
                    placeholderTextColor={theme.inputText}
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        fetchSuggestions(text);
                    }}
                />
            </View>

            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    style={{
                        backgroundColor: theme.inputBackground,
                        maxHeight: 200,
                        marginHorizontal: 10,
                        borderRadius: 5,
                        borderColor: theme.inputBorder,
                        borderWidth: 1,
                    }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.inputBorder,
                            }}
                            onPress={() => handleSelectSuggestion(item)}
                        >
                            <Text style={{ color: theme.inputText }}>{item.description}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                onLongPress={handleMapPress}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            >
                <Marker
                    coordinate={marker}
                    title="Selected Location"
                    description="Long press to move marker"
                />
            </MapView>

            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.buttonBackground }]}
                onPress={handleSave}
            >
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Save</Text>
            </TouchableOpacity>

            <ErrorPopup
                visible={popup.visible}
                message={popup.message}
                onClose={hidePopup}
            />
        </View>
    );
}