type ValidatorResult = {
    result: boolean;
    message?: string;
}

export function validatorResult(result: boolean, message?: string): ValidatorResult {
    return {
        result, message
    }
}

// Errors

export function missingField(field?: string): ValidatorResult {
    return validatorResult(false, `Missing field: ${field}`)
}

export function incorrectType(field?: string): ValidatorResult {
    return validatorResult(false, `Incorrect field type at: ${field}`)
}

export function wrongSize(field?: string): ValidatorResult {
    return validatorResult(false, `Incorrect size at: ${field}`)
}

export function unsupportedOptions(option?: string): ValidatorResult {
    return validatorResult(false, `${option} is not supported`)
}

export  function validatorFinish(at: string): ValidatorResult {
    return validatorResult(false, `At "${at}": Validator finished it's work without being able to assess the path`);
}

/// Validators

export function validateCreateBezier(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("name" in data.data)) return missingField('data.name');
    if (typeof data.data.name !== 'string') return incorrectType('data.name');
    if (!("controlPoints" in data.data)) return missingField('data.controlPoints');

    if("position" in data.data) {
        if (!(data.data.position instanceof Array)) return incorrectType('data.position');
        if (data.data.position.length !== 2) return wrongSize('data.position');
        if (isNaN(data.data.position[0])) return incorrectType('data.position[0]');
        if (isNaN(data.data.position[1])) return incorrectType('data.position[1]')
    }

    if("scale" in data.data) {
        if (isNaN(data.data.scale)) return incorrectType('data.scale');
    }

    if("rotation" in data.data) {
        if (isNaN(data.data.rotation)) return incorrectType('data.rotation');
    }

    if("color" in data.data) {
        if (!(data.data.color instanceof Array)) return incorrectType('data.data.color');
        if (data.data.color.length !== 4) return wrongSize(`data.data.color`)
        if (isNaN(data.data.color[0]))  return incorrectType(`data.data.color[0]`);
        if (isNaN(data.data.color[1]))  return incorrectType(`data.data.color[1]`);
        if (isNaN(data.data.color[2]))  return incorrectType(`data.data.color[2]`);
        if (isNaN(data.data.color[3]))  return incorrectType(`data.data.color[3]`);
    }

    if("strokeProgress" in data.data) {
        if (isNaN(data.data.strokeProgress)) return incorrectType('data.strokeProgress');
    }

    if("strokeThickness" in data.data) {
        if (isNaN(data.data.strokeThickness)) return incorrectType('data.strokeThickness');
    }

    if (!(data.data.controlPoints instanceof Array)) return incorrectType('data.data.controlPoints');
    for ( let i = 0; i<data.data.controlPoints.length; i++ ) {
        const controlPoint = data.data.controlPoints[i]
        if (!(controlPoint instanceof Array)) return incorrectType('data.data.controlPoints');
        if (controlPoint.length !== 3) return wrongSize(`data.data.controlPoints[${i}]`);
        if (isNaN(controlPoint[0]))  return incorrectType(`data.data.controlPoints[${i}][0]`);
        if (isNaN(controlPoint[1]))  return incorrectType(`data.data.controlPoints[${i}][1]`);
        if (isNaN(controlPoint[2]))  return incorrectType(`data.data.controlPoints[${i}][2]`);
    }
    return validatorResult(true);
}

export function validateControlPointProperty(data: any): ValidatorResult
{
    const path = data.data.propertyPath.split('.');
    if (path.length !== 3) return validatorResult(false, `Bad prop parts length at: ${data.data.propertyPath}`)
    if (isNaN(path[1])) return incorrectType(`path: ${data.data.propertyPath} - ${path[1]} (index)`);
    if (!['x','y'].includes(path[2])) return incorrectType(`path: ${data.data.propertyPath} - ${path[2]} (index)`);
    return validatorResult(true);
}

export function validateColorPropertyPath(data: any): ValidatorResult
{
    const path = data.data.propertyPath.split('.');
    if (path.length !== 2) return validatorResult(false, `Bad prop parts length at: ${data.data.propertyPath}`)
    if (!['r','g','b','a'].includes(path[1])) return incorrectType(`path: ${data.data.propertyPath} - ${path[1]} (index)`);
    return validatorResult(true);
}

export function validatePropertyPath(data: any): ValidatorResult
{
    if (!("propertyPath" in data.data)) return missingField('data.propertyPath');
    if (typeof data.data.propertyPath !== 'string') return incorrectType('data.propertyPath');
    const path = data.data.propertyPath.split('.');
    if (!['cp','x','y','s','r','color','sp','st'].includes(path[0])) return validatorResult(false, `Bad prop path at: ${path[0]}`)
    if (path[0] === 'cp') return validateControlPointProperty(data);
    if (path[0] === 'color') return validateColorPropertyPath(data);
    if (['x','y','s','r','sp','st'].includes(path[0])) return validatorResult(true)
    return validatorFinish('PropertyPath');
}

