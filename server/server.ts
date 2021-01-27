
//importiere aus node

import cryptoJS = require ('crypto-js');
import * as express from "express";
import * as session from "express-session";
import * as mysql from "mysql";

//Module upload img
import * as multer from 'multer'
import * as cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as Loki from 'lokijs'

import {Connection, MysqlError} from "mysql";
import {User} from './model/User';
import {Events} from "./model/Events";
import {Rights} from './model/rights';
import {Config} from './config/config'
import 'localstorage-polyfill';
global['localStorage'] = localStorage;


//deklariere router and connenction
const router: express.Express = express();
const connection: Connection = mysql.createConnection(Config.mysqlOptions)


/******************************************************************************
 * Starte Server
 ******************************************************************************/

router.listen(8089, () => {
        console.log('Server started: http://localhost:8089');
        connection.connect((err: MysqlError) => {
            if (err) {
                console.log('Database Connection failed ' + err)
            } else {
                console.log('Database is connected');
            }
        });
    });


// Set Storage with multer
const storage = multer.diskStorage({
    destination: __dirname + '/../client/assets/uploads/events',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +
            path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 10000000},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).single('eventPic');


function checkFileType(file, cb){
    // Allowed Attachments
    const filetypes = /jpeg|jpg|png|gif/;
    // check Attachmentname
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // If filename contains correct filetype = upload
    if(extname){
        return cb(null, true);
        // If not, error message Images only!
    } else {
        cb('Error: Images only!');
    }
}

//router.use(session(Configuration.sessionOptions));

router.use("/", express.static(__dirname + "/../client/views/"));
router.use("/styles", express.static(__dirname + "/../client/css"));
router.use("/script", express.static(__dirname + "/../client/javascript"));
router.use("/jquery", express.static(__dirname + "/../client/node_modules/jquery/dist"));
router.use("/bootstrap", express.static(__dirname + "/../client/node_modules/bootstrap"));
router.use("/assets", express.static(__dirname + "/../client/assets/"));
router.use("/font-awesome", express.static(__dirname + "/../client/node_modules/@fortawesome/fontawesome-free"));
router.use("/img/events", express.static(__dirname + "/../client/assets/uploads/events"));
router.use(cors())


// Nutzung der Middleware zur Dekodierung von URL- und JSON-kodierten Parametern
router.use(express.urlencoded({extended: false}));
router.use(express.json());
router.use(session(Config.sessionOptions));


router.post("/user", addUser);
router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/login', isLoggedIn, activeLogin);
router.get('/users', isValid(Rights.Admin),getUserList);
router.get('/user/actUsername', getActUser)
router.get('/user/:username?', isLoggedIn, getUser);
router.put('/user/:username?', updateUser);
router.delete('/user/:username?', deleteUser);
router.delete('/delAll', deleteAllUser);
router.post('/addnewevent', addEvent);
router.get('/events', getEvents);


function addUser(req: express.Request, res: express.Response):void {
    console.log(req.body);


    const username: string = req.body.username;
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const rights: number= req.body.rights;

    // encrypt to sha256 with crypto-js
    const password: string = cryptoJS.SHA256(req.body.password).toString();
    // control that everything is filled out
    if (username && firstName && lastName && password) {

        // make array data with user data
        const data: [any, number, string, string, string, string] = [
            new Date(),
            rights,
            username,
            firstName,
            lastName,
            password
        ];

        //SQL query for database
        const query: string = "INSERT INTO user (date, rights, username, user_firstName, user_secondName, user_password)" + "VALUES (?, ?, ?, ?, ?, ?);";

        //  database query with array of data
        connection.query(query, data, (err: MysqlError) => {
            if (err) {
                res.status(500).send({
                    message: 'Datenbankverbindung ist fehlgeschlagen',
                })
            } else {
                res.status(201).send({
                    message: 'New User created'
                })
            }
        })
    } else {
        res.status(400).send({
            message: 'Not all mandatory fields are filled in'
        })
    }
}

