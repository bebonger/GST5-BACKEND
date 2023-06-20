import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index, ManyToOne } from 'typeorm';
import { OsuUser } from './user';
import { InviteInfo, TeamInfo } from '../Interfaces/team';

@Entity({ name: "team_invites" })
export class Invite extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => OsuUser, { nullable: false })
    @JoinColumn({ name: "sender" })
    sender!: OsuUser;
  
    @ManyToOne(() => OsuUser, { nullable: false })
    @JoinColumn({ name: "invitee" })
    invitee!: OsuUser;

    @Column({ length: 255, nullable: true })
    inviteMessage: string | null;

    public getInfo = async function(): Promise<InviteInfo> {
        const info: InviteInfo = {
            sender: await this.sender.getInfo(),
            invitee: await this.invitee.getInfo(),
            inviteMessage: this.inviteMessage
        };

        return info;
    }
}

@Entity({ name: "teams" })
export class Team extends BaseEntity {
    @PrimaryGeneratedColumn()
    teamID!: number;

    @Column({ nullable: false })
    team_name!: string;

    @Column({ nullable: true })
    team_avatar!: string;
    
    @OneToOne(() => OsuUser)
    @JoinColumn({ name: "player1" })
    player1!: OsuUser;

    @OneToOne(() => OsuUser)
    @JoinColumn({ name: "player2" })
    player2!: OsuUser;

    public getInfo = async function(): Promise<TeamInfo> {
        const info: TeamInfo = {
            teamID: this.teamID,
            avatar: this.team_avatar,
            name: this.team_name,
            player1: await this.player1.getInfo(),
            player2: await this.player2.getInfo(),
        };

        return info;
    }
}
