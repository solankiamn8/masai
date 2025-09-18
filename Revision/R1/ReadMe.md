1. getTotal.js
i.e

'''
In the given incorrect code, they had give function returning function, and incrementing the total value using the this keyword.

Problem: The problem that occured was while executing till the first fn, everything was fine. After executing it returns the fn(y) {...} but this y directs towards this.total and here the this points to this (in js, obj.method() -> this = obj while, justFunction() -> this = undefined/global (strict/sloppy))

Solution:
declaring a variable that stores this, this does two things, this will point to the obj (this = obj) and creates a closure. since a variable is declared and so when the inner function wants to update the value of the this.total += y/z they can
'''

2.predictOutput.js

Output:
undefined
undefined
200

Why?
in Outer,
since var is defined inside outer(), it is hoisted as undefined;
function outer(){
    var data;
    console.log("Outer: ", data)
    data = 100
}
It becomes like this, same story for inner

But in deep, there is no var defined inside the fn, so it goes outside and checks and finds data=200 in inner.

3. thisfunction.js

Here what happens is the printName's this refers to the surrounding lexical scope, here that is the modulo/global scope,
and this = undefined

To avoid this we can either use a function expression, or a shorthand syntax

4. counter.js
Here the function does not inherit the this and points at the global this (this = undefined) and thus the initial output was NaN;
if we make the returned function an arrow functional, it will inherit this from its surrounding scope; i.e the this inside arrow function will be the same as this inside the start fn