function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (req.session.userID) {
            // User has an active session and is logged in, continue with route
            next();
        } else {
            // User is not logged in
            res.status(401).send({
                message: 'Session expired, please log in again',
            });
        }
    }

function activeLogin(req: express.Request, res: express.Response): void {
    res.status(200).send({
        message: 'User still logged in',
        user: req.session.user, // Send user object to client for greeting message
    });
}

function isValid(rights: Rights) {
    return (req: express.Request, res: express.Response, next) => {
        if (rights > Number(req.session.userID.rights)) {
            res.status(403).send({
                message: 'You are not allowed to do that guery'
            });
        }else {
            next();
        }
    }
}

function login(req: express.Request, res: express.Response):void  {
    const username: string = req.body.username;
    const password: string = cryptoJS.SHA256(req.body.password).toString();

    const data: [string, string]  = [username, password.toString()];
    const query: string = 'SELECT * FROM user WHERE username = ? AND user_password = ?;';

    //const personalID = Math.random().toString(36).substring(1,7);


    connection.query(query, data,(err:MysqlError, rows:any) => {
        if (err) {
            res.status(500).send(
                console.log('not working')
            )
        } else {
            // controle if database send only one row back
            if (rows.length === 1) {
                const userList: User = new User(
                        rows[0].date,
                        rows[0].rights,
                        rows[0].username,
                        rows[0].user_firstName,
                        rows[0].user_secondName,
                        rows[0].user_id);

                req.session.userID = userList;
                localStorage.setItem('username', username);
                if (userList.rights === 3) {
                    const Rights = rows.rights * Math.random()
                    localStorage.setItem('rights', String(Rights))
                }

                if (userList.rights < 3){
                    res.status(200).send({
                        message: 'Sie haben sich erfolgreich angemeldet',
                        username, // Send user object to client for greeting message
                    });
                }

                if (userList.rights === 3 ) {
                    let rights = Math.random() + 35;
                    res.status(200).send( {
                        message: 'Sie haben sich erfolgreich angemeldet',
                        username, // Send user object to client for greeting message
                        rights
                    });
                }

                } else {
                    res.status(401).send({
                        message: 'Email oder Passwort falsch eingegeben.',
                    });
                }
            }
    });
}

function logout(req:express.Request, res:express.Response): void {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(200).send({
            message: 'Erfolgreich abgemeldet',
        })
    });
    localStorage.clear();
}

function getUserList(req: express.Request, res: express.Response): void {

    const query: string = "SELECT * FROM user WHERE rights < 2;";

    connection.query(query, (err: mysql.MysqlError | null, rows: any) => {
        if (err === null) {

            const userList: User [] = [];

            for (const row of rows) {
                userList.push( new User(
                    new Date(row.date),
                    row.rights,
                    row.username,
                    row.user_firstName,
                    row.user_secondName,
                    row.user_id
                ));
            }
            res.status(200);
            console.log('get users server')
            res.send({
                message: 'Nutzerliste erfolgreich aktualisiert',
                userList,
            })
            console.log(userList)
        } else {
            res.sendStatus(500);
            console.log('Data error')
        }
    })
}

function getActUser(req:express.Request, res: express.Response): void {

    // read from url
    const username = localStorage.getItem("username");

    console.log(username)

            if (username) {
                res.status(200);
                res.json(username);
            } else {
            res.sendStatus(500);
            console.log("uuups");
            }
}

function getUser(req:express.Request, res: express.Response): void {

    // read from url
    const data: string = req.params.username;

    // make SQL query for database
    const query: string = "SELECT * FROM user WHERE username = ?;";


    connection.query(query, [data], (err: mysql.MysqlError | null, results: any) => {
        if (err === null) {
            if (results.length === 1) {
                res.status(200);
                res.json(results[0]);
            } else {
                res.sendStatus(404);
            }
        } else {
            res.sendStatus(500);
            console.log("uuups" + err);
        }
    })
}

