import { db } from '@/database'
import { IProduct } from '@/interfaces';
import { Product } from '@/models'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = 
    | { message: string }
    | IProduct

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return getProductBySlug( req, res );
    
        default:
            return res.status(400).json({
                message: 'Bad request'
            });
    }
}

const getProductBySlug = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    await db.connect();
        const {slug} = req.query;
        const product = await Product.findOne({slug}).lean();
    await db.disconnect();

    if( !product ){
        return res.status(400).json({message: 'Producto no encontrado'});
    }

    //Procesamiento de las imagenes cuando las subamos
    product.images = product.images.map( img => {
        return img.includes('http') ? img : `${process.env.HOST_NAME}/products/${img}`
    })

    return res.status(200).json(product);
}
