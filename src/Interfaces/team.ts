import { UserInfo } from "./user";

export interface TeamInfo {
    teamID: number,
    avatar: string,
    name: string,
    player1: UserInfo,
    player2: UserInfo,
}

export interface InviteInfo {
    sender: UserInfo;
    invitee: UserInfo;
    inviteMessage: string;
}