import {api, getRole, Role} from "./api";
import { getDB, insertTraining, insertTrainingUsers, TrainingDTO } from "../db/init";
import { TrainingUserDTO } from "../db/init";
import qs from 'qs';

export const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export enum TrainingStatus {
    INVITED = "INVITED",
    AGREED = "AGREED",
    DENIED = "DENIED",
    CANCELED = "CANCELED"
}

const pad = (n: number) => n.toString().padStart(2, '0');
export const localISOString = (date: Date) => {
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds());
};

export enum TrainingType {
    EVERYONE = "EVERYONE",
    LIMITED = "LIMITED"
}
export function getTrainingType(type: String): TrainingType {
    if (type === "EVERYONE")
        return TrainingType.EVERYONE;
    // if (type === "LIMITED")
    return TrainingType.LIMITED;
    // return undefined;
}


export interface Training {
    id: number;
    type: string;
    title: string;
    description: string;
    time: Date;
    duration: number;
    isCanceled: boolean;
    createdAt: Date|null;
    freeSlots: number;
    forType: TrainingType;
    coachId: number;
    coachName: string;
    gymName: string;
}

export function trainingFromDTO(t: TrainingDTO): Training {
    let created: Date|null = new Date(t.createdAt);
    if (isNaN(created.getTime())) {
        created = null;
    }
    return {
        id: t.id,
        title: t.title,
        description: t.description,
        time: new Date(t.time),
        duration: t.durationMinutes,
        isCanceled: t.canceled,
        createdAt: created,
        freeSlots: t.freeSlots,
        type: t.type,
        forType: getTrainingType(t.forType),
        coachId: t.coachId,
        coachName: t.coachName,
        gymName: t.gymName
    };
}

export async function cancelTrainigRegularUser(trainingId: number) {
    await api.post("/training-users/cancel", { trainingId });
    const db = await getDB();
    await db.runAsync(`UPDATE training_user
            SET status = 'CANCELED'
            WHERE training_id = ? AND status = 'AGREED'
        `,
        [trainingId]
    );
}

export async function cancelTrainigCoach(trainingId: number) {
    try {
        await api.post("/trainings/cancel", { trainingId });
        const db = await getDB();
        await db.runAsync(`UPDATE trainings
                SET is_canceled = 1
                WHERE id = ?
            `,
            [trainingId]
        );
    } catch (e) {console.log(e); throw new Error(String(e));}
}

export interface TrainingChangesDTO {
    id: number,
    title: string,
    description: string,
    freeSlots: number,
    type: string,
    forType: string
}
export async function editTrainingCoach(t: TrainingChangesDTO) {
    const trainingData: TrainingDTO = (await api.put('/trainings/edit', t)).data;
    await insertTraining(trainingData);
}

export async function openChatFromTraining(train: Training) {
    return api.post("/training-users/cancel", {trainingId: train.id});
}
const getUpcomingUserSQL = `SELECT 
        t.id,
        t.type,
        t.title,
        t.description,
        t.time,
        t.duration AS durationMinutes,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.free_slots AS freeSlots,
        t.for_type AS forType,
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
        AND t.time > ?
    ORDER BY t.time;
`;
const getUpcomingCoachSQL = `SELECT 
        t.id,
        t.type,
        t.title,
        t.description,
        t.time,
        t.duration AS durationMinutes,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.free_slots AS freeSlots,
        t.for_type AS forType,
        t.coach_id AS coachId,
        t.coach_name AS coachName,
        t.gym_name AS gymName
    FROM 
        trainings t
    WHERE 
        t.is_canceled = FALSE
        AND t.time > ?
    ORDER BY t.time;
`;
/*  ToDo! AND t.time > CURRENT_TIMESTAMP */
export async function getUpcomingLocal(): Promise<Training[]> {
    const db = await getDB();
    const role: Role|null = await getRole();
    if (role === null) return [];
    let data: TrainingDTO[] = [];
    try {
        const localNow = new Date();
        const localTimestamp = localNow.toISOString().slice(0, 19).replace('T', ' ');
        if (role === 'COACH') {
            data = await db.getAllAsync<TrainingDTO>(getUpcomingCoachSQL, [localTimestamp]);
        } else {
            data = await db.getAllAsync<TrainingDTO>(getUpcomingUserSQL, [localTimestamp]);
        }
    } catch (e) {console.log(e)}
    let res = [];
    for (const d of data) {
        res.push(trainingFromDTO(d));
    }
    return res;
}

