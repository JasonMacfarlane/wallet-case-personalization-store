import { Injectable } from '@angular/core';

// Source: https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js

@Injectable({
  providedIn: 'root'
})
export class Base64BinaryService {
  private readonly keyString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  constructor() { }

  decodeArrayBuffer(input: string): ArrayBuffer {
		const bytes = (input.length / 4) * 3;
    const ab = new ArrayBuffer(bytes);
    
		this._decode(input, ab);
		
		return ab;
  }

  private _removePaddingChars(input: string) {
		var lkey = this.keyString.indexOf(input.charAt(input.length - 1));
		
		if (lkey == 64){
			return input.substring(0,input.length - 1);
		}

		return input;
	};

  private _decode(input: string, arrayBuffer: any) {
		// Get last chars to see if are valid
		input = this._removePaddingChars(input);
		input = this._removePaddingChars(input);

		const bytes = Math.floor((input.length / 4) * 3);
		
		let uarray;
		let chr1, chr2, chr3;
		let enc1, enc2, enc3, enc4;
		let i = 0;
		let j = 0;
		
		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);
		
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		for (i=0; i<bytes; i+=3) {	
			enc1 = this.keyString.indexOf(input.charAt(j++));
			enc2 = this.keyString.indexOf(input.charAt(j++));
			enc3 = this.keyString.indexOf(input.charAt(j++));
			enc4 = this.keyString.indexOf(input.charAt(j++));
	
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
	
      uarray[i] = chr1;			
      
			if (enc3 != 64) {
        uarray[i+1] = chr2;
      }

			if (enc4 != 64) {
        uarray[i+2] = chr3;
      }
		}
	
		return uarray;	
	}
}
