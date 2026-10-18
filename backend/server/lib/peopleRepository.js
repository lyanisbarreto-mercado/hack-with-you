const mongoose = require("mongoose");
const { publicProfileFields } = require("./profileView");
const projection = Object.fromEntries(
  publicProfileFields.split(" ").map((field) => [field, 1]),
);
function collection() {
  // Reuse the authenticated MongoDB client, but read the separately imported dataset.
  return mongoose.connection.getClient().db("user").collection("People");
}
async function listPeople() {
  return collection().find({}, { projection }).toArray();
}
async function findPerson(id) {
  return collection().findOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { projection },
  );
}
module.exports = { listPeople, findPerson };
