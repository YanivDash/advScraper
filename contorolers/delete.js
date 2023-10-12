import db from "../database/dbConnection.js";

const deleteDuplicate = async (id) => {
  const sql = `DELETE FROM mangalist WHERE id = ?`;
  try {
    const result = await new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting database connection:", err);
          reject(err);
          return res.status(400).json({ error: "Invalid request data." });
        }
        connection.query(sql, [id], (error, result) => {
          connection.release();

          if (error) {
            console.error("Error executing the query:", error);
            const message = "error executing the query in delete.js";
            reject(error);
          }
          const message = "deleted succesfully";
          resolve(result);
          return message;
        });
      });
    });

    if (result) {
      const message = `successfully deleted from dataBase`;
      console.log(result);
      return message;
    } else {
      return "could not delete ";
    }
  } catch (error) {
    console.log(error);
    const message = `error while inserting to database`;
    return message;
  }

  return;
};

export default deleteDuplicate;
