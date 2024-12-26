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
    NotNull,
    Default,
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

    @Attribute(DataTypes.STRING)
    declare type: string;

    @Attribute(DataTypes.JSON)
    declare serializedData: object;

    @Attribute(DataTypes.JSON)
    @Default([0,0,0])
    declare position: object;

    @Attribute(DataTypes.FLOAT)
    @Default(0)
    declare rotation: number;

    @Attribute(DataTypes.FLOAT)
    @Default(1.0)
    declare scale: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare projectId: number;

    @HasMany(() => Keyframe, 'projectObjectId')
    declare keyframes?: NonAttribute<Keyframe[]>;

    override toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            serializedData: this.serializedData,
            position: this.position,
            rotation: this.rotation,
            scale: this.scale,
            keyframes: (this.keyframes ?? []).map( keyframe => keyframe.toJSON() ),
        };
    }
}