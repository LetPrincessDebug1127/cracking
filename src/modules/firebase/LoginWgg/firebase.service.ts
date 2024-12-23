import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../models/user.schema';
import { Model } from 'mongoose';


@Injectable()
export class FirebaseAdminService {
constructor(
  @InjectModel(User.name) private readonly userModel: Model<User>,
) {
  const serviceAccount = require('../../../../zhu-zhu-b4c42-firebase-adminsdk-uxn3k-1ed80268dd.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      // return decodedToken; 

      // const { userData } = decodedToken;
      const { email, uid } = decodedToken;
      const existingUser = await this.userModel.findOne({ email: email }); 
       if (existingUser) {
          return { message: `Chúc mừng bạn đã đăng nhập thành công với vai trò user!` };
      }
      const hashedPassword = uid;
      const newUser = new this.userModel({
        username:email,
        password:hashedPassword,
        role:'user',
        answer_security:'0',
      })

      await newUser.save();
      return { message: `Chúc mừng ${newUser.username}, bạn đã đăng ký thành công với vai trò user!` };

    } catch (error) {
      throw new Error('Unauthorized');
    }
  }

  getAdminApp(): admin.app.App {
    return admin.app(); 
  }
}