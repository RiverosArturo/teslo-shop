import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { db } from '@/database';
import { IOrder } from '@/interfaces';
import { Order, Product } from '@/models';


type Data = 
    |{ message: string }
    | IOrder

export default function handle(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch( req.method ){
        case 'POST':
            return createOrder( req, res );
        
        default: 
        return res.status(400).json({message: 'Bad request'});
    }
}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    //obtenemos orderItems y total de nuestra orden
    const { orderItems, total } = req.body as IOrder;

    //verificar que tengamos un usuario:
    //en la req van las cookies y en las cookies va la info de la session
    const session: any = await getToken({req});
    
    //verificamos que tengamos una sesion del usuario
    if( !session ){
        return res.status(401).json({message: 'Tiene que estar autenticado para hacer esto'});
    }

    //validar precios y existencia de productos con los de la orden:
    //arreglo de _ids/productos
    const productsIds = orderItems.map( product => product._id );
    await db.connect();
    //Buscamos los productos con _ids que existan en productsIds
    const dbProducts = await Product.find({ _id: productsIds })
    // console.log(dbProducts);
    try {
        //Obtenemos el valor actual del producto y lo comparamos con lo que nos mando la peticion del usuario
        const subTotal = orderItems.reduce( (prev, current) => {
            const currentPrice = dbProducts.find( prod => prod.id === current._id )?.price;

            if(!currentPrice){
                throw new Error('Verifique el carrito de nuevo, producto no existe');
            }

            return (currentPrice*current.quantity) + prev;
        }, 0 );

        const taxRate = Number(process.env.TAX_RATE || 0);
        const backendTotal = subTotal * ( taxRate + 1 );
        //Si el total que obtenemos de la db es diferente al que nos manda la peticion del usuario
        //quiere decir que estan manipulando la db
        if( total !== backendTotal ){
            throw new Error('El total no cuadra con el monto');
        }

        // Todo va bien hasta aquí
        //creamos nuestra orden en la base de datos:
        const userId = session.user._id;
        const newOrder = new Order({ ...req.body, isPaid: false, user: userId });
        //Redondeamos el total a dos decimales
        newOrder.total = Math.round( newOrder.total * 100 ) / 100;

        await newOrder.save();
        await db.disconnect();
        return res.status(201).json(newOrder);
    } catch (error:any) {
        await db.disconnect();
        console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor',
        })
    }
    // return res.status(201).json( session.user );
}

