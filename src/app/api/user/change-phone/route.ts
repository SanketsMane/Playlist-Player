import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { sendOTP, generateOTP } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { newPhone } = await request.json();

    if (!newPhone) {
      return NextResponse.json(
        { error: 'New phone number is required' },
        { status: 400 }
      );
    }

    // Check if the new phone number is already in use
    const existingUser = await User.findOne({ 
      phone: newPhone,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This phone number is already in use' },
        { status: 400 }
      );
    }

    // Generate OTP for phone verification
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry

    // Store the new phone temporarily with OTP
    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    // Store new phone in a temporary field (you might want to add this to schema)
    await user.save();

    // Send OTP to new phone number
    const smsResult = await sendOTP(newPhone, otp);
    
    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP to new phone number' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent to new phone number. Please verify to complete the change.',
      userId: user._id,
    });

  } catch (error) {
    console.error('Change phone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}