
import _ from 'lodash';
import { getNumbers, assignNumbers } from './user';
import { createSubscriber, deleteSubscriber, setDisplayName,
    setPbxExtension, setPbxHuntPolicy, setPbxHuntTimeout,
    setPbxGroupMemberIds, setPbxGroupIds, getSubscribers } from './subscriber';
import uuid from 'uuid';
import { getList } from './common'

var createId = uuid.v4;

export const PBX_CONFIG_ORDER_BY = 'created_timestamp';
export const PBX_CONFIG_ORDER_DIRECTION = 'desc';

export function getGroups(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 1
            }
        });
        getSubscribers(options).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSeats(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 0
            }
        });
        getSubscribers(options).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getPilot(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 1
            }
        });
        getSubscribers(options).then((subscribers)=>{
            if(subscribers.items.length === 1) {
                resolve(subscribers.items[0]);
            }
            else {
                resolve(null);
            }
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDevices(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: '/api/pbxdevices/',
            root: '_embedded.ngcp:pbxdevices'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getProfiles(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: '/api/pbxdeviceprofiles/',
            root: '_embedded.ngcp:pbxdeviceprofiles'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getModels(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: '/api/pbxdevicemodels/',
            root: '_embedded.ngcp:pbxdevicemodels'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getGroupList(page) {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getGroups({
                params: {
                    page: page,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getSeats({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result)=>{
            resolve({
                groups: result[0],
                seats: result[1],
                pilot: result[2],
                numbers: result[3],
                lastPage: result[0].lastPage
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSeatList(page) {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getSeats({
                params: {
                    page: page,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getGroups({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result)=>{
            resolve({
                seats: result[0],
                groups: result[1],
                pilot: result[2],
                numbers: result[3],
                lastPage: result[0].lastPage
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDeviceList(page) {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getDevices({
                params: {
                    page: page,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getProfiles({
                all: true
            }),
            getModels({
                all: true
            })
        ]).then((result)=>{
            resolve({
                devices: result[0],
                profiles: result[1],
                models: result[2],
                lastPage: result[0].lastPage
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function addGroup(group) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return createSubscriber({
                customer_id: group.customerId,
                domain_id: group.domainId,
                username: createId(),
                password: createId(),
                display_name: group.name,
                is_pbx_group: true,
                pbx_extension: group.extension,
                pbx_hunt_policy: group.huntPolicy,
                pbx_hunt_timeout: group.huntTimeout,
                pbx_groupmember_ids: group.seats
            });
        }).then((subscriberId)=>{
            assignNumbers(group.aliasNumbers, subscriberId);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeGroup(id) {
    return deleteSubscriber(id);
}

export function addSeat(seat) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return createSubscriber({
                customer_id: seat.customerId,
                domain_id: seat.domainId,
                username: createId(),
                password: createId(),
                display_name: seat.name,
                is_pbx_group: false,
                pbx_extension: seat.extension,
                pbx_group_ids: seat.groups
            });
        }).then((subscriberId)=>{
            assignNumbers(seat.aliasNumbers, subscriberId);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeSeat(id) {
    return deleteSubscriber(id);
}

export function setGroupName(id, groupName) {
    return setDisplayName(id, groupName);
}

export function setGroupExtension(id, groupExtension) {
    return setPbxExtension(id, groupExtension);
}

export function setGroupHuntPolicy(id, huntPolicy) {
    return setPbxHuntPolicy(id, huntPolicy);
}

export function setGroupHuntTimeout(id, huntTimeout) {
    return setPbxHuntTimeout(id, huntTimeout);
}

export function updateGroupSeats(id, seatIds) {
    return setPbxGroupMemberIds(id, seatIds);
}

export function setSeatName(id, seatName) {
    return setDisplayName(id, seatName);
}

export function setSeatExtension(id, seatExtension) {
    return setPbxExtension(id, seatExtension);
}

export function updateSeatGroups(id, seatIds) {
    return setPbxGroupIds(id, seatIds);
}
