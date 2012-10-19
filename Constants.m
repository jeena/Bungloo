//
//  Constants.m
//  Tentia
//
//  Created by Jeena on 01.05.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "Constants.h"


@implementation Constants

+ (NSString *)stringFromVirtualKeyCode:(NSInteger)code {
	NSString *string = nil;
	switch (code) {
		case kVK_ANSI_A:
			string = @"A";
			break;
		case kVK_ANSI_S:
			string = @"S";
			break;
		case kVK_ANSI_D:
			string = @"D";
			break;
		case kVK_ANSI_F:
			string = @"F";
			break;
		case kVK_ANSI_H:
			string = @"H";
			break;
		case kVK_ANSI_G:
			string = @"G";
			break;
		case kVK_ANSI_Z:
			string = @"Z";
			break;
		case kVK_ANSI_X:
			string = @"X";
			break;
		case kVK_ANSI_C:
			string = @"C";
			break;
		case kVK_ANSI_V:
			string = @"V";
			break;
		case kVK_ANSI_B:
			string = @"B";
			break;
		case kVK_ANSI_Q:
			string = @"Q";
			break;
		case kVK_ANSI_W:
			string = @"W";
			break;
		case kVK_ANSI_E:
			string = @"E";
			break;
		case kVK_ANSI_R:
			string = @"R";
			break;
		case kVK_ANSI_Y:
			string = @"Y";
			break;
		case kVK_ANSI_T:
			string = @"T";
			break;
		case kVK_ANSI_1:
			string = @"1";
			break;
		case kVK_ANSI_2:
			string = @"2";
			break;
		case kVK_ANSI_3:
			string = @"3";
			break;
		case kVK_ANSI_4:
			string = @"4";
			break;
		case kVK_ANSI_6:
			string = @"6";
			break;
		case kVK_ANSI_5:
			string = @"5";
			break;
		case kVK_ANSI_Equal:
			string = @"=";
			break;
		case kVK_ANSI_9:
			string = @"9";
			break;
		case kVK_ANSI_7:
			string = @"7";
			break;
		case kVK_ANSI_Minus:
			string = @"-";
			break;
		case kVK_ANSI_8:
			string = @"8";
			break;
		case kVK_ANSI_0:
			string = @"0";
			break;
		case kVK_ANSI_RightBracket:
			string = @")";
			break;
		case kVK_ANSI_O:
			string = @"0";
			break;
		case kVK_ANSI_U:
			string = @"U";
			break;
		case kVK_ANSI_LeftBracket:
			string = @"(";
			break;
		case kVK_ANSI_I:
			string = @"I";
			break;
		case kVK_ANSI_P:
			string = @"P";
			break;
		case kVK_ANSI_L:
			string = @"L";
			break;
		case kVK_ANSI_J:
			string = @"J";
			break;
		case kVK_ANSI_Quote:
			string = @"\"";
			break;
		case kVK_ANSI_K:
			string = @"K";
			break;
		case kVK_ANSI_Semicolon:
			string = @";";
			break;
		case kVK_ANSI_Backslash:
			string = @"\\";
			break;
		case kVK_ANSI_Comma:
			string = @",";
			break;
		case kVK_ANSI_Slash:
			string = @"/";
			break;
		case kVK_ANSI_N:
			string = @"N";
			break;
		case kVK_ANSI_M:
			string = @"M";
			break;
		case kVK_ANSI_Period:
			string = @".";
			break;
		case kVK_ANSI_Grave:
			string = @"`";
			break;
		case kVK_ANSI_KeypadDecimal:
			string = @".";
			break;
		case kVK_ANSI_KeypadMultiply:
			string = @"*";
			break;
		case kVK_ANSI_KeypadPlus:
			string = @"+";
			break;
		case kVK_ANSI_KeypadClear:
			string = @"";
			break;
		case kVK_ANSI_KeypadDivide:
			string = @"/";
			break;
		case kVK_ANSI_KeypadEnter:
			string = @"⎆";
			break;
		case kVK_ANSI_KeypadMinus:
			string = @"-";
			break;
		case kVK_ANSI_KeypadEquals:
			string = @"=";
			break;
		case kVK_ANSI_Keypad0:
			string = @"0";
			break;
		case kVK_ANSI_Keypad1:
			string = @"1";
			break;
		case kVK_ANSI_Keypad2:
			string = @"2";
			break;
		case kVK_ANSI_Keypad3:
			string = @"3";
			break;
		case kVK_ANSI_Keypad4:
			string = @"4";
			break;
		case kVK_ANSI_Keypad5:
			string = @"5";
			break;
		case kVK_ANSI_Keypad6:
			string = @"6";
			break;
		case kVK_ANSI_Keypad7:
			string = @"7";
			break;
		case kVK_ANSI_Keypad8:
			string = @"8";
			break;
		case kVK_ANSI_Keypad9:
			string = @"9";
			break;
		default:
            string = nil;
			break;
	}
	
	return string;
}

@end
