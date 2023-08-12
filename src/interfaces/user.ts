export interface IUser{
    _id: string;
    name: string;
    email: string;
    //No lo tendremos en el frontend
    password?: string;
    role: string;

    createdAt?: string;
    updatedAt?: string;
}
