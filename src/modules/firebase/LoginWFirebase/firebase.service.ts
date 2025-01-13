import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../models/user.schema';
import { Model } from 'mongoose';
import axios from 'axios';


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
          return { email: existingUser.username };
      }
      const hashedPassword = uid;
      const newUser = new this.userModel({
        username:email,
        password:hashedPassword,
        role:'user',
        answer_security:'0',
      })

      await newUser.save();
      return { email: newUser.username };

    } catch (error) {
      throw new Error('Unauthorized');
    }
  }

  getAdminApp(): admin.app.App {
    return admin.app(); 
  }


  async verifyFacebookToken(token: string) {
    try {
      // Gọi Facebook Graph API để xác minh token
      const response = await axios.get(
        `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`
      );

      // Trả về thông tin người dùng từ Facebook
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error verifying Facebook token:', error);
      return {
        success: false,
        message: 'Invalid token or error with Facebook API',
      };
    }
  }
}