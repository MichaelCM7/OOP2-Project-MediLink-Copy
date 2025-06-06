// package com.MediLink.OOP2_Project_MediLink.util;

// import com.mongodb.ConnectionString;
// import com.mongodb.MongoClientSettings;
// import com.mongodb.MongoException;
// import com.mongodb.ServerApi;
// import com.mongodb.ServerApiVersion;
// import com.mongodb.client.MongoClient;
// import com.mongodb.client.MongoClients;
// import com.mongodb.client.MongoDatabase;
// import org.bson.Document;

// public class MongoClientConnection{
//     public static void main(String[] args) {
//         String connectionString = "mongodb+srv://<munenecaleb>:<munenecaleb>@cluster0.o2insta.mongodb.net/MedilinkData?retryWrites=true&w=majority&appName=Cluster0";

//         ServerApi serverApi = ServerApi.builder()
//                 .version(ServerApiVersion.V1)
//                 .build();

//         MongoClientSettings settings = MongoClientSettings.builder()
//                 .applyConnectionString(new ConnectionString(connectionString))
//                 .serverApi(serverApi)
//                 .build();

//         // Create a new client and connect to the server
//         try (MongoClient mongoClient = MongoClients.create(settings)) {
//             try {
//                 // Send a ping to confirm a successful connection
//                 MongoDatabase database = mongoClient.getDatabase("MedilinkTrial");
//                 database.runCommand(new Document("ping", 1));
//                 System.out.println("Pinged your deployment. You successfully connected to MongoDB!");
//             } catch (MongoException e) {
//                 e.printStackTrace();
//             }
//         }
//          try (MongoClient mongoClient = MongoClients.create(settings)) {
//             try {
//                 // Connect to your database
//                 MongoDatabase database = mongoClient.getDatabase("MedilinkTrial");

//                 // Insert a document into the "admin" collection
//                 Document adminDoc = new Document("firstName", "John")
//                         .append("lastName", "Doe")
//                         .append("email", "john.doe@example.com")
//                         .append("phone", "1234567890")
//                         .append("password", "password123");

//                 database.getCollection("admin").insertOne(adminDoc);

//                 System.out.println("Inserted admin document into the database!");

//                 // Optional: Ping to confirm connection
//                 database.runCommand(new Document("ping", 1));
//                 System.out.println("Pinged your deployment. You successfully connected to MongoDB!");
//             } catch (MongoException e) {
//                 e.printStackTrace();
//             }
//         }
//     }
// }
