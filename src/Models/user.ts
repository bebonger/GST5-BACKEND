import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn } from 'typeorm';
import { getMember } from "../discord";
import { GuildMember } from "discord.js";
import { UserInfo } from '../Interfaces/user';
import { stringify } from 'querystring';
import { config } from "node-config-ts";

@Entity({ name: "discord_users" })
export class DiscordUser extends BaseEntity {
    @PrimaryColumn()
    discordID!: string;

    @Column({ length: 25, nullable: false })
    username!: string;

    @Column({ length: 255, nullable: true })
    avatar?: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    last_verified!: Date;
}

@Entity({ name: "osu_users" })
export class OsuUser extends BaseEntity {
    @PrimaryColumn()
    userID!: number;

    @Column({ length: 25, nullable: false })
    username!: string;

    @Column({ length: 255, nullable: true })
    avatar?: string;

    @Column({ nullable: true })
    global_rank?: number;

    @Column({ nullable: true })
    country_rank?: number;

    @Column('decimal', { nullable: true })
    performance_points?: number;

    @Column({ nullable: false })
    badges!: number;

    @Column({ nullable: false })
    is_restricted!: boolean;

    @Column({ length: 2, nullable: false })
    country_code!: string;

    @OneToOne(() => DiscordUser)
    @JoinColumn({ name: "discord" })
    discord!: DiscordUser;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    last_verified!: Date;

    @Column({ nullable: true })
    accessToken!: string;

    @Column({ default: false })
    gst_banned!: boolean;

    public getInfo = async function(member?: GuildMember | undefined): Promise<UserInfo> {
        if (this.discord?.discordID && !member) {
            member = await getMember(this.discord.discordID.toString());
        }

        const info: UserInfo = {
            discord: {
                avatar: this.discord?.avatar,
                userID: this.discord?.discordID,
                username: member ? `${member.user.username}#${member.user.discriminator}` : this.discord?.username
            }, 
            osu: {
                avatar: this.avatar,
                userID: this.userID,
                username: this.username,
                global_rank: this.global_rank,
                badges: this.badges,
                pp: this.performance_points
            },
            staff: {
                headStaff: member ? config.discord.roles.headStaff.some(r => member!.roles.cache.has(r)) : false,
                staff: member ? member.roles.cache.has(config.discord.roles.staff) : false,
            }
        }
        return info;
    }
}