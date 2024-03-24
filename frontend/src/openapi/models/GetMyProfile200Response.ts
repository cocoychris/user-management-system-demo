/* tslint:disable */
/* eslint-disable */
/**
 * User Management System - API
 * This is a User Management & Authentication API.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: cocoychris@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { UserProfile } from './UserProfile';
import {
    UserProfileFromJSON,
    UserProfileFromJSONTyped,
    UserProfileToJSON,
} from './UserProfile';

/**
 * 
 * @export
 * @interface GetMyProfile200Response
 */
export interface GetMyProfile200Response {
    /**
     * 
     * @type {UserProfile}
     * @memberof GetMyProfile200Response
     */
    userProfile: UserProfile;
}

/**
 * Check if a given object implements the GetMyProfile200Response interface.
 */
export function instanceOfGetMyProfile200Response(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "userProfile" in value;

    return isInstance;
}

export function GetMyProfile200ResponseFromJSON(json: any): GetMyProfile200Response {
    return GetMyProfile200ResponseFromJSONTyped(json, false);
}

export function GetMyProfile200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetMyProfile200Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'userProfile': UserProfileFromJSON(json['userProfile']),
    };
}

export function GetMyProfile200ResponseToJSON(value?: GetMyProfile200Response | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'userProfile': UserProfileToJSON(value.userProfile),
    };
}

