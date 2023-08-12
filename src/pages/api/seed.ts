import { db, initialData } from '@/database'
import { Product, User } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    //Condicion para que no se pueda purgar la base de datos en produccion:    
    if( process.env.NODE_ENV === 'production' ){
        return res.status(401).json({ message: 'No tiene acceso a este servicio'});
    }

    await db.connect();
        await User.deleteMany();
        await User.insertMany( initialData.users );
        await Product.deleteMany();
        await Product.insertMany( initialData.products );
    await db.disconnect();

    res.status(200).json({ message: 'Proceso realizado correctamente' });
}

