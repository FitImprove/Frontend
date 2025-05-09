import * as SQLite from 'expo-sqlite';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrainingUserDTO {
    id: number;
    trainingId: number;
    status: string;
    invitedAt: Date;
    bookedAt: Date;
    canceledAt: Date;
}

interface TrainingDTO {
    id: number;
    forType: string;
    freeSlots: number;
    createdAt: Date;
    title: string;
    description: string;
    isCanceled: boolean;
    time: Date;
    durationMinutes: number;
    coachId: number;
    coachName: string;
    gymName: string;
}

let db: SQLite.SQLiteDatabase|null = null;
export async function getDB() {
    if (!db)
        db = await SQLite.openDatabaseAsync('fitimprove.db');
    return db;
}

export async function init() {
    const db = await getDB();
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS trainings (
            id INTEGER PRIMARY KEY,
            title varchar not null,
            description varchar not null,
            freeSlots integer not null,
            forType varchar not null,
            time timestamp not null,
            duration integer not null,
            is_canceled boolean not null,
            created_at timestamp,
            coach_name varchar not null,
            gym_name varchar not null,
            coach_id integer not null
        );
        
        CREATE TABLE IF NOT EXISTS training_user (
            id integer primary key,
            status varchar not null,
            user_id integer not null,
            training_id integer not null,
            canceled_at timestamp,
            invited_at timestamp,
            booked_at timestamp
        );
    `);

    const trainingUpdateTime = await AsyncStorage.getItem('trainingUpdateTime');
    const time = new Date();
    if (trainingUpdateTime) {
        syncDB(new Date(trainingUpdateTime));
    } else {
        try {
            const start = new Date(2020, 0, 1);
            console.log(start.toLocaleTimeString());
            const attendance = await api.get<TrainingUserDTO[]>(`/training-users/get-attendance/${start.toISOString().substring(0,16)}/${time.toISOString().substring(0,16)}`);
            console.log("Got attendance");

            const resp = await api.get<TrainingUserDTO[]>('/training-users/enrolled/all');
            console.log("Got enrolled");
            const data = attendance.data.concat(resp.data);
            const promises = [];
            for (const training_user of data) {
                api.get<TrainingDTO>(`/training/${training_user.trainingId}`).then(resp => {
                    promises.push( insertTraining(resp.data) );
                }).catch(e => console.log("Error while getting a training: ", e));
            }
            promises.push( insertTrainingUsers(data) );
            promises.push( AsyncStorage.setItem('trainingUpdateTime', time.toISOString()) );
            await Promise.all(promises);
        } catch (e) {
            console.log("Received e during db initialization: ", e);
        }
    }
}

export async function clearDatabase() {
    try {
        AsyncStorage.removeItem('trainingUpdateTime');
        const db = await getDB();
        await db.execAsync(`
            DELETE FROM training_user;
            DELETE FROM trainings;
        `);
        console.log("All data deleted from the database.");
    } catch (error) {
        console.error("Error while clearing the database:", error);
    }
}

const insertTrainingSQL = `INSERT OR REPLACE INTO trainings (
            id, title, description, freeSlots, forType, time, duration, is_canceled,
            created_at, coach_name, gym_name, coach_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
export async function insertTraining(t: TrainingDTO) {
    const db = await getDB();

    const time = t.time.toString();
    return db.runAsync(
        insertTrainingSQL,
        [
            t.id,
            t.title,
            t.description,
            t.freeSlots,
            t.forType,
            time,
            t.durationMinutes,
            t.isCanceled ? 1 : 0,
            t.createdAt?.toString(),
            t.coachName,
            t.gymName,
            t.coachId,
        ]
    );
}

const insertTrainingUserSQL = `INSERT OR REPLACE INTO training_user (
    id, status, user_id, training_id, canceled_at, invited_at, booked_at
) VALUES (?, ?, ?, ?, ?, ?, ?)`;
export async function insertTrainingUsers(tus: TrainingUserDTO[]) {
    const db = await getDB();

    for (const tu of tus) {
        const trainingExists = await db.getFirstAsync(
            `SELECT 1 FROM trainings WHERE id = ? LIMIT 1`,
            [tu.trainingId]
        );

        if (!trainingExists) {
            try {
                const trainingResp = await api.get<TrainingDTO>(`/trainings/${tu.trainingId}`);
                await insertTraining(trainingResp.data);
                console.log(`Fetched and inserted missing training ID: ${tu.trainingId}`);
            } catch (e) {
                console.log(`Error fetching training ID ${tu.trainingId}:`, e);
                continue;
            }
        }

        try {
            await db.runAsync(insertTrainingUserSQL, [
                tu.id,
                tu.status,
                0, // 👈 Replace with actual user ID if available
                tu.trainingId,
                tu.canceledAt?.toString() || null,
                tu.invitedAt?.toString() || null,
                tu.bookedAt?.toString() || null,
            ]);
        } catch (e) {
            console.log("TrainingUser insert error: ", e);
        }
    }
}

export async function syncDB(_updateTime: Date) {
    const db = await getDB();
    const updateTime = _updateTime.toISOString().slice(0, 19);

    console.log("ToDO! load coach's trainings");

    api.get<TrainingDTO[]>('/trainings/updates', {
        params: { time: updateTime }
    }).then(async resp => {
        for (const t of resp.data) {
            try {
                await insertTraining(t);
                console.log(`Updated training ${t.id}`);
            } catch (e) {
                console.log(`Error updating training ${t.id}:`, e);
            }
        }
    }).catch(e => console.log(e));

    api.get<TrainingUserDTO[]>('/training-users/updates', {
        params: { time: updateTime }
    }).then(async resp => {
        insertTrainingUsers(resp.data);
    }).catch(e => {
        console.log("Error while updating training-user: ", e);
    });
}

export async function clearTrainings() {
    await AsyncStorage.removeItem('trainingUpdateTime');
    const db = await getDB();
    db.execAsync(`
        DELETE FROM trainings;
        DELETE FROM training_user;
    `);
}