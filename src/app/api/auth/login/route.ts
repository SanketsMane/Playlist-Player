import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { sendOTP, generateOTP } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ phone });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry

    // Update user with new OTP
    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    const smsResult = await sendOTP(phone, otp);
    
    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully. Please verify your phone number.',
      userId: user._id,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}