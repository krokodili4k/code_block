// <!-- Переменные -->
let Variables = [];

// <!-- Конструкторы -->
function Variable(name, value)
{
    this.name = name
    this.value = value
}

// <!-- Функции -->
function EmptyVars() // <!-- Блок объявления переменных -->
{   
    var Vars = (document.getElementById("block_of_variables").value).split(",")
    for(i in Vars)
    {
        Variables.push(new Variable(Vars[i], 0))
    }
    console.log(Variables)
}



function AddValue()
{
    var Name = document.getElementById("textarea_block_varible").value
    var Value = parseInt(document.getElementById("textarea_block_values").value)
    for(i in Variables)
    {
        if (Name === Variables[i].name)
        {
            Variables[i].value = Value
            break
        }
    }
    console.log(Variables)
}

function Arifmetic(operation, a, b) // <!-- Арифметика  -->
{
    switch(operation)
    {
        case "+":
            
        case "-":
            
        case "*":
            
        case "/":
            
        case "%":

        case "=":
            
    }
}

function If(operation, a, b)
{
    switch(operation)
    {
        case ">":

        case "<":
            
        case "==":
            
        case ">=":
            
        case "<=":

    }
}

function While()
{

}
