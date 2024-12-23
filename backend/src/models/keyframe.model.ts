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
    Attribute,
    Table,
    BelongsTo,
    NotNull
} from '@sequelize/core/decorators-legacy';
import ProjectObject from "./projectObject.model.ts";

@Table
export default class Keyframe extends Model<InferAttributes<Keyframe>, InferCreationAttributes<Keyframe>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    declare propertyPath: string;

    @Attribute(DataTypes.FLOAT)
    declare time: number;

    @Attribute(DataTypes.FLOAT)
    declare value: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare projectObjectId: number;
}