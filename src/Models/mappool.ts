import { MapInfo, PoolMod } from '../Interfaces/mappool';
import { MatchStage } from './../Interfaces/bracket';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index, ManyToOne } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity({ name: "mappool" })
export class PoolMap extends BaseEntity {
    
    @PrimaryColumn('uuid')
    id: string = uuid();

    // Pool Info
    @Column({ type: "enum", enum: MatchStage, name: "stage" })
    stage!: MatchStage;

    @Column({ type: "enum", enum: PoolMod, name: "mod"})
    mod!: PoolMod;

    @Column({ nullable: false })
    slot!: number;

    // Beatmap Info
    @Column({ nullable: false })
    url!: string;

    @Column({ nullable: false })
    cover!: string;

    @Column({ nullable: false })
    mapID!: number;

    @Column({ nullable: false })
    artist!: string;

    @Column({ nullable: false })
    title!: string;

    @Column({ nullable: false })
    difficulty!: string;

    @Column({ nullable: false })
    mapper!: string;

    // Beatmap Data
    @Column('decimal', { nullable: false })
    length!: number;

    @Column('decimal',{ nullable: false })
    BPM!: number;
    
    @Column('decimal',{ nullable: false })
    star_rating!: number;

    @Column('decimal',{ nullable: false })
    CS!: number;

    @Column('decimal',{ nullable: false })
    AR!: number;

    @Column('decimal',{ nullable: false })
    OD!: number;

    @Column('decimal',{ nullable: false })
    HP!: number;

    public getInfo = async function(): Promise<MapInfo> {
        const info: MapInfo = {
            stage: this.stage,
            mod: this.mod,
            slot: this.slot,
            info: {
                mapID: this.mapID,
                title: this.title,
                artist: this.artist,
                mapper: this.mapper,
                difficulty: this.difficulty,
                url: this.url,
                cover: this.cover,
            },
            data: {
                length: this.length,
                BPM: this.BPM,
                star_rating: this.star_rating,
                CS: this.CS,
                AR: this.AR,
                OD: this.OD,
                HP: this.HP
            }
        }

        return info;
    }

}
