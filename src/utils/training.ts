import {api} from "./api";
import { getDB } from "../db/init";

export const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export enum TrainingStatus {
    INVITED = "INVITED", 
    AGREED = "AGREED", 
    DENIED = "DENIED", 
    CANCELED = "CANCELED"
}

export enum TrainingType {
    EVERYONE = "EVERYONE",
    LIMITED = "LIMITED"
}
function getTrainingType(type: String): TrainingType {
    if (type === "EVERYONE") 
        return TrainingType.EVERYONE;
    // if (type === "LIMITED") 
        return TrainingType.LIMITED;
    // return undefined;
}


export interface TrainingUserDTO {
    id: number;
    userId: number;
    trainingId: number;
    status: TrainingStatus;
    trainingTime: string;
}

export interface Training {
    id: number;
    title: string;
    description: string;
    time: Date;
    duration: number;
    isCanceled: boolean;
    createdAt: string|null;
    freeSlots: number;
    forType: TrainingType;
    coachId: number;
    coachName: string;
    gymName: string;
}

function trainingFromJson(json: any): Training {
    return {
        id: json.id,
        title: json.title,
        description: json.description,
        time: new Date(json.time),
        duration: json.duration,
        isCanceled: json.isCanceled,
        createdAt: json.createdAt,
        freeSlots: json.freeSlots,
        forType: getTrainingType(json.forType),
        coachId: json.coachId,
        coachName: json.coachName,
        gymName: json.gymName
    };
}

export async function cancelTrainigRegularUser(trainingId: number) {
    try {
        await api.post("/training-users/cancel", { trainingId });
        const db = await getDB();
        await db.runAsync(`UPDATE training_user
                SET status = 'CANCELED'
                WHERE training_id = ? AND status = 'AGREED'
            `,
            [trainingId]
        );
    } catch (error) {
        console.error("Error in cancelTrainig:", error);
    }
}

export async function openChatFromTraining(train: Training) {
    return api.post("/training-users/cancel", {trainingId: train.id});
}
const getUpcomingSQL = `SELECT 
        t.id,
        t.title,
        t.description,
        t.time,
        t.duration,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.freeSlots,
        t.forType,
        t.coach_id AS coachId,
        t.coach_name AS coachName,
        t.gym_name AS gymName
    FROM 
        trainings t
    JOIN
        training_user tu ON t.id = tu.training_id
    WHERE 
        tu.status = 'AGREED'
        AND t.is_canceled = FALSE
    ORDER BY t.time;
`;
/*  AND t.time > CURRENT_TIMESTAMP */
export async function getUpcomingLocal(): Promise<Training[]> {
    const db = await getDB();
    let data: Training[] = await db.getAllAsync(getUpcomingSQL);
    let res = [];
    for (const d of data) {
        res.push(trainingFromJson(d));
    }
    return res;
}

const getTrainings = `SELECT 
        t.id,
        t.title,
        t.description,
        t.time,
        t.duration,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.freeSlots,
        t.forType,
        t.coach_id AS coachId,
        t.coach_name AS coachName,
        t.gym_name AS gymName
    FROM 
        trainings t
    JOIN
        training_user tu ON t.id = tu.training_id
    WHERE 
        tu.status = 'AGREED'
        AND t.is_canceled = FALSE
        AND t.time BETWEEN ? AND ?
    ORDER BY t.time;
`;
export async function getTrainignsInInterval(start: Date, end: Date): Promise<Training[]> {
    const db = await getDB();
    let data = await db.getAllAsync(getTrainings, [start.toISOString(), end.toISOString()]);
    let res = [];
    for (const d of data) {
        res.push(trainingFromJson(d));
    }
    return res;
}