const authRoutes = require('./authRoutes');

function route(app) {
    app.use('/', authRoutes);
}

module.exports = route;
