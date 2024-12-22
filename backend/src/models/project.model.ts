import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import ProjectObject from "./projectObject.model.ts";

@Table
export default class Project extends Model {
    @Column({primaryKey: true})
    declare id: number;

    @Column
    declare name: string;

    @HasMany(() => ProjectObject)
    declare objects: ProjectObject
}