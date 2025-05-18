import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-notifications";
import { registrateForPushNotifications } from "@/src/utils/registerPushNotification";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Type for the NotificationContext
 * @interface NotificationContextType
 */
export interface NotificationContextType {
    /**
     * The Expo push notification token
     */
    expoPushToken: string | null;
    /**
     * The current notification
     */
    notification: Notifications.Notification | null;
    /**
     * Any error that occurred during notification setup
     */
    error: Error | null;
}

/**
 * Context for managing notifications
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Hook to access the NotificationContext
 * @returns {NotificationContextType} The notification context
 * @throws {Error} If used outside of a NotificationProvider
 */
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

/**
 * Props for the NotificationProvider component
 * @interface NotificationProviderProps
 */
export interface NotificationProviderProps {
    /**
     * The child components to be wrapped by the provider
     */
    children: ReactNode;
}

/**
 * A provider component for managing push notifications
 * @param {NotificationProviderProps} props - The component props
 * @returns {JSX.Element} The provider wrapping the children
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const notificationListener = useRef<EventSubscription | null>(null);
    const responseListener = useRef<EventSubscription | null>(null);

    useEffect(() => {
        registrateForPushNotifications().then(
            (token) => {
                setExpoPushToken(token);
                console.log(token);
            },
            (error) => setError(error)
        );

        // Notification received while application is running
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
            console.log("Notification received");
        });

        // Background tap on notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            if (data && data.trainingId) {
                const trainingKey = `notification_seen_${data.trainingId}`;
                AsyncStorage.setItem(trainingKey, 'true');
            }

            console.log(
                "🔔 Notification Response: ",
                JSON.stringify(response, null, 2),
                JSON.stringify(response.notification.request.content.data, null, 2)
            );
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
            {children}
        </NotificationContext.Provider>
    );
};