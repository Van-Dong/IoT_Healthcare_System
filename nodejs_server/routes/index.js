const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes')

function route(app) {
    app.use('/', authRoutes);
    app.use('/health', healthRoutes)
}

module.exports = route;
