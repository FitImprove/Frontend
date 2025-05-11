import { insertTraining, insertTrainingUsers, TrainingDTO, TrainingUserDTO } from "../db/init";
import { api } from "./api";
import { Training } from "./training";

export type Gender = 'FEMALE' | 'MALE';
export type GenderN = 'FEMALE' | 'MALE' | 'None';

export interface SearchCoachDTO {
    id: number;
    name: string;
    fields: string;
    iconPath: string;
    gymAddress: string;
}

export async function search(gender: GenderN, name: string, field: string): Promise<SearchCoachDTO[]> {
    try {
        const resp = await api.get<SearchCoachDTO[]>('/coaches/search', {
            params: {
                name,
                gender: gender === 'None' ? null : gender,
                field
            }
        });
        return resp.data;
    } catch(e) {console.log(`Error while getting search result: `, e); throw new Error(String(e))}
}

export async function bookTraining(_training: Training) {
    try {
        const trainingUser = (await api.post<TrainingUserDTO>('/training-users/enroll', {
            trainingId: _training.id
        })).data;
        const tResp = await api.get<TrainingDTO>(`/trainings/${trainingUser.trainingId}`)
        await insertTraining(tResp.data);
        await insertTrainingUsers([trainingUser]);
    } catch (e) {console.log(e); throw e}
}