const getInvitationsSQL = `SELECT 
        t.id,
        t.type,
        t.title,
        t.description,
        t.time,
        t.duration AS durationMinutes,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.free_slots AS freeSlots,
        t.for_type AS forType,
        t.coach_id AS coachId,
        t.coach_name AS coachName,
        t.gym_name AS gymName
    FROM 
        trainings t
    JOIN
        training_user tu ON t.id = tu.training_id
    WHERE 
        tu.status = 'INVITED'
        AND t.is_canceled = FALSE
        AND t.time > ?
    ORDER BY t.time;
`;
export async function getInvitationsLocal(): Promise<Training[]> {
    const db = await getDB();
    const role: Role|null = await getRole();
    if (role === null || role === 'COACH') return [];
    let data: TrainingDTO[] = [];
    try {
        const localTimestamp = (new Date()).toISOString().slice(0, 19).replace('T', ' ');
        data = await db.getAllAsync<TrainingDTO>(getInvitationsSQL, [localTimestamp]);
    } catch (e) {console.log(e)}
    let res = [];
    for (const d of data) {
        res.push(trainingFromDTO(d));
    }
    return res;
}

const getTrainingsUser = `SELECT 
        t.id,
        t.title,
        t.description,
        t.time,
        t.duration AS durationMinutes,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.free_slots AS freeSlots,
        t.type,
        t.for_type AS forType,
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
const getTrainingsCoach = `SELECT
        t.id,
        t.title,
        t.description,
        t.time,
        t.duration AS durationMinutes,
        t.is_canceled AS isCanceled,
        t.created_at AS createdAt,
        t.free_slots AS freeSlots,
        t.type,
        t.for_type AS forType,
        t.coach_id AS coachId,
        t.coach_name AS coachName,
        t.gym_name AS gymName
    FROM trainings t
    WHERE t.is_canceled = FALSE
        AND t.time BETWEEN ? AND ?
    ORDER BY t.time`
export async function getTrainignsInInterval(start: Date, end: Date): Promise<Training[]> {
    const db = await getDB();
    const role = await getRole();
    let data: TrainingDTO[] = [];
    try {
        if (role == 'COACH') {
            data = await db.getAllAsync(getTrainingsCoach, [start.toISOString(), end.toISOString()]);
        } else {
            data = await db.getAllAsync(getTrainingsUser, [start.toISOString(), end.toISOString()]);
        }
    } catch (e) {console.log("Error while loading attendance: ", e); throw e}
    let res: Training[] = [];
    for (const d of data) {
        res.push(trainingFromDTO(d));
    }
    return res;
}

export const emptyTraining: Training = {
    id: 0,
    title: "",
    description: "",
    time: new Date(),
    duration: 0,
    isCanceled: false,
    createdAt: new Date(),
    freeSlots: 0,
    type: "",
    forType: TrainingType.EVERYONE,
    coachId: 0,
    coachName: "",
    gymName: "",
}

export interface UserForTrainingDTO {
    userId: number;
    userName: string;
    trainingId: number;
    status: string;
    iconPath: string;
}
export async function getEnrolledInTraining(trainingId: number): Promise<UserForTrainingDTO[]> {
    return (await api.get<UserForTrainingDTO[]>(`/get-enrolled/${trainingId}`)).data;
}

export async function cancelParticipationCoach(userId: number, trainingId: number): Promise<TrainingUserDTO> {
    return (await api.post<TrainingUserDTO>(`/training-users/cancel-participation/${userId}/${trainingId}`)).data;
}

export async function createTraining(training: Training, users: number[]) {
    const t = {
        id: training.id,
        coachId: training.coachId,
        forType: training.forType,
        time: localISOString(training.time),
        freeSlots: training.freeSlots,
        durationMinutes: training.duration,
        title: training.title,
        description: training.description,
        type: training.type,
        isCanceled: false,
    }
    try {
        console.log("Attempt");
        const resp = await api.post<TrainingDTO>('/trainings/create', t, {
            params: { invitedUserIds: users },
            paramsSerializer: (params) => qs.stringify(params, { indices: false })
        });
        await insertTraining(resp.data);
    } catch (e) {
        console.log("Training creation error: ", e);
        throw new Error(String(e));
    }
}

export async function acceptInvitation(trainingId: number) {
    try {
        const resp = await api.post<TrainingUserDTO>('/training-users/acceptInvitation', {
            trainingId: trainingId
        });
        await insertTrainingUsers([resp.data]);
    } catch(e) {
        throw e;
    }
}

export async function denyInvitation(trainingId: number) {
    try {
        const resp = await api.post<TrainingUserDTO>('/training-users/denyInvitation', {
            trainingId: trainingId
        });
        await insertTrainingUsers([resp.data]);
    } catch(e) {
        throw e;
    }
}