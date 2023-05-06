export interface UserInfo {
    discord: {
        avatar: string;
        userID: string;
        username: string;
    };
    osu: {
        avatar: string;
        userID: number;
        username: string;
    };
    staff: {
        headStaff: boolean;
        staff: boolean;
    };
}

export interface OsuUser {
    userID: number;
    username: string;
    avatar: string;
    global_rank: number;
    country_rank: number;
    badges: number;
    is_restricted: boolean;
    country_code: string;
    discord: UserDiscord;
}

export interface UserDiscord {
    discordID: number;
    username: string;
    avatar: string;
    last_verified: Date;
}