function updateUser(req: express.Request, res: express.Response): void {
    const username: string = String(req.params.username);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.secondName;
    const password: string = cryptoJS.SHA512(req.body.newPassword).toString();
    //const password: string = cryptoJS.SHA512(req.body.password).toString();

    let data: any;
    let query: string;

    if (firstName && lastName && password) {
        data = [firstName, lastName, password, username];
        query = 'UPDATE user SET user_firstName = ?, user_secondName = ?, user_password = ? WHERE username = ?;';
    }

    connection.query(query, data, (err: MysqlError, result: any) => {
        if (err) {
            // Query could not been executed
            res.status(500).send({
                message: 'Datenbankverbindung fehlgeschlagen: ' + err,
            });
        } else {
            if (result.affectedRows === 1) {
                // The user was updated
                res.status(200).send({
                    message: 'User updated ' + username,
                });
            } else {
                // The user can not be found
                res.status(404).send({
                    message: 'User can not be found',
                });
            }
        }
        console.log(connection.query)
    })
}

function deleteUser(req: express.Request, res: express.Response): void {

    // Read data from request
    const username: any = String(req.params.username);
    // Create database query and data
    const data: any = username;
    const query: string = 'DELETE FROM user WHERE username = ?;';

    // request user from database
    connection.query(query, data, (err: MysqlError, result: any) => {
        if (err) {
            // Database operation has failed
            res.status(500).send({
                message: 'Datenbankverbindung fehlgeschlagen: ' + err,
            });
        } else {
            // Check if database response contains at least one entry
            if (result.affectedRows === 1) {
                res.status(200).send({
                    message: 'Nutzer gelöscht: ' + username,
                });
            } else {
                // No user found to delete
                res.status(404).send({
                    message: 'Der zu löschende Nutzer konnte nicht gefunden werden.',
                });
            }
        }
    });
}

function deleteAllUser(req: express.Request, res: express.Response): void {

    const query: string = 'DELETE FROM user WHERE rights = 0;';

    connection.query(query, (err:MysqlError) => {
        if (err) {
            res.status(500).send({
                message: 'Datenbank error' + err,
            });
        } else {
            res.status(200).send({
                message: 'All User deleted!'
            })
        }
    })
}

function addEvent(req, res):void {



    const eventPublisher = localStorage.getItem("username");
    upload(req, res, (err) => {
        let newE: Events;

        let attributes = req.body.newEvent
        newE = JSON.parse(attributes);

        const eventName: string = newE.eventName;
        const eventDate: string = newE.eventDate;
        const eventDateEnding: string = newE.eventDateEnding;
        const eventHour: string = newE.eventHour;
        const eventHourEnding: string = newE.eventHourEnding;
        const eventDescription: string = newE.eventDescription;
        const eventGenre: string = newE.eventGenre;
        //const eventType: string = req.body.eventType;
        const eventCosts: number = newE.eventCosts;
        const eventPicture: string = req.file.filename


        if (err) {
            res.status(404).send({
                message: 'Not found'
            });
        } else {
            if (req.file == false) {
                res.status(204).send({
                    message: 'Error: No File selected'
                });
            } else {
                //SQL query for database
                let query: string = "INSERT INTO events (eventName, eventDate, eventDateEnding, eventHour, eventHourEnding, eventPublisher, eventDescription, eventGenre, eventCosts, eventPicture)" + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
                let data: [string, string, string, string, string, string, string, string, number, any] = [
                    eventName,
                    eventDate,
                    eventDateEnding,
                    eventHour,
                    eventHourEnding,
                    eventPublisher,
                    eventDescription,
                    eventGenre,
                    eventCosts,
                    eventPicture
                ];
                connection.query(query, data, () => {
                    res.status(200).send({
                        message: 'File uploaded!',
                        file: `uploads/events/${req.file.filename}`
                    })
                })
            }
        }
    })
}


