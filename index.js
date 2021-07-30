const init = require('./app')

const port = process.env.PORT || 5000;

(async() => {
    const app = await init()
    app.listen(port, () => {
      console.log(`AppArCar Backend listening at http://localhost:${port}, connected to the DB`);
    });
})()
