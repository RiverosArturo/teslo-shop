import type { NextApiRequest, NextApiResponse } from 'next';
import { isValidObjectId } from 'mongoose';

import { v2 as cloudinary } from 'cloudinary';
cloudinary.config( process.env.CLOUDINARY_URL || '' );

import { db } from '@/database';
import { IProduct } from '@/interfaces';
import { Product } from '@/models';


type Data = 
    | { message: string }
    | IProduct[]
    | IProduct

export default function handle(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch( req.method ){
        case 'GET':
            return getProductsBySlug(req, res);

        case 'POST':
            return createProduct( req, res );

        case 'PUT':
            return updateProduct( req, res );
        
        default:
            return res.status(400).json({ message: 'Bad request' })
    }
}

const getProductsBySlug = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await db.connect();
    const products = await Product.find().sort({title: 'asc'}).lean();
    await db.disconnect();
    
    const updatedProducts = products.map( product => {
        //Procesamiento de las imagenes cuando las subamos
        product.images = product.images.map( img => {
            return img.includes('http') ? img : `${process.env.HOST_NAME}/products/${img}`
        })

        return product;
    })
    
    res.status(200).json(updatedProducts);
}

const updateProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const { _id = '', images = [] } = req.body as IProduct;

    if( !isValidObjectId(_id)) return res.status(400).json({message:'El id del producto no es valido'});
    if( images.length < 2 ) return res.status(400).json({message:'Es necesario al menos dos imagenes'});
    //TODO: posiblemente tendremos un localhost:3000/products/asdas.jpg
    try {
        await db.connect();
        const product = await Product.findById(_id);
        if(!product){
            await db.disconnect();
            return res.status(400).json({message:'No existe un producto con ese id'});
        }
        //TODO: eliminar imagenes en Cloudinary:
        //https://res.cloudinary.com/curso-udemy-prueba/image/upload/v1692144495/izitytt0jrfv4zbsff8y.jpg
        product.images.forEach( async(image) => {
            if(!images.includes(image)){
                //borrar de cloudinary:
                //Eliminamos todo lo que este antres del ultimo / y con el +1 el / tambien
                //Con el split terminamos creando un [] = [izitytt0jrfv4zbsff8y, jpg]
                const [ fileId, extension ]= image.substring( image.lastIndexOf('/') + 1).split('.');
                console.log({image, fileId, extension});
                await cloudinary.uploader.destroy(fileId);
            }
        })
        await product.updateOne( req.body );
        await db.disconnect();
        return res.status(200).json(product);
    } catch (error) {
        console.log(error);
        await db.disconnect();
        return res.status(400).json({message:'Revisar la consola del servidor'});
    }
}

const createProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { images = [] }= req.body as IProduct;

    if( images.length <2 ) return res.status(400).json({message: 'El producto necesita al menos dos imagenes.'});
    //TODO: posiblemente tendremos un localhost:3000/products/asdas.jpg
    try {
        await db.connect();
        const productInDB = await Product.findOne({slug: req.body.slug });
        if(productInDB) {
            await db.disconnect();
            return res.status(400).json({message: 'Ya existe un producto con este slug'});
        }
        const product = new Product( req.body );
        product.save();
        await db.disconnect();
        res.status(201).json(product);
    } catch (error) {
        console.log(error);
        await db.disconnect();
        return res.status(400).json({message: 'Revisar logs del servidor'});
    }
}

