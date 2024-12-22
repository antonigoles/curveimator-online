import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import ProjectObject from "./projectObject.model.ts";

@Table
export default class Keyframe extends Model {
    @Column({primaryKey: true})
    declare id: number;

    @Column
    declare propertyPath: string;

    @Column
    declare time: number;

    @Column
    declare value: number;

    @BelongsTo(() => ProjectObject)
    declare project: ProjectObject;
}