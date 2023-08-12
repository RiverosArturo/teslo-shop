import { db } from '@/database';
import { User } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { jwt } from '@/utils';

type Data = 
    |{message: string;}
    |{ token: string;
        user: {
            email: string,
            name: string,
            role: string,
        };}
    

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return loginUser(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request',
            });
    }
    res.status(200).json({ message: 'Example' })
}

const loginUser = async(req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = ''} = req.body;
    await db.connect();
        const user = await User.findOne({email});    
    await db.disconnect();

    if(!user){
        return res.status(400).json({message: 'Correo o contraseña no válidos - EMAIL'});
    }
    //regresa true si las contraseñas no son iguales
    if( !bcrypt.compareSync( password, user.password! ) ) {
        return res.status(400).json({message: 'Correo o contraseña no válidos - PASSWORD'});
    }

    const { role, name, _id } = user;
    const token = jwt.signToken( _id, email );
    
    res.status(200).json({
        token, //jwt
        user:{
            email, role, name
        }
    })
}
