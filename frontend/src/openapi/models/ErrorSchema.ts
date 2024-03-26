/* tslint:disable */
/* eslint-disable */
/**
 * User Management System - API
 * APIs for user management and authentication. Double CSRF protection is used, therefore, the client must send the CSRF token in both the cookie and the request header for the non-GET requests.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: cocoychris@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface ErrorSchema
 */
export interface ErrorSchema {
    /**
     * The error message.
     * @type {string}
     * @memberof ErrorSchema
     */
    message: string;
}

/**
 * Check if a given object implements the ErrorSchema interface.
 */
export function instanceOfErrorSchema(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "message" in value;

    return isInstance;
}

export function ErrorSchemaFromJSON(json: any): ErrorSchema {
    return ErrorSchemaFromJSONTyped(json, false);
}

export function ErrorSchemaFromJSONTyped(json: any, ignoreDiscriminator: boolean): ErrorSchema {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': json['message'],
    };
}

export function ErrorSchemaToJSON(value?: ErrorSchema | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'message': value.message,
    };
}

