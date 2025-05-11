import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getUpcomingLocal, Training } from '@/src/utils/training';
import { api } from '@/src/utils/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';

export const BACKGROUND_NOTIFICATION_TASK = 'training-reminder-task';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
    try {
        console.log("Background process started");
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.log('User not logged in');
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        const upcomingTrainings: Training[] = await getUpcomingLocal();
        if (!upcomingTrainings || upcomingTrainings.length === 0) 
            return BackgroundFetch.BackgroundFetchResult.Failed;
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const training = upcomingTrainings[0];
        if (!(training.time > now && training.time < oneHourLater))
            return BackgroundFetch.BackgroundFetchResult.Failed;
        
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Upcoming Training!',
                body: `Your training "${training.title}" starts in 1 hour at ${new Date(training.time).toLocaleTimeString()}.`,
                data: { trainingId: training.id },
            },
            trigger: null
        });
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.log('Background task error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerTrainingReminderTask = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
                minimumInterval: 15 * 60, // 15 minutes
                stopOnTerminate: false,
                startOnBoot: true,
            });
            console.log('Training reminder task registered');
        } else {
            console.log('Task already registered');
        }
    } catch (error) {
        console.log('Failed to register background task:', error);
    }
};

export const unregisterTrainingReminderTask = async () => {
    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
        console.log('Training reminder task unregistered');
    } catch (error) {
        console.log('Failed to unregister background task:', error);
    }
};