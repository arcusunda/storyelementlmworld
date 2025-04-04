import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getCollection(collectionName: string): Promise<Collection> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_NAME);
  return db.collection(collectionName);
}