/*
function uploadeventPic(req: express.Request, res: express.Response): void {
    let upload = multer({storage : storage}).single('userfile');
    upload(req, res, (err) => {
        if (err) {
            res.status(401).send("Error uploading failed")
        }else{
            res.status(200).send(req.file)
        }
    })
}

 */

function getEvents(req: express.Request, res: express.Response): void {

    const query: string = "SELECT * FROM events;";

    connection.query(query, (err: mysql.MysqlError | null, rows: any) => {
        if (err === null) {

            const eventList: Events [] = [];

            for (const row of rows) {
                eventList.push( new Events(
                        row.eventName,
                        row.eventDate,
                        row.eventDateEnding,
                        row.eventHour,
                        row.eventHourEnding,
                        row.eventPublisher,
                        row.eventDescription,
                        row.eventGenre,
                        row.eventCosts,
                        row.eventPicture,
                        row.eventID,
                ));
            }
            res.status(200);
            console.log('get events')
            res.send({
                message: 'Events erfolgreich aktualisiert',
                eventList,
            })
            console.log(eventList)
        } else {
            res.sendStatus(500);
            console.log('Data error')
        }
    })
}


/*POST route

router.post("/user", (req: express.Request, res: express.Response) => {
    // Read json
    console.log(req.body);


    const username: string = req.body.username;
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;

    // encrypt to sha512 with crypto-js
    const password: string = cryptoJS.SHA512(req.body.password).toString();
    // control that everything is filled out
    if (username && firstName && lastName && password) {

        // make array data with user data
        const data: [string, string, string, string] = [
            username,
            firstName,
            lastName,
            password
        ];

        //SQL query for database
        const query: string = "INSERT INTO user (username, user_firstName, user_secondName, user_password)" + "VALUES (?, ?, ?, ?);";

        //  database query with array of data
        connection.query(query, data, (err: MysqlError) => {
            if (err) {
                res.status(500).send({
                    message: 'Datenbankverbindung ist fehlgeschlagen',
                })
            } else {
                res.status(201).send({
                    message: 'New User created'
                })
            }
        })
    } else {
        res.status(400).send({
            message: 'Not all mandatory fields are filled in'
        })
    }
});

 */
