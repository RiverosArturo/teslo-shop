import { db } from '@/database';
import { User } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs';
import { jwt, validations } from '@/utils';

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
            return registerUser(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request',
            });
    }
    res.status(200).json({ message: 'Example' })
}

const registerUser = async(req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '', name = '' } = req.body as {email: string, password: string, name: string};
        
    if(password.length <6 ){
        return res.status(400).json({message:'La contrseña debe de ser de 6 caracteres o más'});
    }
    
    if(name.length <3 ){
        return res.status(400).json({message:'El nombre debe de ser de 2 caracteres o más'});
    }
    
    //TODO: Validar email
    if( !validations.isValidEmail(email) ){
        return res.status(400).json({message:'El correo no es válido'});
    }

    await db.connect();
    const user = await User.findOne({email});
    if(user){
        await db.disconnect();
        return res.status(400).json({message: 'El correo ya está registrado'});
    }

    const newUser = new User({
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password),
        role: 'client',
        name,
    });

    try {
        await newUser.save({ validateBeforeSave: true });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Revisar logs del servidor'})
    }
    
    //Extramos _id y role de nuestro newUser creado anteriormente
    const { _id, role } = newUser;
    const token = jwt.signToken( _id, email );
    
    res.status(200).json({
        token, //jwt
        user:{
            email, 
            role, 
            name
        }
    })
}
