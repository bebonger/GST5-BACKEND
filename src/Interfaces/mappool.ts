import { MatchStage } from "./bracket"

export enum PoolMod {
    NM = "NM",
    HD = "HD",
    HR = "HR",
    DT = "DT",
    FM = "FM",
    EZ = "EZ",
    FL = "FL",
    TB = "TB",
}

export interface MapInfo {
    stage: MatchStage
    mod: PoolMod,
    slot: number,
    info: {
        mapID: number,
        title: string,
        artist: string,
        mapper: string,
        difficulty: string,
        url: string,
        cover: string,
    },
    data: {
        length: number,
        BPM: number,
        star_rating: number,
        CS: number,
        AR: number,
        OD: number,
        HP: number,
        ez_mult: number
    }
}