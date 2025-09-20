import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { sendOTP, generateOTP } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { phone, name } = await request.json();

    if (!phone || !name) {
      return NextResponse.json(
        { error: 'Phone number and name are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format (e.g., +1234567890)' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry

    // Create new user
    const user = new User({
      phone,
      name,
      otpCode: otp,
      otpExpiry,
    });

    await user.save();

    // Send OTP
    const smsResult = await sendOTP(phone, otp);
    
    if (!smsResult.success) {
      // Delete user if SMS failed
      await User.findByIdAndDelete(user._id);
      
      // Return specific error message based on the error
      const errorMessage = smsResult.error && 
        typeof smsResult.error === 'object' && 
        'code' in smsResult.error && 
        smsResult.error.code === 21211
        ? 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)'
        : 'Failed to send OTP. Please check your phone number and try again.';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Registration successful. Please verify your phone number.',
      userId: user._id,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}