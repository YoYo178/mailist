import type mongoose from 'mongoose';

export interface IBaseMongoDocument {
  _id: mongoose.Types.ObjectId;
}
export type TMongoFields = keyof IBaseMongoDocument;

export interface IBaseMongoDocumentWithTimestamp extends IBaseMongoDocument {
  createdAt: Date;
  updatedAt: Date;
}
export type TMongoFieldsWithTimestamp = TMongoFields | keyof IBaseMongoDocumentWithTimestamp;

export interface IBaseMongoDocumentWithExpiry extends IBaseMongoDocumentWithTimestamp {
  expiresAt: Date;
}
export type TMongoFieldsWithExpiry = TMongoFields | keyof IBaseMongoDocumentWithExpiry;
