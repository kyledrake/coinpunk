/*                                                                             
Copyright (c) 2011, Chris Umbel                                                
                                                                                
Permission is hereby granted, free of charge, to any person obtaining a copy    
of this software and associated documentation files (the "Software"), to deal   
in the Software without restriction, including without limitation the rights    
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       
copies of the Software, and to permit persons to whom the Software is           
furnished to do so, subject to the following conditions:                        
                                                                                
The above copyright notice and this permission notice shall be included in      
all copies or substantial portions of the Software.                             
                                                                                
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN       
THE SOFTWARE.                                                                   
*/

var base32 = require('lib/thirty-two/');

describe('thirty-two', function() {
    it('should encode', function() {
        expect(base32.encode('a')).toBe('ME======');
        expect(base32.encode('be')).toBe('MJSQ====');
        expect(base32.encode('bee')).toBe('MJSWK===');
        expect(base32.encode('beer')).toBe('MJSWK4Q=');
        expect(base32.encode('beers')).toBe('MJSWK4TT');
        expect(base32.encode('beers 1')).toBe('MJSWK4TTEAYQ====');
        expect(base32.encode('shockingly dismissed')).toBe('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE');        
    });
    
    it('should decode', function() {
        expect(base32.decode('ME======')).toBe('a');
        expect(base32.decode('MJSQ====')).toBe('be');
        expect(base32.decode('ONXW4===')).toBe('son');
        expect(base32.decode('MJSWK===')).toBe('bee');
        expect(base32.decode('MJSWK4Q=')).toBe('beer');
        expect(base32.decode('MJSWK4TT')).toBe('beers');
        expect(base32.decode('MJSWK4TTN5XA====')).toBe('beerson');
        expect(base32.decode('MJSWK4TTEAYQ====')).toBe('beers 1');
        expect(base32.decode('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE')).toBe('shockingly dismissed');
    });
});
