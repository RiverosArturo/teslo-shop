import { Address, ISize, IUser } from "./";

export interface IOrder {
    _id?: string;
    user?: IUser | string;
    orderItems: IOrderItem[];
    shippingAddress: Address;
    paymentResult?: string;
    
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;

    isPaid: boolean;
    paidAt?: string;

    //Sirve para saber como se pago, con tarjeta de credito, etc
    transactionId: string;

    createdAt?: string;
    updatedAt?: string;
}

export interface IOrderItem {
    _id: string;
    title: string;
    size: ISize;
    quantity: number;
    slug: string;
    image: string;
    price: number;
    gender: string;
}