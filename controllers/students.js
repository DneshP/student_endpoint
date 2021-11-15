import { pool } from '../dbconfig';
import format from 'pg-format';
const csv = require('fast-csv')
import { Readable } from 'stream';

/**
 * Seed data for testing
 */
const seedStudents = () => {
    const list = [
        ['James', 23, 50, 50, 50 ],
        ['Mark', 24, 30, 10, 0 ],
        ['Coach', 27, 60, 20, 10 ],
        ['Jack', 17, 80, 20, 0 ],
        ['Rhody', 26, 10, 10, 0 ],
        ['Nony', 25, 60, 70, 90 ]
    ];
    pool.query(format('INSERT INTO students (name, age, mark1, mark2, mark3) VALUES %L', list), [], (error, results) => {
        if (error) {
            throw error;
        }
    });
}

const seedData = (req, res) => {
    seedStudents();
    res.status(200).json({message: 'Data Inserted'});
}

/**
 * Insert students from csv
 * @param {Object} req 
 * @param {Object} res 
 */
const insertStudents = (req, res) => {
    const insertQuery = 'INSERT INTO students (name, age, mark1, mark2, mark3) VALUES ($1, $2, $3, $4, $5)';
    const parseCsv = () => {
        return new Promise ((resolve, reject) => {
            const students = [];
            Readable.from( req.files.students.data.toString())
            .pipe(csv.parse({ headers: true }))
            .on('error', (error) => reject(error))
            .on('data', (row) => students.push(row)) 
            .on('end', (rowCount) => resolve(students));
        });
    }
    parseCsv().then(students => {
       students.forEach(student => {
           pool.query(insertQuery, [student.name, student.age, student.mark1, student.mark2, student.mark3], (error, results) => {
               if (error) {
                   res.status(500).json({
                       message: 'Internal Server Error'
                   });
                   return;
               }
           });
       });
    }).catch(err => {
        res.status(500).json({
            message: 'Internal Server Error'
        });
        return;
    })
    res.status(200).json({
        message: 'Students Inserted'
    });
}

/** Fetch all students */
const getStudents = (req, res) => {
    let studentList;

    pool.query('SELECT * FROM students', (error, results) => {
        if (error) {
            throw error;
        }
        studentList = results.rows;
    if (req.query.hasOwnProperty('resultStatus') && studentList.length > 0) {
        const resultStatus = req.query.resultStatus.toLowerCase();
        const students = calculatePassFail(studentList);
        if (resultStatus === 'passed') {
            studentList = students.passed;
        } else if (resultStatus === 'failed') {
            studentList = students.failed;
        } else {
            res.status(400).json({
                message: "Bad Request"
            });
            return;
        }
    }
        res.status(200).json(studentList);
    });
}

/** Fetch student result by ID */
const getStudenReportWithId = (req, res) => {
    pool.query('SELECT id, name, mark1, mark2, mark3 FROM students WHERE id = $1', 
            [req.params.studentId], 
            (error, results) => {
                if (error) {
                    throw error;
                }
                res.status(200).json(results.rows);
            });
}

/**
 * splits the students by pass/fail
 * and returns an object
 * @param {Array.<Object>} students 
 * @returns {Object}
 */
const calculatePassFail = (students) => {
    const results = {
        passed: [],
        failed: []
    };
    const isPass = ({mark1, mark2, mark3}) => {
        // 50 considered as pass
        return (parseFloat(mark1) + parseFloat(mark2) + parseFloat(mark3)) / 3 >= 50
    }
    students.forEach(student => {
        if (isPass(student)) {
            results.passed.push(student);
        } else {
            results.failed.push(student);
        }
    });
    return results;
}

module.exports = {
    getStudents,
    getStudenReportWithId,
    seedData,
    insertStudents
}