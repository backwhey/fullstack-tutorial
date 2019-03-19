// mkdir example

// cd example

// code .

// npm init -y (creates default package.json)

/*********************************
 * 
 * webpack.config.js (create in vscode)
 * 
 * 
 * 
 *  */ 

const path = require("path")

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "./clent/src"),
  output: {
    path: path.resolve(__dirname, "./client/dist"),
    filename: "bundle.js" //houses all transpiled code
  },
  module: {
    rules: [
      {
        loader: "babel-loader",
        test: /\.js(x)?/, //look for js or jsx extension
        exclude: /node_modules/,
        options: {
          presets: ["react", "env"]
        }
      }
    ]
  },
  resolve: {
    extensions: ["js", "jsx"] //types of files we will be testing for
  }
};

/************************
 * 
 * Create client, server, and database folders
 * 
 * 
 * 
 */

 //Server folder (index.js, controller.js, routes.js)

 //Database folder (models.js, index.js)

 //Client folder 
  //dist folder, src folder
  //dist folder (index.html, !enter boilerplate for html file, css, bundle (made for us when we run build)

  //src folder 
    //components folder
    //index.js

/***************
 * 
 * 
 * Server
 * 
 */

 //server/index.js

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const db = require("../database/index");
const router = require("./routes");

const server = express();
const PORT = 3000;

server.use(bodyParser.json());
server(bodyParser.urlencoded({extended: true})); //(urlenncoded) if theres an object within an object it will still parse the object

server.use(express.static(path.join(__dirname, "../client/dist"))); //express static serves static files, path.join joins two paths
//any html file is a static file (static homepage). Will automatically look for index.html in folder

server.use("/api", router); //dont want people to make any requests on the homepage, thats why we use api

server.listen(PORT, () => console.log(`connected to port: ${PORT}`));
//finished express server
 

//server/routes.js

const router = require("express").Router();
const controller = require("./controller");

router
.route("/todos")
.get(controller.get)
.post(controller.post)
.put(controller.update)
.delete(controller.delete)

module.exports = router;

//database/index.js
const mysql = require("mysql");
const Sequelize = require("sequelize");

const connection = new Sequelize("databaseName", "root", "root", {
  host: "localhost",
  dialect: "mysql"
})

connection
.authenticate()
.then(() => console.log("connected to mysql database"))
.catch(err => console.log(err));

module.exports = connection;

//database/models.js

const connection = require("./")
const Sequelize = require("sequelize");

const Todo = connection.define( //name of table
  "Todo",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false }
  },
  {
    timestamps: false
  }
);

connection
.sync()
.then(() => console.log("Synced with mysql database"))
.catch(err => console.error(err));

module.exports = { Todo };
//database done

//server/controller.js

const { Todo } = require("../database/models");

const controller = {
  get: (req, res) => {
    Todo.findAll({}) //empty object means there are no paramenters you want the query to look up (can be left empty)
    .then(data => res.status(200).send(data))
    .catch(err => console.error(err));
  },
  post: (req, res) => {
    const { name } = req.body; //referred to name in model
    Todo.create({ name }) //creates something in our sql database (same as name: name)
    .then(data => {
      res.status(201).send("posted")
    })
    .catch(err => console.error(err))
  },
  update: (req, res) => {
    const { name, newName } = req.body //need two things, name you want to update and name you want to update with
    Todo.update({name: newName}, { where: {name}}) //name = newName where it was intitially the old name
    .then(data => res.status(202).send("updated")) //RESTful api so it doesnt send back anything
    .catch(err => console.error(err));
  },
  delete: (req, res) => {
    const {name} = req.query //request the client made and its located in query
    Todo.destroy({
      where: {name}
    }).then(data => 
        res
          .status(203)
          .send("deleted")
          .catch(err => console.error(err))
    );
  } 
}

module.exports = controller;
//server and database is complete

//client/src/index.js

import React from 'react';
import {render} from 'react-dom';
import App from './components/App';

render(<App />, document.getElementById('app'));

//client/dist/index.html
//inside body
<div id="app"></div>
<script src="./bundle.js"></script>

//client/src/components
//make App.jsx

import React, {Component} from 'react';
import axios from 'axios';
import TodoList from './TodoList' //remember to import newly created component

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: '',
      todos: [],
    }
  }

  componentDidMount() { 
    this.fetchTodos();
  }

  fetchTodos() {
    axios
    .get("/api/todos") //path we created
    .then(data => {
      this.setState({
        todos: data.data //controller sends data (hence data.data)
      })
    })
    .catch(err => console.error(err));
  }
  //makes a get request to api/todos, set state to todos, now populated with todos

  handleInput(e) {
    this.setState({
      todo: e.target.value
    })
  }

  addTodo() {
    axios
    .post("/api/todos", { name: this.state.todo }) //name in controller post
    .then(() => this.fetchTodos()) //update with added todo
    .catch(err => console.error(err))
  }

  deleteTodo(name) {
    axios
    .delete("/api/todos", { params: {name}}) //not the same as req.params
    .then(() => this.fetchTodos())
    .catch(err => console.error(err))
  }

  render() {
    return (
      <div>
        <h1>TODO LIST</h1>
        <form>
          <input onChange={e => this.handleInput(e)} />
          <button onClick={() => this.addTodo()}>ADD TODO</button>
        </form>
        <TodoList todos={this.state.todos} delete={this.deleteTodo}/>
      </div>
    )
  }
}

//client/src/componenets
//create TodoList.jsx

import React from 'react';
import TodoListEntry from "./TodoListEntry";

export default function TodoList(props) {
  return (
    <div>
      <h3>Todos</h3>
      <ul>
        {props.todos.map(todo => (
          <li key={todo.id}>
            <TodoListEntry todo={todo} delete={props.delete}/>
          </li>
        ))}
      </ul>
    </div>
  )
}

//client/src/components
//create TodolistEntry.jsx

import React from 'react';

export default function TodoListEntry(props) {
  return (
    <div onClick={() => props.delete(props.todo.name)}>
      {props.todo.name}
    </div>
  )
}


