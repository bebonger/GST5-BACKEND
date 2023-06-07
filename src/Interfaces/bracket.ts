import { TeamInfo } from "./team"
import { UserInfo } from "./user"

export enum MatchStage {
    GroupStage = "GS",
    RoundOf16 = "RO16",
    Quarterfinals = "QF",
    Semifinals = "SF",
    Finals = "F",
    GrandFinals = "GF"
}

export interface MatchInfo {
    matchID: string,
    stage: MatchStage,
    redTeam: TeamInfo
    blueTeam: TeamInfo
    schedule: Date | null,
    result: ResultInfo | null
}

export interface ResultInfo {
    redTeam: string,
    blueTeam: string,
}

export interface GroupInfo {
    groupID: GroupID;
    seedA: TeamInfo | null,
    seedB: TeamInfo | null,
    seedC: TeamInfo | null,
    seedD: TeamInfo | null,
    seedE: TeamInfo | null,
}

export enum GroupID {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H"
}