/*
}
for (const product of productList) {
  if (product.number == number) {
      ok = true;
      res.status(400).send({
          message: 'Duplicate Product ID'
      })

      //break for testing -> no impact
      break;
  }
}
  // wenn req accept json & param control & boolean control
  if (req.get("accept") === "application/json" && name && number && inventory && description && ok == false) {
      // neues Array
      const data: [string, number, number, string] = {
          name,
          number,
          inventory,
          description
      };

      const query: string = "Insert INTO product"
      //push const product
      productList.push(product);
      res.status(200).send ({
          message: 'Product created',
      })
  } else {
      res.status(400).send({
          message: 'Data missing'
      });
  }
});

*/

                // Check for mistakes
                // Duplicated ID or more Data needed => ok = true => do not go in next loop
                /* for (const user of userList) {
                     if (user.username == username) {
                         ok = true;
                         res.status(400).send({
                                 message: 'User already exist'
                             }
                         )
                     }
                 }

             //Abgleich der UserListe, falls username bereits vergeben
             // wenn Vor- und Nachname im body request sind und "boolean Fehlerfalle nicht zugeschnappt" hat, lege neuen Nutzer an
             if (req.get("accept") === "application/json" && firstName && lastName && ok == false) {
                 const user: User = new User(username, firstName, lastName, password);
                 userList.push(user);
                 res.status(201).send(
                     {
                         message: 'User created',
                         user: firstName + ' ' + lastName,
                     })
             } else {
                     //Ansonsten können ja nur nur noch die Daten fehlen - I'm a teapot! :)
                     res.status(418).send({
                         message: 'More Data needed'
                     });
                     console.log('Something WENT wrong')
                 }
         });
         */



                /* for (const user of userList) {
                     if (user.username == data) {
                         ok = true;

                         //userList.indexOf(data, 0)
                         //if (data === user.username.of(userList)) {
                         res.status(200).send({
                             user: user.firstName + ' ' + user.lastName,
                             message: 'User fetched' + ' ' + user.username,
                         });
                         console.log(userList);
                     }
                 }

                 if (ok == false) {
                 res.status(404).send({
                     message: 'User can not be found',
                 })
             }
             }

         );


                router.get("/product/:number?", (req: express.Request, res: express.Response) => {

                    const number: any = req.params.number;

                    let ok: boolean = false;

                    for (let product of productList) {
                        if (product.number === number) {
                            ok = true;
                            res.status(200).send(
                                {
                                    message: 'Product found',
                                    Product: product.name
                                })
                        }
                    }

                    if (ok == false)
                        res.status(404).send({
                            message: 'Product is not found',
                        })
                });
*/


    /*
}
    res.status(200).send ({
        message: "Products found",
        Produkte: productList,
    });
});


router.delete("/user/:username?", (req: express.Request, res: express.Response) => {

    let data: any = req.params.username;
    let ok: boolean = false;

    //userList.indexOf(data, 0)
    for (const user of userList) {
        if (data === user.username) {
            ok = true;
            // position of user in userList
            let i: number = userList.indexOf(user);
            {
                // Entferne 1 ELement von Position i in userList
                userList.splice(i, 1)
            }
        }

        if (ok === true) {
            res.status(200).send({
                message: 'User deleted',
            })
            console.log(userList);
        }
    } if (ok == false)
        res.status(404).send({
            message: 'User is not deleted',
        });
});


router.delete("/product/:number", (req: express.Request, res: express.Response) => {

    let data: any = req.params.number;
    let ok: boolean = false;

    //userList.indexOf(data, 0)
    for (const product of productList) {
        if (data === product.number) {
            ok = true;
            //Search Element product
            let i: number = productList.indexOf(product);
            {
                // delete 1 element in Array at i
                productList.splice(i, 1)
            }
        }

        if (ok === true) {
            res.status(200).send({
                message: 'Product deleted',
            })
        }
    } if (ok == false)  {
            res.status(404).send({
                message: 'Product is not deleted',
            })
        }
});



router.put("/user/:username", (req:express.Request, res:express.Response) => {

    let newUser: User = req.body;

    let ok: boolean = false

    for (const user of userList) {
        if (user.username == newUser.username) {
            ok = true;

            user.firstName = newUser.firstName;
            user.lastName = newUser.lastName;

            res.status(200).send({
                user: user.firstName + ' ' + user.lastName,
                message: 'User changed',
            })
        }
    } if (ok == false) {
            res.status(404).send ({
                message: 'User can not be found'
            })
        }
});




router.put("/product/:number?", (req:express.Request, res:express.Response) => {
// newProdukt is a class of Product
    let newProduct: Product = req.body;

    let ok: boolean = false;

    for (const product of productList) {
        if (product.number == newProduct.number) {
            ok = true;
            product.name = newProduct.name;
            product.description = newProduct.description;
            product.inventory += newProduct.inventory;

            res.status(200).send({
                user: product.name + ' ' + product.number,
                message: 'Product updated',
            })
        }
        console.log(productList);
    } if (ok == false) {
            res.status(404).send ({
                message: 'Product can not be found'
            });
        }
});
*/

/*router.get("/products", (req: express.Request, res: express.Response) => {
    const query: string = "SELECT * FROM products;";

    connection.query(query, (err: mysql.MysqlError | null, results: any) => {
        if (err === null) {
            res.status(200);
            res.send(results)
        } else {
            res.sendStatus(500);
            console.log('Data error')
        }
    })
});

 */

