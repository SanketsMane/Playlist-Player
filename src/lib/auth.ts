import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-otpCode -otpExpiry');
    
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}