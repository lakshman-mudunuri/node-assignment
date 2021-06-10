const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
let isValid = require("date-fns/isValid");
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
const working = (request, response, next) => {
  if (request.query.status !== undefined) {
    if (
      request.query.status === "TO DO" ||
      request.query.status === "IN PROGRESS" ||
      request.query.status === "DONE"
    ) {
      console.log("status");
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (request.query.priority !== undefined) {
    if (
      request.query.priority === "HIGH" ||
      request.query.priority === "MEDIUM" ||
      request.query.priority === "LOW"
    ) {
      console.log("priority");
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (request.query.category !== undefined) {
    if (
      request.query.category === "WORK" ||
      request.query.category === "HOME" ||
      request.query.category === "LEARNING"
    ) {
      console.log("category");
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (request.query.search_q !== undefined) {
    console.log("search_q");
    next();
  }
};

const wo = (request, response, next) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  let a = false,
    b = false,
    c = false,
    d = false,
    e = false;
  if (todo !== undefined) {
    a = true;
  }
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    b = true;
  }
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    c = true;
  }
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    d = true;
  }
  if (dueDate !== undefined) {
    let da = isValid(new Date(dueDate));
    if (da === true) {
      e = true;
    } else {
      e = false;
    }
  }
  if (a === true && b === true && c === true && d === true && e === true) {
    next();
  } else {
    switch (false) {
      case a:
        response.send(400);
        response.send("Invalid Todo");
        break;
      case b:
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
      case c:
        response.status(400);
        response.send("Invalid Todo Status");
        break;
      case d:
        response.status(400);
        response.send("Invalid Todo Category");
        break;
      case e:
        response.status(400);
        response.send("Invalid Due Date");
    }
  }
};

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

app.get("/todos/", working, async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  console.log("to");
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
  let dat = isValid(new Date(date));
  console.log(dat);
  if (dat == true) {
    const getQuery = `SELECT * FROM todo WHERE due_date="${date}"`;
    const result = await db.all(getQuery);
    response.send(result.map((item) => converting(item)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", wo, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date) 
    VALUES(${id},"${todo}","${priority}","${status}","${category}","${dueDate}")`;
  await db.run(createQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  let updateQuery;
  let a;
  let value = true;
  let dat = isValid(new Date(dueDate));
  switch (true) {
    case havingStatus(request.body):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateQuery = `UPDATE todo SET status="${request.body.status}" WHERE id=${todoId}`;
        a = "Status Updated";
        break;
      } else {
        value = false;
        response.status(400);
        a = "Invalid Todo Status";
        break;
      }
    case havingPriority(request.body):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateQuery = `UPDATE todo SET status="${request.body.priority}" WHERE id=${todoId}`;
        a = "Priority Updated";
        break;
      } else {
        value = false;
        response.status(400);
        a = "Invalid Todo Priority";
        break;
      }
    case havingTodo(request.body):
      updateQuery = `UPDATE todo SET status="${request.body.todo}" WHERE id=${todoId}`;
      a = "Todo Updated";
      break;
    case havingCategory(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateQuery = `UPDATE todo SET status="${request.body.category}" WHERE id=${todoId}`;
        a = "Category Updated";
        break;
      } else {
        value = false;
        response.status(400);
        a = "Invalid Todo Category";
        break;
      }
    case havingDuedate(request.body):
      if (dat === true) {
        updateQuery = `UPDATE todo SET status="${request.body.dueDate}" WHERE id=${todoId}`;
        a = "Due Date Updated";
        break;
      } else {
        value = false;
        response.status(400);
        a = "Invalid Due Date";
        break;
      }

    default:
      response.send("give what to update");
  }
  if (value) {
    await db.run(updateQuery);
    response.send(a);
  } else {
    response.send(a);
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
