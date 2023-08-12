import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import mongoose from 'mongoose';
import { db } from '@/database';
import { IPaypal } from '@/interfaces';
import { Order } from '@/models';



type Data = {
    message: string
}

export default function handle(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch( req.method){
        case 'POST':
            return payOrder(req, res );
        
        default: 
            return res.status(400).json({ message: 'Bad request' });
    }
}

const getPaypalBearerToken = async():Promise<string|null> => {
    const PAYPAL_CLIENT= process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET= process.env.PAYPAL_SECRET;

    //Llave de acceso
    const base64Token = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`, 'utf-8').toString('base64');
    
    //tiene que estar en formato x-www-form-urlencoded
    const body = new URLSearchParams('grant_type=client_credentials');
    
    try {
        const {data} = await axios.post(process.env.PAYPAL_OAUTH_URL || '', body, {
            headers: {
                'Authorization': `Basic ${base64Token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        //Si todo sale bien obtenemos nuestro token de acceso:
        return data.access_token;
    } catch (error) {
        if( axios.isAxiosError(error)) {
            console.log(error.response?.data);
        }else{
            console.log(error);
        }

        return null;
    }
}

const payOrder= async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    //Obtenemos token de validacion desde el backend
    const paypalBearerToken = await getPaypalBearerToken();

    if(!paypalBearerToken){
        return res.status(400).json({message: 'No se pudo confirmar el token de Paypal'});
    }
    
    //TransactionId es de Paypal y el orderId es el id de nuestra orden en nuestra db
    const { transactionId='', orderId='' } = req.body;

    if( !mongoose.isValidObjectId(orderId) ){
        return res.status(400).json({message: 'El id de Mongo, no es valido'});
    }
    
    //Peticion a paypal para ver si este orderId esta pagado
    const { data } = await axios.get<IPaypal.PaypalOrderStatusResponse>(`${process.env.PAYPAL_ORDERS_URL}/${transactionId}`,{
        headers: {
            'Authorization': `Bearer ${paypalBearerToken}`
        }
    });
    
    // Si el status es diferente de completed la transaccion no esta marcada como pagada
    if( data.status !== 'COMPLETED' ){
        return res.status(401).json({message: 'Orden no reconocida'});
    }

    await db.connect();
    const dbOrder = await Order.findById(orderId);

    if(!dbOrder){
        await db.disconnect();
        return res.status(400).json({message: 'Orden no existe en nuestra base de datos'});
    }
    
    //Si el total a pagar de paypal es diferente al de mi orden en la db
    if( dbOrder.total !== Number(data.purchase_units[0].amount.value) ){
        await db.disconnect();
        return res.status(400).json({message: 'Los montos de paypal y nuestra orden no son iguales'});
    }
    
    //Si todo lo anterior sale bien nuestra orden pasara a true en pagada
    //Llenamos el transactionId de nuestra orden con el transactionId que nos mandaron de Paypal
    dbOrder.transactionId = transactionId;
    dbOrder.isPaid = true;
    //Guardamos los cambios en nuestra orden:
    dbOrder.save();

    await db.disconnect();


    //Generar token de acceso para ver paypal
    return res.status(200).json({message: 'Orden Pagada'});
}
