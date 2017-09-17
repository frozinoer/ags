(Re)initialisation de la database
---------------------------------
db.travelers.drop();
db.travelers.createIndex({"id":1}, {unique:true});
