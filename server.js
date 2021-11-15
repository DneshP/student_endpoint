import express from 'express';
import routes from './routes/index';
import bodyParser from 'body-parser';
import path from 'path';
import fileUpload from 'express-fileupload';

const app = express();
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './assets')));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());

routes(app);

const port = process.env.PORT || 8080;

app.listen(port);
console.log('Yo server is up @ ' + port);
