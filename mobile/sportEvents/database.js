import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'UserDatabase.db', location: 'default' },
  () => { console.log('Database opened'); },
  error => { console.log('Error opening database', error); }
);

export const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY NOT NULL, nickname TEXT);',
      [],
      () => { console.log('Table created successfully'); },
      error => { console.log('Error creating table', error); }
    );
  });
};

export const insertUser = (id, nickname) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Users (id, nickname) VALUES (?, ?)',
      [id, nickname],
      () => { console.log('User inserted successfully'); },
      error => { console.log('Error inserting user', error); }
    );
  });
};

export const getNickname = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT nickname FROM Users WHERE id = ?',
      [id],
      (tx, results) => {
        if (results.rows.length > 0) {
          const nickname = results.rows.item(0).nickname;
          callback(nickname);
        } else {
          callback(null);
        }
      },
      error => { console.log('Error fetching nickname', error); }
    );
  });
};
