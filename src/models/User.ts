import { IUser } from '@/interfaces';
import mongoose,{ Schema, model, Model } from 'mongoose';

const userSchema = new Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String, 
        enum: {
            values: ['admin','client','super-user','SEO'],
            message: '{VALUE} no es un role válido',
            default: 'client',
            required: true,
        }
    }
}, {
    //Para ver cuando se inserta/actualiza el usuario:
    timestamps: true
});

//Modelo en mongoose:
const User:Model<IUser> = mongoose.models.User || model('User', userSchema );

export default User;
