import {
    InferAttributes,
    InferCreationAttributes,
    Model,
    DataTypes,
    NonAttribute,
    CreationOptional
} from 'npm:@sequelize/core';
import {
    PrimaryKey,
    AutoIncrement,
    Attribute,
    Table,
    HasMany,
    NotNull
} from '@sequelize/core/decorators-legacy';
import Keyframe from "./keyframe.model.ts";

@Table
export default class ProjectObject extends Model<InferAttributes<ProjectObject>, InferCreationAttributes<ProjectObject>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    declare name: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare projectId: number;

    @HasMany(() => Keyframe, 'projectObjectId')
    declare keyframes?: NonAttribute<Keyframe[]>;
}