import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-notifications";
import {registrateForPushNotifications} from "@/src/utils/registerPushNotification";

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
        "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}
  
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);
  
    const notificationListener = useRef<EventSubscription>();
    const responseListener = useRef<EventSubscription>();
  
    useEffect(() => {
        registrateForPushNotifications().then(
            (token) => setExpoPushToken(token),
            (error) => setError(error)
        );
        
        // notificication reseived while application is running
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification);
                console.log("Notification resived");
            });
            
        // backround tap on notification
        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                console.log(
                    "🔔 Notification Response: ",
                    JSON.stringify(response, null, 2),
                    JSON.stringify(response.notification.request.content.data, null, 2)
                );
            });
    
        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(
                    notificationListener.current
                );
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);
  
    return (
        <NotificationContext.Provider
            value={{ expoPushToken, notification, error }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

