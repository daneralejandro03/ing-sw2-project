export interface MongoDbObject {
    _id?: string;
    $oid?: string;
    [key: string]: any;
}
