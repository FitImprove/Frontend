import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { styles } from '@/src/styles/MapStyles';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '@/src/contexts/ThemeContext';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Location from 'expo-location';
import ErrorPopup from '@/src/components/ErrorPopup';

/**
 * ViewGymScreen component displays a gym's location on a map with user location and distance.
 *
 * @remarks
 * - Parses gym data from navigation params to display its location on a MapView.
 * - Requests and uses device location to show user position and calculate distance to the gym.
 * - Centers the map to include both gym and user locations when available.
 * - Handles location permission denial with an error popup and navigation back.
 * - Uses ThemeContext for consistent styling and responsive design with react-native-responsive-screen.
 * - Updates map dynamically when user location is obtained.
 * - Displays gym address and calculated distance in a user-friendly format.
 *
 * @returns {JSX.Element} Rendered map interface with gym and user markers, distance info, and error handling.
 */
export default function ViewGymScreen() {
    const { gym } = useLocalSearchParams();
    const { theme } = useTheme();
    const gymData = JSON.parse(gym as string);
    const mapRef = useRef<MapView>(null);

    console.log('Latitude: ', gymData.latitude, '\nLongitude: ', gymData.longitude);
    const [marker, setMarker] = useState({
        latitude: gymData.latitude ? parseFloat(gymData.latitude) : 48.1486,
        longitude: gymData.longitude ? parseFloat(gymData.longitude) : 17.1077,
    });
    const [region, setRegion] = useState({
        latitude: gymData.latitude ? parseFloat(gymData.latitude) : 48.1486,
        longitude: gymData.longitude ? parseFloat(gymData.longitude) : 17.1077,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [userLocation, setUserLocation] = useState<any>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [mapKey, setMapKey] = useState(0);
    const [errorVisible, setErrorVisible] = useState(false);

    /**
     * Requests location permission and updates map with user location and distance
     */
    useEffect(() => {
        const requestLocationPermission = async () => {
            let { status } = await Location.getForegroundPermissionsAsync();

            if (status !== 'granted') {
                let permissionResponse = await Location.requestForegroundPermissionsAsync();
                status = permissionResponse.status;
            }

            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                const newUserLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setUserLocation(newUserLocation);

                const newRegion = {
                    latitude: (parseFloat(gymData.latitude || '48.1486') + location.coords.latitude) / 2,
                    longitude: (parseFloat(gymData.longitude || '17.1077') + location.coords.longitude) / 2,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };
                setRegion(newRegion);

                if (gymData.latitude && gymData.longitude) {
                    const gymLat = parseFloat(gymData.latitude);
                    const gymLon = parseFloat(gymData.longitude);
                    const userLat = location.coords.latitude;
                    const userLon = location.coords.longitude;
                    const R = 6371;
                    const dLat = toRad(userLat - gymLat);
                    const dLon = toRad(userLon - gymLon);
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(toRad(gymLat)) * Math.cos(toRad(userLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const calculatedDistance = R * c;
                    setDistance(calculatedDistance);

                    setMapKey((prevKey) => prevKey + 1);
                }
            } else {
                console.log('Permission to access location was denied');
                setErrorVisible(true);
            }
        };

        requestLocationPermission();
    }, []);

    /**
     * Converts degrees to radians
     * @param value - Degree value
     * @returns {number} Radian value
     */
    const toRad = (value: number) => (value * Math.PI) / 180;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.backButton, { color: theme.accent || '#ff00cc' }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: theme.text, fontSize: wp('5%') }]}>{gymData.address}</Text>
            </View>
            <MapView
                key={mapKey}
                ref={mapRef}
                style={styles.map}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            >
                <Marker coordinate={marker} title='Gym Location' description={gymData.address} />
                {userLocation && (
                    <Marker coordinate={userLocation} title='Your Location' pinColor='blue' />
                )}
            </MapView>
            {userLocation && distance && (
                <View style={styles.distanceContainer}>
                    <Text style={[styles.distanceText, { color: theme.text }]}>
                        Distance to gym: {distance.toFixed(2)} km
                    </Text>
                </View>
            )}
            <ErrorPopup
                visible={errorVisible}
                message='Location permission denied. Please enable location access to view the gym location.'
                onClose={() => {
                    setErrorVisible(false);
                    router.back();
                }}
            />
        </View>
    );
}