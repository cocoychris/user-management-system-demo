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
 * @interface ResetPassword200Response
 */
export interface ResetPassword200Response {
    /**
     * The message indicating the password has been reset.
     * @type {string}
     * @memberof ResetPassword200Response
     */
    message: string;
}

/**
 * Check if a given object implements the ResetPassword200Response interface.
 */
export function instanceOfResetPassword200Response(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "message" in value;

    return isInstance;
}

export function ResetPassword200ResponseFromJSON(json: any): ResetPassword200Response {
    return ResetPassword200ResponseFromJSONTyped(json, false);
}

export function ResetPassword200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResetPassword200Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': json['message'],
    };
}

export function ResetPassword200ResponseToJSON(value?: ResetPassword200Response | null): any {
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

