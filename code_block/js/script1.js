// <!-- Переменные -->
let Variables = [];

// <!-- Конструкторы -->
function Variable(name, value)
{
    this.name = name
    this.value = value
}

// <!-- Вспомогательные функции -->
function GetVar(a)
{
    for(i in Variables)
        {
            if (a === Variables[i].name)
            {
                return Variables[i]
        
            }
        }
}

function FindIndOfVarByName(a)
{
    for(i in Variables)
    {
        if (a === Variables[i].name)
        {
            return i 
        }
    } 
}

function FindIndOfVarByVar(a)
{
    for(i in Variables)
    {
        if (a === Variables[i])
        {
            return i 
        }
    } 
}

function ListOfVars()
{
    console.log(Variables)
}

// <!-- Основные функции -->
function EmptyVars() // <!-- Блок объявления переменных -->
{   
    var Vars = (document.getElementById("input_block_varible").value).split(",")
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

function Arifmetic() // <!-- Проостая арифметика  -->
{
    var First = document.getElementById("input1_arif_block").value
    var Second = document.getElementById("input2_arifm_block").value
    var operation = document.getElementById("zaebalo_arifm_block").value
    First = Variables[FindIndOfVarByName(First)]
    Second = Variables[FindIndOfVarByName(Second)] 
    switch(operation)
    {
        case "+":
            console.log(First.value + Second.value)
            return First.value + Second.value
        case "-":
            console.log(First.value - Second.value)
            return First.value - Second.value
        case "*":
            console.log(First.value * Second.value)
            return First.value * Second.value
        case "/":
            console.log(First.value / Second.value)
            return First.value / Second.value
        case "%":
            console.log(First.value % Second.value)
            return First.value % Second.value
        case "=":
            SecondValue = Variables[FindIndOfVarByVar(Second)].value
            Variables[FindIndOfVarByVar(First)].value = SecondValue
            console.log(Variables)
    }
  
}

function If(operation, a, b)
{
    var First = document.getElementById("varible1_condition_block").value
    var Second = document.getElementById("varible2_condition_block").value
    var operation = document.getElementById("selector_condition_block").value
    First = Variables[FindIndOfVarByName(First)]
    Second = Variables[FindIndOfVarByName(Second)]
    switch(operation)
    {
        case ">":
            return First.value > Second.value
        case "<":
            return First.value < Second.value
        case "==":
            return First.value === Second.value
        case ">=":
            return First.value >= Second.value
        case "<=":
            return First.value <= Second.value
    }
}

function While()
{

}


