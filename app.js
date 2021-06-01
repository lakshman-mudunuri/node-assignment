const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
const initalizing = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server Started");
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initalizing();

function havingStatus(item) {
  return item.status !== undefined;
}

function havingPriority(item) {
  return item.priority !== undefined;
}

function havingTodo(item) {
  return item.todo !== undefined;
}

function havingCategory(item) {
  return item.category !== undefined;
}
function havingDuedate(item) {
  return item.dueDate !== undefined;
}

function converting(i) {
  return {
    id: i.id,
    todo: i.todo,
    priority: i.priority,
    status: i.status,
    category: i.category,
    dueDate: i.due_date,
  };
}
const working = (request, response, next) => {
  if (
    request.query.status !== undefined &&
    (request.query.status === "TO DO" ||
      request.query.status === "IN PROGRESS" ||
      request.query.status === "DONE")
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};
app.get("/todos/", working, async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  const query = `SELECT * FROM todo WHERE status LIKE "%${status}%"  AND priority LIKE "%${priority}%" AND todo LIKE "%${search_q}%" AND category LIKE "%${category}%"`;
  const result = await db.all(query);
  a = result.map((item) => converting(item));
  response.send(a);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const result = await db.get(getQuery);
  response.send(converting(result));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const getQuery = `SELECT * FROM todo WHERE due_date="${date}"`;
  const result = await db.all(getQuery);
  response.send(result.map((item) => converting(item)));
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date) 
    VALUES(${id},"${todo}","${priority}","${status}","${category}","${dueDate}")`;
  await db.run(createQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateQuery;
  let a;
  switch (true) {
    case havingStatus(request.body):
      updateQuery = `UPDATE todo SET status="${request.body.status}" WHERE id=${todoId}`;
      a = "Status Updated";
      break;
    case havingPriority(request.body):
      updateQuery = `UPDATE todo SET status="${request.body.priority}" WHERE id=${todoId}`;
      a = "Priority Updated";
      break;
    case havingTodo(request.body):
      updateQuery = `UPDATE todo SET status="${request.body.todo}" WHERE id=${todoId}`;
      a = "Todo Updated";
      break;
    case havingCategory(request.body):
      updateQuery = `UPDATE todo SET status="${request.body.category}" WHERE id=${todoId}`;
      a = "Category Updated";
      break;
    case havingDuedate(request.body):
      updateQuery = `UPDATE todo SET status="${request.body.dueDate}" WHERE id=${todoId}`;
      a = "Due Date Updated";
      break;

    default:
      response.send("give what to update");
  }
  await db.run(updateQuery);

  response.send(a);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
