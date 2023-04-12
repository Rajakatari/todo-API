// # Todo Application
const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running..!");
    });
  } catch (e) {
    console.log(`DB error : '${e.message}'`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Given an `app.js` file and an empty database file `todoApplication.db`.

// Create a table with the name `todo` with the following columns,

// **Todo Table**

// | Column   | Type    |
// | -------- | ------- |
// | id       | INTEGER |
// | todo     | TEXT    |
// | priority | TEXT    |
// | status   | TEXT    |

// and write APIs to perform operations on the table `todo`,

// <MultiLineNote>

//   - Replace the spaces in URL with `%20`.
//   - Possible values for `priority` are `HIGH`, `MEDIUM`, and `LOW`.
//   - Possible values for `status` are `TO DO`, `IN PROGRESS`, and `DONE`.
// </MultiLineNote>

// ### API 1

// #### Path: `/todos/`
// app.get("/todos/", async (request, response) => {
//   const dbQuery = `select * from todo;`;
//   const resultArray = await db.all(dbQuery);
//   response.send(resultArray);
// });

// #### Method: `GET`

// - **Scenario 1**

//   - **Sample API**
//     ```
//     /todos/?status=TO%20DO
//     ```
//   - **Description**:

//     Returns a list of all todos whose status is 'TO DO'

//   - **Response**

//     ```
//     [
//       {
//         id: 1,
//         todo: "Watch Movie",
//         priority: "LOW",
//         status: "TO DO"
//       },
//       ...
//     ]
//     ```

// - **Scenario 2**

//   - **Sample API**
//     ```
//     /todos/?priority=HIGH
//     ```
//   - **Description**:

//     Returns a list of all todos whose priority is 'HIGH'

//   - **Response**

//     ```
//     [
//       {
//         id: 2,
//         todo: "Learn Node JS",
//         priority: "HIGH",
//         status: "IN PROGRESS"
//       },
//       ...
//     ]
//     ```

// - **Scenario 3**

//   - **Sample API**
//     ```
//     /todos/?priority=HIGH&status=IN%20PROGRESS
//     ```
//   - **Description**:

//     Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'

//   - **Response**

//     ```
//     [
//       {
//         id: 2,
//         todo: "Learn Node JS",
//         priority: "HIGH",
//         status: "IN PROGRESS"
//       },
//       ...
//     ]
//     ```

// - **Scenario 4**

//   - **Sample API**
//     ```
//     /todos/?search_q=Play
//     ```
//   - **Description**:

//     Returns a list of all todos whose todo contains 'Play' text

//   - **Response**

//     ```
//     [
//       {
//         id: 4,
//         todo: "Play volleyball",
//         priority: "MEDIUM",
//         status: "DONE"
//       },
//       ...
//     ]
//     ```
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const dbQuery = `select * from todo where status like '%${status}%' and 
  priority like '%${priority}%' and todo like '%${search_q}%';`;
  const resultArray = await db.all(dbQuery);
  response.send(resultArray);
});
// ### API 2

// #### Path: `/todos/:todoId/`

// #### Method: `GET`

// #### Description:

// Returns a specific todo based on the todo ID

// #### Response

// ```
// {
//   id: 2,
//   todo: "Learn JavaScript",
//   priority: "HIGH",
//   status: "DONE"
// }
// ```
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `select * from todo where id = '${todoId}';`;
  const todoDetails = await db.get(dbQuery);
  response.send(todoDetails);
});
// ### API 3

// #### Path: `/todos/`

// #### Method: `POST`

// #### Description:

// Create a todo in the todo table,

// #### Request

// ```
// {
//   "id": 10,
//   "todo": "Finalize event theme",
//   "priority": "LOW",
//   "status": "TO DO"
// }
// ```

// #### Response

// ```
// Todo Successfully Added
// ```
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const insertDBQuery = `insert into todo(id,todo,priority,status) 
    values('${id}','${todo}','${priority}', '${status}');`;
  await db.run(insertDBQuery);
  response.send("Todo Successfully Added");
});

// ### API 4

// #### Path: `/todos/:todoId/`

// #### Method: `PUT`

// #### Description:

// Updates the details of a specific todo based on the todo ID

// - **Scenario 1**

//   - **Request**
//     ```
//     {
//       "status": "DONE"
//     }
//     ```
//   - **Response**

//     ```
//     Status Updated
//     ```

// - **Scenario 2**

//   - **Request**
//     ```
//     {
//       "priority": "HIGH"
//     }
//     ```
//   - **Response**

//     ```
//     Priority Updated
//     ```

// - **Scenario 3**

//   - **Request**
//     ```
//     {
//       "todo": "Some task"
//     }
//     ```
//   - **Response**

//     ```
//     Todo Updated
//     ```

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const withoutUpdateDbQuery = `select * from todo where id = '${todoId}';`;
  const pre = await db.get(withoutUpdateDbQuery);
  const {
    todo = pre.todo,
    priority = pre.priority,
    status = pre.status,
  } = request.body;
  let updateColumn = "";
  const requestBody = request.body;
  if (requestBody.status !== undefined) {
    updateColumn = "Status";
  } else if (requestBody.priority !== undefined) {
    updateColumn = "Priority";
  } else if (requestBody.todo !== undefined) {
    updateColumn = "Todo";
  }
  const dbQuery = `update todo set
      todo = '${todo}', priority = '${priority}' , status = '${status}' where id = '${todoId}';`;

  await db.run(dbQuery);
  response.send(`${updateColumn} Updated`);
});

// ### API 5

// #### Path: `/todos/:todoId/`

// #### Method: `DELETE`

// #### Description:

// Deletes a todo from the todo table based on the todo ID

// #### Response

// ```
// Todo Deleted
// ```
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `delete from todo where id = '${todoId}';`;
  await db.run(dbQuery);
  response.send("Todo Deleted");
});

// <br/>

// Use `npm install` to install the packages.

// **Export the express instance using the default export syntax.**

// **Use Common JS module syntax.**

module.exports = app;
