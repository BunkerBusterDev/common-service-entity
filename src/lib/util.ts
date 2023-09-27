import config from 'config';

const getType = (variable: unknown) => {
    let type = 'string';
    if (Array.isArray(variable)) {
        type = 'array';
    } else if (typeof variable === 'string') {
        try {
            const _p = JSON.parse(variable);
            if (typeof _p === 'object') {
                type = 'string_object';
            } else {
                type = 'string';
            }
        } catch (e) {
            type = 'string';
            return type;
        }
    } else if (variable != null && typeof variable === 'object') {
        type = 'object';
    } else {
        type = 'other';
    }

    return type;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeObject = (object: any) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('util', 'makeObject');
    if (getType(object) === 'object') {
        for (const attribute in object) {
            if (attribute in object) {
                if (getType(object[attribute]) !== 'object' || getType(object[attribute]) !== 'array') {
                    if (attribute === 'subl') {
                        if (object[attribute] === null || object[attribute] === '') {
                            object[attribute] = '[]';
                        }
                    }

                    if (
                        attribute == 'aa' ||
                        attribute == 'at' ||
                        attribute == 'lbl' ||
                        attribute == 'srt' ||
                        attribute == 'nu' ||
                        attribute == 'acpi' ||
                        attribute == 'poa' ||
                        attribute == 'enc' ||
                        attribute == 'bn' ||
                        attribute == 'pv' ||
                        attribute == 'pvs' ||
                        attribute == 'mid' ||
                        attribute == 'uds' ||
                        attribute == 'cas' ||
                        attribute == 'macp' ||
                        attribute == 'rels' ||
                        attribute == 'rqps' ||
                        attribute == 'rsps' ||
                        attribute == 'srv' ||
                        attribute == 'mi' ||
                        attribute == 'subl'
                    ) {
                        object[attribute] = JSON.parse(object[attribute]);
                    } else if (attribute == 'trqp') {
                        const trqp_type = getType(object.trqp);
                        if (trqp_type === 'object' || trqp_type === 'array' || trqp_type === 'string_object') {
                            try {
                                object.trqp = JSON.parse(object.trqp);
                            } catch (error) {
                                logger.error(logCategory + error);
                            }
                        }
                    } else if (attribute == 'trsp') {
                        const trsp_type = getType(object.trsp);
                        if (trsp_type === 'object' || trsp_type === 'array' || trsp_type === 'string_object') {
                            try {
                                object.trsp = JSON.parse(object.trsp);
                            } catch (error) {
                                logger.error(logCategory + error);
                            }
                        }
                    } else if (attribute == 'content') {
                        const con_type = getType(object.content);
                        if (con_type === 'object' || con_type === 'array' || con_type === 'string_object') {
                            try {
                                object.content = JSON.parse(object.content);
                            } catch (error) {
                                logger.error(logCategory + error);
                            }
                        }
                    }
                }
            }
        }
    }
};

const getrns = () => {
    return config.resourceInfo;
};

const getrnByty = (ty: string) => {
    return config.resourceInfo[ty];
};

const util = {
    getType: getType,
    makeObject: makeObject,
    getrns: getrns,
    getrnByty: getrnByty,
};

export = util;