export function validateCreateKeyframe(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("objectId" in data.data)) return missingField('data.objectId');
    if (!("time" in data.data)) return missingField('data.time');
    if (!("value" in data.data)) return missingField('data.value');
    if (isNaN(data.data.objectId)) return incorrectType('data.objectId (isNaN)');
    if (!Number.isInteger(data.data.objectId)) return incorrectType('data.objectId (isInteger)');
    if (isNaN(data.data.time)) return incorrectType('data.time');
    if (isNaN(data.data.value)) return incorrectType('data.value');
    return validatePropertyPath(data);
}

export function validateCreate(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("type" in data.data)) return missingField('data.type');
    if (data.data.type === "bezier") return validateCreateBezier(data);
    if (data.data.type === "keyframe") return validateCreateKeyframe(data);
    return validatorFinish('CreateObject');
}

export function validateUpdateBezier(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("id" in data.data)) return missingField('data.id');
    if (isNaN(data.data.id)) return incorrectType('data.id (isNaN)');
    if (!Number.isInteger(data.data.id)) return incorrectType('data.id (isInteger)');
    if ("name" in data) {
        if (typeof data.data.name !== 'string') return incorrectType('data.name');
    }

    if("position" in data) {
        if ((data.data.position instanceof Array)) return incorrectType('data.position');
        if (data.data.position.length !== 2) return wrongSize('data.position');
        if (isNaN(data.data.position[0])) return incorrectType('data.position[0]');
        if (isNaN(data.data.position[1])) return incorrectType('data.position[1]')
    }

    if("scale" in data) {
        if (isNaN(data.data.scale)) return incorrectType('data.scale');
    }

    if("rotation" in data) {
        if (isNaN(data.data.rotation)) return incorrectType('data.rotation');
    }

    if("color" in data.data) {
        if (!(data.data.color instanceof Array)) return incorrectType('data.data.color');
        if (data.data.color.length !== 4) return wrongSize(`data.data.color`)
        if (isNaN(data.data.color[0]))  return incorrectType(`data.data.color[0]`);
        if (isNaN(data.data.color[1]))  return incorrectType(`data.data.color[1]`);
        if (isNaN(data.data.color[2]))  return incorrectType(`data.data.color[2]`);
        if (isNaN(data.data.color[3]))  return incorrectType(`data.data.color[3]`);
    }

    if("strokeProgress" in data.data) {
        if (isNaN(data.data.strokeProgress)) return incorrectType('data.strokeProgress');
    }

    if("strokeThickness" in data.data) {
        if (isNaN(data.data.strokeThickness)) return incorrectType('data.strokeThickness');
    }

    if ("controlPoints" in data.data) {
        if (!(data.data.controlPoints instanceof Array)) return incorrectType('data.data.controlPoints');
        for ( let i = 0; i<data.data.controlPoints.length; i++ ) {
            const controlPoint = data.data.controlPoints[i]
            if (!(controlPoint instanceof Array)) return incorrectType('data.data.controlPoints');
            if (controlPoint.length !== 3) return wrongSize(`data.data.controlPoints[${i}]`);
            if (isNaN(controlPoint[0]))  return incorrectType(`data.data.controlPoints[${i}][0]`);
            if (isNaN(controlPoint[1]))  return incorrectType(`data.data.controlPoints[${i}][1]`);
            if (isNaN(controlPoint[2]))  return incorrectType(`data.data.controlPoints[${i}][2]`);
        }
    }
    return validatorResult(true);
}

export function validateUpdateKeyframe(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("id" in data.data)) return missingField('data.id');
    if (isNaN(data.data.id)) return incorrectType('data.id (isNaN)');
    if (!Number.isInteger(data.data.id)) return incorrectType('data.id (isInteger)');

    if ("time" in data.data) {
        if (isNaN(data.data.time)) return incorrectType('data.time');
    }
    if ("value" in data.data) {
        if (isNaN(data.data.value)) return incorrectType('data.value');
    }
    if ("propertyPath" in data.data) {
        return validatePropertyPath(data);
    }

    return validatorResult(true);
}

export function validateUpdate(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("type" in data.data)) return missingField('data.type');
    if (data.data.type === "bezier") return validateUpdateBezier(data);
    if (data.data.type === "keyframe") return validateUpdateKeyframe(data);
    return validatorFinish('validateUpdate');
}

export function validateDelete(data: any): ValidatorResult
{
    if (!("data" in data)) return missingField('data');
    if (!("type" in data.data)) return missingField('data.type');
    if (!("id" in data.data)) return missingField('data.id');
    if (!['keyframe', 'bezier'].includes(data.data.type)) return incorrectType('data.type');
    return validatorResult(true);
}

export function validateProjectUpdate(data: any): ValidatorResult
{
    if  (!("type" in data)) return missingField('type');
    if (data.type === "create") return validateCreate(data);
    if (data.type === "update") return validateUpdate(data);
    if (data.type === "delete") return validateDelete(data);
    console.log(data)
    return validatorFinish('validateProjectUpdate');
}

