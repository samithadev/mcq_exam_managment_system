const express = require('express');
const cors = require('cors');
const userRouter = require('./api/user');
const roleRouter = require('./api/role');
const sql_connection = require('./db/db');
const examRouter = require('./api/exam');
const questionRouter = require('./api/question');
const answerRouter = require('./api/answers');
const studentansRouter = require('./api/studentans');
const examenrollRouter = require('./api/examenroll');

const app = express();
app.use(express.json());
app.use(cors());


const connectDB = async () => {
    try{
        if(!sql_connection){
            return new Error("can't connect sql");
        }
        console.log('DB connection sucessfull!')
    }
    catch(error){
        console.log(error)
    }
}

connectDB();

app.use("/user", userRouter)
app.use("/role", roleRouter)
app.use("/exam", examRouter)
app.use('/question', questionRouter)
app.use('/answers',answerRouter )
app.use('/studentAnswers',studentansRouter )
app.use('/examenroll', examenrollRouter)

app.listen(8000, ()=> console.log("Server is listening on port 8000."))