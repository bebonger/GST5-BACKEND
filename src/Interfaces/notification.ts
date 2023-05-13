export enum NotificationType {
    TeamInvite = "team_invite",
    MatchReminder = "match_reminder",
    PoolUpdate = "pool_update",
    General = "general"
}

export interface Notification {
    type: NotificationType,
    data: object
}