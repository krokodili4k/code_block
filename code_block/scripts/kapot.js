import * as P from "./HardArrifmetic.js";
let storage = []
const but = document.getElementById("run-program-btn");
function run() 
{
   console.log(P.Calculate(P.parseExpression("1+7-(3*4)*5"), storage))
}
but.addEventListener("click", run);