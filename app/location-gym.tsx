import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, TextInput, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/MapStyles';
import {useLocalSearchParams, useRouter} from 'expo-router';
import ErrorPopup from '@/src/components/ErrorPopup'; // Імпортуємо твій попап

export default function MapSearchScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const mapRef = useRef(null);
    const params = useLocalSearchParams();
    const [searchQuery, setSearchQuery] = useState(params.address || '');
    const [marker, setMarker] = useState({
        latitude: params.latitude || 48.1486, // Центр Братислави
        longitude: params.longitude || 17.1077,
    });
    const [region, setRegion] = useState({
        latitude: params.latitude || 48.1486,
        longitude: params.longitude || 17.1077,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [suggestions, setSuggestions] = useState([]);
    const [popup, setPopup] = useState({ visible: false, message: '' });

    useEffect(() => {
        console.log('Marker updated:', marker);
    }, [marker]);

    const showPopup = (message) => {
        setPopup({ visible: true, message });
    };

    const hidePopup = () => {
        setPopup({ visible: false, message: '' });
    };

    const handleMapPress = async (e) => {
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

    const fetchSuggestions = async (query) => {
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

    const handleSelectSuggestion = async (suggestion) => {
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
        console.log(marker.latitude.toString());
        console.log(marker.longitude.toString());
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