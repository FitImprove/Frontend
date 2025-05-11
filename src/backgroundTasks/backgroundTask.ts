import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getUpcomingLocal, Training } from '@/src/utils/training';
import { api } from '@/src/utils/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_NOTIFICATION_TASK = 'training-reminder-task';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
    try {
        // Отримуємо userId з AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.log('User not logged in');
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        const upcomingTrainings: Training[] = await getUpcomingLocal();
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const nextTraining = upcomingTrainings.find((training) => {
            const trainingTime = new Date(training.time);
            return trainingTime > now && trainingTime <= oneHourLater && !training.isCanceled;
        });

        if (nextTraining) {
            await api.post('/notifications/send', {
                userId: parseInt(userId),
                title: 'Upcoming Training!',
                message: `Your training "${nextTraining.title}" starts in 1 hour at ${new Date(nextTraining.time).toLocaleTimeString()}.`,
                trainingId: nextTraining.id,
            });
            console.log('Notification sent for training:', nextTraining.title);
        }

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
                minimumInterval: 15 * 60,
                stopOnTerminate: false,
                startOnBoot: true,
            });
            console.log('Training reminder task registered');
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