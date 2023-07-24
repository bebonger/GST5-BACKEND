import { redisStore } from 'koa-redis';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index, ManyToOne } from 'typeorm';
import { Team } from './team';
import { GroupID, GroupInfo, MatchStage } from '../Interfaces/bracket';
import { MatchInfo } from '../Interfaces/bracket';
import { v4 as uuid } from 'uuid';

@Entity({ name: "matches" })
export class Match extends BaseEntity {
    @PrimaryColumn()
    matchID!: string; 

    @Column({ type: "enum", enum: MatchStage, name: "stage" })
    stage!: MatchStage;

    @ManyToOne(() => Team, { nullable: false })
    @JoinColumn({ name: "red_team" })
    redTeam!: Team;

    @ManyToOne(() => Team, { nullable: false })
    @JoinColumn({ name: "blue_team" })
    blueTeam!: Team;

    @Column({ nullable: true })
    schedule_date: string;

    @Column({ nullable: true })
    schedule_time: string;

    @Column({ nullable: false })
    redTeamScore: number = 0;

    @Column({ nullable: false })
    blueTeamScore: number = 0;

    @Column({ nullable: true})
    mp_link: string;

    @Column({ nullable: true})
    referee: string;

    public getInfo = async function(): Promise<MatchInfo> {

        const info: MatchInfo = {
            matchID: this.matchID,
            stage: this.stage,
            redTeam: await this.redTeam.getInfo(),
            blueTeam: await this.blueTeam.getInfo(),
            schedule: {
                date: this.schedule_date,
                time: this.schedule_time,
            },
            result: {
                redTeamScore: this.redTeamScore,
                blueTeamScore: this.blueTeamScore,
            },
            matchType: null,
            mp_link: this.mp_link,
            referee: this.referee
        };

        return info;
    };
}

@Entity({ name: "schedules" })
export class Schedule extends BaseEntity {

    @PrimaryColumn('uuid')
    id: string = uuid();

    @OneToOne(() => Match, { nullable: false })
    @JoinColumn({ name: "matchID" })
    match!: Match;

    @Column({ type: "timestamp" })
    timing!: Date;
}