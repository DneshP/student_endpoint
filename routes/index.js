import { 
    getStudents,
    getStudenReportWithId,
    seedData,
    insertStudents
} from "../controllers/students";

const routes = (app) => {
    app.route('/students')
        .get((request, response, next) =>{
            next();
        }, getStudents)
    app.route('/students/:studentId/result')
        .get((request, response, next) => {
            next();
        }, getStudenReportWithId)
    app.route('/portal')
        .get((request, response) =>
            response.render('index', { title: 'Welcome, lets get that csv.'})
        )
    app.route('/upload')
        .post((request, response, next) =>{
            next();
        }, insertStudents)
}

export default routes;
