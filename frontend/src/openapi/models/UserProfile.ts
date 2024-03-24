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
/**
 * 
 * @export
 * @interface UserProfile
 */
export interface UserProfile {
    /**
     * The user ID.
     * @type {number}
     * @memberof UserProfile
     */
    id: number;
    /**
     * The user's name.
     * @type {string}
     * @memberof UserProfile
     */
    name: string;
    /**
     * The user's email.
     * @type {string}
     * @memberof UserProfile
     */
    email: string;
    /**
     * The time when the user was created.
     * @type {Date}
     * @memberof UserProfile
     */
    createdAt: Date;
    /**
     * The time when the user was last active.
     * @type {Date}
     * @memberof UserProfile
     */
    lastActiveAt: Date;
    /**
     * The number of times the user has logged in.
     * @type {number}
     * @memberof UserProfile
     */
    loginCount: number;
}

/**
 * Check if a given object implements the UserProfile interface.
 */
export function instanceOfUserProfile(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "email" in value;
    isInstance = isInstance && "createdAt" in value;
    isInstance = isInstance && "lastActiveAt" in value;
    isInstance = isInstance && "loginCount" in value;

    return isInstance;
}

export function UserProfileFromJSON(json: any): UserProfile {
    return UserProfileFromJSONTyped(json, false);
}

export function UserProfileFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserProfile {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'email': json['email'],
        'createdAt': (new Date(json['createdAt'])),
        'lastActiveAt': (new Date(json['lastActiveAt'])),
        'loginCount': json['loginCount'],
    };
}

export function UserProfileToJSON(value?: UserProfile | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'email': value.email,
        'createdAt': (value.createdAt.toISOString()),
        'lastActiveAt': (value.lastActiveAt.toISOString()),
        'loginCount': value.loginCount,
    };
}
