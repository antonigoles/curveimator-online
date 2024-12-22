import { Table, Column, Model, BelongsTo, HasMany } from 'sequelize-typescript';
import Keyframe from "./keyframe.model.ts";
import Project from "./project.model.ts";

@Table
export default class ProjectObject extends Model {
    @Column({primaryKey: true})
    declare id: number;

    @Column
    declare name: string;

    @BelongsTo(() => Project)
    declare project: Project;

    @HasMany(() => Keyframe)
    declare keyframes: Keyframe
}