// const colors = require("colors");
// const app = require("./app");
// const socket = require("./socket");
// const { createServer } = require("http");
// const server = createServer(app);
// const port = parseInt(process.env.PORT, 10) || 6001;

// socket(server);
// server.listen(port, () => {
//   console.log(
//     colors.yellow.bold(
//       `--------------------------------------------------------`
//     )
//   );
//   console.log(colors.yellow.bold(`App is running on port : ${port}`));
//   console.log(
//     colors.yellow.bold(`Current Environment : ${process.env.NODE_ENV}`)
//   );
//   console.log(
//     colors.yellow.bold(
//       `--------------------------------------------------------`
//     )
//   );
// });
// //commit test

const colors = require("colors");
const app = require("./app");
const { createServer } = require("http");
const socket = require("./socket");

const port = parseInt(process.env.PORT, 10) || 6001;
const server = createServer(app);

// Initialize socket.io
socket(server);

// Start server
server.listen(port, () => {
  console.log(
    colors.yellow.bold(
      "--------------------------------------------------------"
    )
  );
  console.log(colors.yellow.bold(`App is running on port : ${port}`));
  console.log(
    colors.yellow.bold(`Current Environment : ${process.env.NODE_ENV}`)
  );
  console.log(
    colors.yellow.bold(
      "--------------------------------------------------------"
    )
  );
});
