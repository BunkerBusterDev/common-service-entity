import { Connection } from 'mongoose';

// import Hit from 'db/models/hit';/

export default class CB {
    constructor() {}

    public async create(connection: Connection) {
        try {
            if (connection) {
                console.log('');
            }
        } catch (error) {
            console.log(error);
        }
    }
}
