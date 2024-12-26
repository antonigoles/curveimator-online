import {
    InferAttributes,
    CreationOptional,
    InferCreationAttributes,
    Model,
    DataTypes,
    NonAttribute
} from 'npm:@sequelize/core';
import {
    PrimaryKey,
    AutoIncrement,
    Attribute, Table,
    HasMany
} from '@sequelize/core/decorators-legacy';
import ProjectObject from "./projectObject.model.ts";

@Table
export default class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    declare name: string;

    @HasMany(() => ProjectObject, 'projectId')
    declare objects?: NonAttribute<ProjectObject[]>;

    override toJSON(): object {
        return {
          id: this.id,
          name: this.name,
          objects: (this.objects ?? []).map( obj => obj.toJSON() ),
        };
    }
}