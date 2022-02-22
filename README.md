# mdbe-forum-api
## Instructions:
1. Install node.js from its official website or using command line.
2. Install PostgresSQL.
3. [Optional] You can install your favourite programming-language text editor (e.g Visual Studio Code, Atom, Sublime Text, Notepad++) or you can use the default text editor of your computer.
4. Next, open the terminal in your computer, point to the location/path of this project which you have been downloaded/clone.
5. Install the required dependencies with this command: **npm install**.
6. After you success to install the dependencies, next step you should to create your own **.env** file which based on the **.env.sample** template or you can change the extension of **.env.sample** to **.env**.
7. Don't forget to fill the empty variable on that file with our own configuration and credentials (e.g change the PGUSER, PGPASSWORD for production stage or testing stage variable with your own postgresSQL credentials, change the HTTP Server: HOST with your server or you can use localhost), other than that, you can also keep the default values provided (i.e PORT, PGPORT, etc).
8. Change the PGDATABASE & PGDATABASE_TEST with **forumapi** & **forumapi_test** (you can change with your preferred name).
9. After you complete to made a changes, don't forget to save the file.
10. Next, create folder **/config/database**, inside it create a file with the name **test.json**, open that file and write this:
```json
{
  "user": "postgresuser",
  "password": "postgrespassword",
  "host": "localhost",
  "port": 5432,
  "database": "forumapi_test"
}
```
11. fill the value of each key with the configuration you have made before in the **.env** file.
12. The last step, you should to run the migration using this command:
```sh
~$: npm run migrate up
~$: npm run test
```

If you successfull to follow the instruction, you can run the test suites first to check the code is safe with this command:
```sh
~$: npm run test
```

If all test suites is passed, try to start the service with this command:
```sh
~$: npm run start:dev
```

Use Postman or whatever it is to simulate the service.
