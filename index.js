import express from "express"
import mysql from "mysql2"
import cors from "cors"
import dotenv from "dotenv"

const app = express()

dotenv.config()
app.use(cors({ origin: "*"}))
app.use(express.json())

//Conexiones
const conexion = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
})

//Rutas
app.get("/usuario", (req, res) => {
    conexion.query("SELECT * FROM usuario", (err, datos) => {
        if(err) return res.status(500).send(err)

        res.status(200).json(datos)
    })
})

app.post("/registrar", (req, res) => {
    const {fullname, username, email, password} = req.body 

    conexion.query("INSERT INTO usuario (fullname, username, email, password) VALUES (?, ?, ?, ?)",
    [fullname, username, email, password],
    (err, resultado) => {
        if(err) return res.status(500).send(err)

        res.status(201).json(resultado)
    }
    )
})

app.post("/iniciar-sesion", (req, res) => {
    //req.body es el cuerpo de la peticion
    const { identifier, password} = req.body

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g 

    function contraseñaEsValido(passwordFromClient, passwordFromConexion) {
        return passwordFromClient === passwordFromConexion      
    }

    if(emailRegex.test(identifier)){
        conexion.query("SELECT * FROM usuario WHERE email = ?",
        [identifier],
        (err, datos) => {
        if(err) return res.status(400).send(err)
        
        const usuario = {...datos[0]}

        if(contraseñaEsValido(password, usuario.password)){
            res.status(200).json(usuario)
          }else{
            res.status(400).json({message: "Contraseña incorrecta"})
          }

        }
        )
    }else{
        
    conexion.query("SELECT * FROM usuario WHERE username = ?",
    [identifier],
    (err, datos) => {
        if(err) return res.status(400).send(err)

        const usuario = {...datos[0]}

        if(contraseñaEsValido(password, usuario.password)){
            res.status(200).json(usuario)
        }
        else{
            res.status(400).json({message: "Contraseña incorrecta"})
        }
        }
        )
    }
})

//Inicio de servidor
app.listen(3000, () => {
    console.log("Servidor conectado en el puerto 3000")
}) 