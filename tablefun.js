const { DataTypes, INTEGER } = require("sequelize");
const { connect } = require("./connectDB.js");
const {sessions} = require("./models");
// const formattedDate = (d) => {
//   return d.toISOString().split("T")[0];
// };

// const joinmatch = async () => {
//   try {
//     // Connect to the database
//     await connect();
//     // Check if a sport with the name "cric" exists
//     const cricketSport = await sports.findOne({
//       where: {
//         sport: "cric",
//       },
//     });

//     // Check if a match for "cric" exists
//     const cricketMatch = await matches.findOne({
//       where: {
//         sport: "cric",
//       },
//     });
//     // console.log(cricketMatch,cricketSport)
//     // If both sport and match are present, create a session
//     if (cricketSport && cricketMatch) {
//       const newSession = await session.create({
//         // Add session details here
//         // For example:
//         sport: "volley",
//         match: cricketMatch.match,
//         admin: "vicky",
//         // Add other session details as needed
//       });

//       console.log(`Session created for cric and match with ID: ${newSession.id}`);
//     } else {
//       console.log("No 'cric' sport or match found.");
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
const creatematch=async ()=>{
  const t=3
  console.log(typeof t)

  await connect();
    const newMatch = await sessions.create({
      sport: 'basketbll',
      match: 'final',
      reason:"d",
      admin:"aslkf"
      // Provide the teamsize value
    });
    // console.log(DataTypes(3))
    console.log(`Match created for cricket with ID: ${newMatch}`);
}

// const createTodo = async () => {
//   try {
//     var dateToday = new Date();
//     const today = formattedDate(dateToday);
//     console.log(today) 
//     await connect();
//     // await session.create({sport:"football",match:"1",admin:"tej93"})
//     const todos = await matches.findAll();
//     const todolist = todos.map((x) => x.displayableString()).join("\n");
//     console.log(`All rows in the table:\n${todolist}`);

//     const todos = await sports.findAll();
//     const todolist = todos.map((sport) => sport.displayableString()).join("\n");
//     console.log(`All rows in the table:\n${todolist}`); 
//   } catch (error) {
//     console.error(error);
//   }
// };




// const printall=async()=>{
//     try{
//     await connect();
//     const todos = await sports.findAll();// table name
//     const todolist = todos.map((sport) => sport.displayableString()).join("\n"); // column name
//     console.log(`All rows in the table:\n${todolist}`); 
//     }
//     catch (error) {
//         console.error(error);
//       }
// }


// const count=async()=>{
//     const totalcount = await sports.count();
//     console.log(` todo items count : ${totalcount}`);
// }

// const getSingleTodo = async () => {
//     try {
//       const todo = await sports.findOne({
//         where: {
//           sport:"dance",
//         },
//         order: [["id", "DESC"]],
//       });
//       console.log(todo.displayableString());
//     } catch (error) {
//       console.error(error);
//     }
//   };

  (async () => {
    // await creatematch();
    // await joinmatch();
    await creatematch();
    // await printall();
    // await count();
    // await getSingleTodo();
  })();
//   const updateItem = async (currentEmail, newEmail) => {
//     try {
//       const [rowsUpdated, [updatedTodo]] = await Todo.update(
//         { email: newEmail },
//         {
//           where: {
//             email: currentEmail,
//           },
//           returning: true, // Include this to get the updated record
//         }
//       );
  
//       if (rowsUpdated > 0) {
//         console.log(updatedTodo.displayableString());
//       } else {
//         console.log(`No todo item found with email: ${currentEmail}`);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

// const updateItem = async (name, newEmail) => {
//     try {
//       const [rowsUpdated, [updatedTodo]] = await Todo.update(
//         { email: newEmail },
//         {
//           where: {
//             uname: name,
//           },
//           returning: true, // Include this to get the updated record
//         }
//       );
  
//       if (rowsUpdated > 0) {
//         console.log("d"+updatedTodo.displayableString());
//       } else {
//         console.log(`No todo item found with name: ${name}`);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

// const destroyItem = async (email, uname) => {
//     try {
//       const destroyedRows = await Todo.destroy({
//         where: {
//           email: email,
//           uname: uname,
//         },
//       });
  
//       if (destroyedRows > 0) {
//         console.log(`Record(s) with email ${email} and uname ${uname} deleted successfully.`);
//       } else {
//         console.log(`No record found with email ${email} and uname ${uname}.`);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

    //  await printall();
//   await count();
//   await getSingleTodo();
//   await updateItem("parimicharantejas@gmail.com","charan@gmail.com")
//   await updateItem("jag", "jeth@gmail.com");
    //  await destroyItem("jeth@gmail.com", "jag");
