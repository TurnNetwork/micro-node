
const sqlite3 = require('sqlite3')
const path = require('path')
let DB_PATH = path.resolve(process.cwd(), '/db/config/index.db');


function connectDatabase() {
    return new sqlite3.Database(DB_PATH, (err: any) => {
        if (err) {
            console.error('--------------------connectDatabaseErr' + err.message);
        }
        console.log('-----------------sqlite3已经连接成功')
    });
}

const db = connectDatabase();


function createDataTable() {
    /**
     * @Description: 
     * @CreationDate 2023-06-01 22:53:23
     */

    db.serialize(function () {
        db.run(`create table if not exists process (id INTEGER PRIMARY KEY AUTOINCREMENT,pid INT  COMMENT 'pid' ,child_process_pid INT  COMMENT '' , prot INT  COMMENT '', enode VARCHAR COMMENT '' );`);
    });
    // db.close();
}




export {
    connectDatabase,
    createDataTable,
    db
}


export const add = (sql: string) => {
    return new Promise((resolve, reject) => {
        db.run(sql, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        }
        );
    });
}